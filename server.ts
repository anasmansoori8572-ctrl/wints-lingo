import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let s3ClientInstance: S3Client | null = null;

function getBackblazeConfig() {
  const bucket = process.env.B2_BUCKET_NAME?.trim();
  const rawEndpoint = process.env.B2_ENDPOINT?.trim();
  const endpoint = (!rawEndpoint || rawEndpoint === "-" || !rawEndpoint.includes("backblazeb2.com"))
    ? "s3.us-east-005.backblazeb2.com"
    : rawEndpoint;
  const keyId = process.env.B2_KEY_ID?.trim();
  const appKey = process.env.B2_APPLICATION_KEY?.trim();

  if (!bucket || !keyId || !appKey) {
    return null;
  }

  const cleanEndpoint = endpoint.replace(/^https?:\/\//, "");
  const formattedEndpoint = `https://${cleanEndpoint}`;
  const regionMatch = cleanEndpoint.match(/^s3\.([a-z0-9-]+)\.backblazeb2\.com/i);
  const region = regionMatch ? regionMatch[1] : "us-east-005";

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      endpoint: formattedEndpoint,
      region,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: appKey,
      },
    });
  }

  return { client: s3ClientInstance, bucket, cleanEndpoint, formattedEndpoint, region, keyId, appKey };
}

interface B2AuthCache {
  apiUrl: string;
  downloadUrl: string;
  authorizationToken: string;
  accountId: string;
  bucketId?: string;
  bucketName: string;
  expiresAt: number;
}

let b2Cache: B2AuthCache | null = null;

async function getB2NativeAuth(): Promise<B2AuthCache | null> {
  const keyId = process.env.B2_KEY_ID?.trim();
  const appKey = process.env.B2_APPLICATION_KEY?.trim();
  const configuredBucket = process.env.B2_BUCKET_NAME?.trim() || "wits-lingo-materials";

  if (!keyId || !appKey) return null;

  if (b2Cache && b2Cache.expiresAt > Date.now() + 60 * 60 * 1000) {
    return b2Cache;
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${keyId}:${appKey}`).toString("base64");
    const authRes = await fetch("https://api.backblazeb2.com/b2api/v3/b2_authorize_account", {
      headers: { Authorization: authHeader },
    });
    if (!authRes.ok) {
      console.warn("B2 Native Auth failed with status:", authRes.status);
      return null;
    }

    const authData = (await authRes.json()) as any;
    const apiUrl = authData.apiInfo.storageApi.apiUrl;
    const downloadUrl = authData.apiInfo.storageApi.downloadUrl;
    const authToken = authData.authorizationToken;
    const accountId = authData.accountId;

    let bucketId: string | undefined;
    let actualBucketName = configuredBucket;

    try {
      const listRes = await fetch(`${apiUrl}/b2api/v3/b2_list_buckets`, {
        method: "POST",
        headers: { Authorization: authToken, "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      if (listRes.ok) {
        const bucketData = (await listRes.json()) as any;
        const buckets = bucketData.buckets || [];
        const normalizedConfig = configuredBucket.replace(/[_]/g, "-").toLowerCase();
        const matched = buckets.find((b: any) =>
          b.bucketName.toLowerCase() === configuredBucket.toLowerCase() ||
          b.bucketName.replace(/[_]/g, "-").toLowerCase() === normalizedConfig
        ) || buckets[0];

        if (matched) {
          bucketId = matched.bucketId;
          actualBucketName = matched.bucketName;
        }
      }
    } catch (listErr) {
      console.warn("Could not list B2 buckets:", listErr);
    }

    b2Cache = {
      apiUrl,
      downloadUrl,
      authorizationToken: authToken,
      accountId,
      bucketId,
      bucketName: actualBucketName,
      expiresAt: Date.now() + 20 * 60 * 60 * 1000,
    };

    return b2Cache;
  } catch (err) {
    console.warn("Error authenticating with B2 Native API:", err);
    return null;
  }
}

async function uploadBufferToB2(
  fileName: string,
  buffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<{ success: boolean; url?: string; fileId?: string; error?: string }> {
  // 1. Try B2 Native API (Full support for Master Keys & App Keys)
  const b2 = await getB2NativeAuth();
  if (b2 && b2.bucketId) {
    try {
      const upUrlRes = await fetch(`${b2.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: "POST",
        headers: { Authorization: b2.authorizationToken, "Content-Type": "application/json" },
        body: JSON.stringify({ bucketId: b2.bucketId }),
      });

      if (upUrlRes.ok) {
        const upUrlData = (await upUrlRes.json()) as any;
        const sha1 = crypto.createHash("sha1").update(buffer).digest("hex");

        const uploadRes = await fetch(upUrlData.uploadUrl, {
          method: "POST",
          headers: {
            Authorization: upUrlData.authorizationToken,
            "X-Bz-File-Name": encodeURIComponent(fileName),
            "Content-Type": mimeType,
            "Content-Length": buffer.length.toString(),
            "X-Bz-Content-Sha1": sha1,
          },
          body: new Uint8Array(buffer),
        });

        if (uploadRes.ok) {
          const uploadResult = (await uploadRes.json()) as any;
          let directDownloadUrl = `${b2.downloadUrl}/file/${b2.bucketName}/${encodeURIComponent(fileName)}`;

          try {
            const dlAuthRes = await fetch(`${b2.apiUrl}/b2api/v3/b2_get_download_authorization`, {
              method: "POST",
              headers: { Authorization: b2.authorizationToken, "Content-Type": "application/json" },
              body: JSON.stringify({
                bucketId: b2.bucketId,
                fileNamePrefix: fileName,
                validDurationInSeconds: 7 * 24 * 3600, // 7 days valid
              }),
            });
            if (dlAuthRes.ok) {
              const dlAuthData = (await dlAuthRes.json()) as any;
              if (dlAuthData.authorizationToken) {
                directDownloadUrl += `?Authorization=${encodeURIComponent(dlAuthData.authorizationToken)}`;
              }
            }
          } catch (dlAuthErr) {
            console.warn("Could not generate download token:", dlAuthErr);
          }

          return {
            success: true,
            fileId: uploadResult.fileId,
            url: directDownloadUrl,
          };
        }
      }
    } catch (nativeErr: any) {
      console.warn("B2 Native upload attempt failed:", nativeErr?.message);
    }
  }

  // 2. Fallback to S3 Client if S3 credentials configured (e.g. 25-char S3 keys)
  const s3Config = getBackblazeConfig();
  if (s3Config && s3Config.keyId && s3Config.keyId.length > 15) {
    try {
      await s3Config.client.send(
        new PutObjectCommand({
          Bucket: s3Config.bucket,
          Key: fileName,
          Body: buffer,
          ContentType: mimeType,
        })
      );
      return {
        success: true,
        url: `https://${s3Config.bucket}.${s3Config.cleanEndpoint}/${fileName}`,
      };
    } catch (s3Err: any) {
      console.warn("S3 upload failed:", s3Err?.message);
      return { success: false, error: s3Err?.message };
    }
  }

  return { success: false, error: "Backblaze B2 not reachable or credentials invalid." };
}

const JWT_SECRET = process.env.JWT_SECRET || "witslingo_academy_secure_signing_key_2026";

// In-memory persistent database for Wits Lingo Academy
interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "student" | "teacher" | "admin";
  phone: string;
  batchIds: string[];
  admissionId?: string;
  registrationDate?: string;
}

interface DBStudentRegistration {
  id: string;
  admissionId: string;
  name: string;
  fatherName: string;
  dob: string;
  gender: string;
  country?: string;
  district: string;
  state: string;
  pincode?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  qualification: string;
  currentEnglishLevel: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  feeAmount: number;
  paymentStatus: "Paid" | "Pending";
  paymentMethod: string;
  paymentCurrency?: string;
  paymentAmountFormatted?: string;
  paymentTxnId: string;
  registeredAt: string;
  whatsappConfirmationMessage?: string;
  whatsappStudentUrl?: string;
  whatsappAdminUrl?: string;
}

interface DBBatch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  teacherName: string;
  scheduleTime: string;
  maxStudents: number;
  currentStudentsCount: number;
  status: "Active" | "Upcoming" | "Completed" | "Archived";
  recordingsExpiryDate?: string;
  description?: string;
  isVisibleOnWebsite?: boolean;
}

interface DBClass {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  topic: string;
  classNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  teacherName: string;
  description: string;
  status: "Upcoming" | "Live" | "Completed";
  recordingId?: string;
  hasStudyMaterial: boolean;
  hasAssignment: boolean;
  videoKey?: string;
}

interface DBRecording {
  id: string;
  classId: string;
  batchId: string;
  batchName: string;
  title: string;
  topic: string;
  classNumber: number;
  date: string;
  duration: string;
  status: "Available" | "Processing" | "Archived";
  videoKey: string;
  notesSummary?: string;
}

interface DBStudyMaterial {
  id: string;
  batchId: string;
  classId?: string;
  title: string;
  description: string;
  fileType: "pdf" | "doc" | "notes";
  fileSize: string;
  downloadUrl: string;
  pdfUrl?: string;
  isViewOnly?: boolean;
  allowDownload?: boolean;
  isVisibleOnWebsite?: boolean;
  category?: string;
  level?: string;
  uploadedAt: string;
}

interface DBAssignment {
  id: string;
  batchId: string;
  classId?: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  submissionsCount: number;
}

interface DBAssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  batchId: string;
  submittedAt: string;
  content: string;
  status: "Submitted" | "Graded";
  score?: number;
  feedback?: string;
}

interface DBAnnouncement {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  message: string;
  date: string;
  author: string;
  priority: "Normal" | "Important" | "Urgent";
  category?: string;
  effectiveDate?: string;
  isPinned?: boolean;
}

interface DBAttendance {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  classId: string;
  classTitle: string;
  joinTime: string;
  leaveTime?: string;
  durationMinutes: number;
  status: "Present" | "Late" | "Absent";
  date: string;
}

// Initial Data
const users: DBUser[] = [
  {
    id: "usr-admin-01",
    name: "Ziyaur Rehman Zia",
    email: "witslingo@gmail.com",
    passwordHash: "admin123",
    role: "admin",
    phone: "7310952271",
    batchIds: ["batch-spoken-oct-2026", "batch-spoken-nov-2026", "batch-foundation-oct-2026", "batch-vocab-sept-2026"],
    registrationDate: "2026-01-01",
  },
  {
    id: "usr-admin-02",
    name: "Arsh (Admin)",
    email: "arsh522011@gmail.com",
    passwordHash: "admin123",
    role: "admin",
    phone: "7310952271",
    batchIds: ["batch-spoken-oct-2026", "batch-spoken-nov-2026", "batch-foundation-oct-2026", "batch-vocab-sept-2026"],
    registrationDate: "2026-01-01",
  },
  {
    id: "usr-student-01",
    name: "Mohd Farhan",
    email: "mohd.farhan@gmail.com",
    passwordHash: "student123",
    role: "student",
    phone: "9876543210",
    batchIds: ["batch-spoken-oct-2026"],
    admissionId: "WL-2026-OCT-0101",
    registrationDate: "2026-09-01",
  },
  {
    id: "usr-student-02",
    name: "Shabana Parveen",
    email: "shabana.parveen@gmail.com",
    passwordHash: "student123",
    role: "student",
    phone: "9832109876",
    batchIds: ["batch-foundation-oct-2026"],
    admissionId: "WL-2026-OCT-0102",
    registrationDate: "2026-09-02",
  },
  {
    id: "usr-student-03",
    name: "Arjun Sharma",
    email: "arjun.sharma@gmail.com",
    passwordHash: "student123",
    role: "student",
    phone: "9412345678",
    batchIds: ["batch-spoken-nov-2026"],
    admissionId: "WL-2026-NOV-0103",
    registrationDate: "2026-09-10",
  }
];

const registrations: DBStudentRegistration[] = [
  {
    id: "reg-01",
    admissionId: "WL-2026-OCT-0101",
    name: "Mohd Farhan",
    fatherName: "Akhtar Ali",
    dob: "2003-05-14",
    gender: "Male",
    district: "Amroha",
    state: "Uttar Pradesh",
    phone: "9876543210",
    whatsapp: "9876543210",
    email: "mohd.farhan@gmail.com",
    address: "Mohalla Chah Ghori, Amroha, UP",
    qualification: "Undergraduate (B.A.)",
    currentEnglishLevel: "Beginner",
    courseId: "course-spoken-english",
    courseName: "Spoken English",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    feeAmount: 1499,
    paymentStatus: "Paid",
    paymentMethod: "Razorpay",
    paymentTxnId: "pay_Rzp982347101",
    registeredAt: "2026-09-01T10:30:00Z"
  },
  {
    id: "reg-02",
    admissionId: "WL-2026-OCT-0102",
    name: "Shabana Parveen",
    fatherName: "Rashid Khan",
    dob: "2002-11-20",
    gender: "Female",
    district: "Moradabad",
    state: "Uttar Pradesh",
    phone: "9832109876",
    whatsapp: "9832109876",
    email: "shabana.parveen@gmail.com",
    address: "Civil Lines, Moradabad, UP",
    qualification: "Senior Secondary (12th Passed)",
    currentEnglishLevel: "Complete Beginner",
    courseId: "course-foundation",
    courseName: "English Foundation",
    batchId: "batch-foundation-oct-2026",
    batchName: "English Foundation — Batch October 2026",
    feeAmount: 1199,
    paymentStatus: "Paid",
    paymentMethod: "Razorpay",
    paymentTxnId: "pay_Rzp449102837",
    registeredAt: "2026-09-02T14:15:00Z"
  },
  {
    id: "reg-03",
    admissionId: "WL-2026-NOV-0103",
    name: "Arjun Sharma",
    fatherName: "Mahesh Sharma",
    dob: "2001-08-09",
    gender: "Male",
    district: "Hapur",
    state: "Uttar Pradesh",
    phone: "9412345678",
    whatsapp: "9412345678",
    email: "arjun.sharma@gmail.com",
    address: "Station Road, Hapur, UP",
    qualification: "B.Tech Student",
    currentEnglishLevel: "Intermediate",
    courseId: "course-spoken-english",
    courseName: "Spoken English",
    batchId: "batch-spoken-nov-2026",
    batchName: "Spoken English — Batch November 2026",
    feeAmount: 1499,
    paymentStatus: "Paid",
    paymentMethod: "PayPal",
    paymentTxnId: "PAYID-MN7849102",
    registeredAt: "2026-09-10T16:45:00Z"
  }
];

const batches: DBBatch[] = [
  {
    id: "batch-spoken-oct-2026",
    name: "Spoken English — Batch October 2026 (Batch 01)",
    courseId: "course-spoken-english",
    courseName: "Spoken English",
    batchCode: "SE-OCT26",
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    teacherName: "Ziyaur Rehman Zia",
    scheduleTime: "Mon, Wed, Fri (7:00 PM – 8:00 PM IST)",
    maxStudents: 35,
    currentStudentsCount: 28,
    status: "Active",
    recordingsExpiryDate: "2027-05-31",
    description: "Intensive spoken English batch covering confidence, hesitation removal, daily conversation, and fluency practice."
  },
  {
    id: "batch-spoken-nov-2026",
    name: "Spoken English — Batch November 2026",
    courseId: "course-spoken-english",
    courseName: "Spoken English",
    batchCode: "SE-NOV26",
    startDate: "2026-11-01",
    endDate: "2027-01-31",
    teacherName: "Ziyaur Rehman Zia",
    scheduleTime: "Tue, Thu, Sat (7:00 PM – 8:00 PM IST)",
    maxStudents: 35,
    currentStudentsCount: 14,
    status: "Upcoming",
    description: "New upcoming batch starting 1st November. Admissions open now!"
  },
  {
    id: "batch-foundation-oct-2026",
    name: "English Foundation — Batch October 2026",
    courseId: "course-foundation",
    courseName: "English Foundation",
    batchCode: "EF-OCT26",
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    teacherName: "Ziyaur Rehman Zia",
    scheduleTime: "Mon to Fri (6:00 PM – 7:00 PM IST)",
    maxStudents: 30,
    currentStudentsCount: 22,
    status: "Active",
    recordingsExpiryDate: "2027-04-30",
    description: "Designed specifically for learners from basic level to build alphabet phonetics, vocabulary, and basic sentence construction."
  },
  {
    id: "batch-vocab-sept-2026",
    name: "English Vocabulary & Daily Idioms — Batch Sept 2026",
    courseId: "course-vocabulary",
    courseName: "English Vocabulary",
    batchCode: "EV-SEP26",
    startDate: "2026-08-01",
    endDate: "2026-09-15",
    teacherName: "Ziyaur Rehman Zia",
    scheduleTime: "Sat & Sun (10:00 AM – 11:30 AM IST)",
    maxStudents: 40,
    currentStudentsCount: 38,
    status: "Completed",
    recordingsExpiryDate: "2027-03-31",
    description: "Completed batch with all lecture recordings archived and available for enrolled students."
  }
];

const classes: DBClass[] = [
  // Classes for batch-spoken-oct-2026
  {
    id: "cls-se-01",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 01 — Introduction & Overcoming Hesitation",
    topic: "Introduction",
    classNumber: 1,
    date: "10 Sept 2026",
    startTime: "7:00 PM",
    endTime: "8:00 PM",
    durationMinutes: 58,
    teacherName: "Ziyaur Rehman Zia",
    description: "Ice-breaking, understanding personal communication blocks, and learning how to introduce yourself naturally without fear.",
    status: "Completed",
    recordingId: "rec-se-01",
    hasStudyMaterial: true,
    hasAssignment: true,
    videoKey: "video_se_batch01_class01_intro"
  },
  {
    id: "cls-se-02",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 02 — Daily Conversation & Routine Sentences",
    topic: "Daily Conversation",
    classNumber: 2,
    date: "12 Sept 2026",
    startTime: "7:00 PM",
    endTime: "8:02 PM",
    durationMinutes: 62,
    teacherName: "Ziyaur Rehman Zia",
    description: "Morning-to-evening daily routine phrases, greeting manners, and asking questions naturally in everyday scenarios.",
    status: "Completed",
    recordingId: "rec-se-02",
    hasStudyMaterial: true,
    hasAssignment: true,
    videoKey: "video_se_batch01_class02_daily"
  },
  {
    id: "cls-se-03",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 03 — Useful Vocabulary in Real Context",
    topic: "Vocabulary",
    classNumber: 3,
    date: "14 Sept 2026",
    startTime: "7:00 PM",
    endTime: "7:55 PM",
    durationMinutes: 55,
    teacherName: "Ziyaur Rehman Zia",
    description: "50 high-frequency action verbs and everyday adjectives with natural sentence pairing instead of rote memorisation.",
    status: "Completed",
    recordingId: "rec-se-03",
    hasStudyMaterial: true,
    hasAssignment: false,
    videoKey: "video_se_batch01_class03_vocab"
  },
  {
    id: "cls-se-04",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 04 — Pronunciation, Accent & Speech Rhythm",
    topic: "Pronunciation",
    classNumber: 4,
    date: "16 Sept 2026",
    startTime: "7:00 PM",
    endTime: "8:00 PM",
    durationMinutes: 60,
    teacherName: "Ziyaur Rehman Zia",
    description: "Common mother-tongue influence (MTI) correction, silent letters, and intonation practice for clear, pleasant speech.",
    status: "Completed",
    recordingId: "rec-se-04",
    hasStudyMaterial: true,
    hasAssignment: true,
    videoKey: "video_se_batch01_class04_pronun"
  },
  {
    id: "cls-se-05",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 05 — Communication Skills & Expressing Thoughts",
    topic: "Communication Skills",
    classNumber: 5,
    date: "20 Sept 2026",
    startTime: "7:00 PM",
    endTime: "8:00 PM",
    durationMinutes: 60,
    teacherName: "Ziyaur Rehman Zia",
    description: "How to articulate your thoughts clearly in English without translating word-by-word from Hindi/Urdu. Live roleplay practice.",
    status: "Live", // Live class interactive demo!
    hasStudyMaterial: true,
    hasAssignment: true
  },
  {
    id: "cls-se-06",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 06 — Telephone Etiquette & Small Talk",
    topic: "Conversation Practice",
    classNumber: 6,
    date: "23 Sept 2026",
    startTime: "7:00 PM",
    endTime: "8:00 PM",
    durationMinutes: 60,
    teacherName: "Ziyaur Rehman Zia",
    description: "Speaking on phone calls, handling inquiries, making polite requests, and initiating friendly small talk with colleagues.",
    status: "Upcoming",
    hasStudyMaterial: true,
    hasAssignment: false
  },
  // Classes for batch-foundation-oct-2026 (Different Batch - Strict Access Check demonstration!)
  {
    id: "cls-fd-01",
    batchId: "batch-foundation-oct-2026",
    batchName: "English Foundation — Batch October 2026",
    title: "Class 01 — Alphabet Sounds & Phonics Essentials",
    topic: "Phonics & Sounds",
    classNumber: 1,
    date: "11 Sept 2026",
    startTime: "6:00 PM",
    endTime: "6:50 PM",
    durationMinutes: 50,
    teacherName: "Ziyaur Rehman Zia",
    description: "Understanding English vowels, consonants, sound blends, and basic syllable division.",
    status: "Completed",
    recordingId: "rec-fd-01",
    hasStudyMaterial: true,
    hasAssignment: true,
    videoKey: "video_fd_batch01_class01_phonics"
  },
  {
    id: "cls-fd-02",
    batchId: "batch-foundation-oct-2026",
    batchName: "English Foundation — Batch October 2026",
    title: "Class 02 — Simple Sentences (Is, Am, Are, Was, Were)",
    topic: "Grammar Made Easy",
    classNumber: 2,
    date: "15 Sept 2026",
    startTime: "6:00 PM",
    endTime: "6:55 PM",
    durationMinutes: 55,
    teacherName: "Ziyaur Rehman Zia",
    description: "Mastering state-of-being sentences and framing positive, negative, and question structures effortlessly.",
    status: "Completed",
    recordingId: "rec-fd-02",
    hasStudyMaterial: true,
    hasAssignment: true,
    videoKey: "video_fd_batch01_class02_sentences"
  }
];

const recordings: DBRecording[] = [
  {
    id: "rec-se-01",
    classId: "cls-se-01",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 01 — Introduction & Overcoming Hesitation",
    topic: "Introduction",
    classNumber: 1,
    date: "10 Sept 2026",
    duration: "58 min",
    status: "Available",
    videoKey: "video_se_batch01_class01_intro",
    notesSummary: "Focus areas: 1) Why English hesitation occurs, 2) 3 golden rules of self-introduction, 3) Guided vocal practice."
  },
  {
    id: "rec-se-02",
    classId: "cls-se-02",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 02 — Daily Conversation & Routine Sentences",
    topic: "Daily Conversation",
    classNumber: 2,
    date: "12 Sept 2026",
    duration: "62 min",
    status: "Available",
    videoKey: "video_se_batch01_class02_daily",
    notesSummary: "Routine verbs covered: wake up, get ready, commute, discuss, wrap up. Practice audio drills included."
  },
  {
    id: "rec-se-03",
    classId: "cls-se-03",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 03 — Useful Vocabulary in Real Context",
    topic: "Vocabulary",
    classNumber: 3,
    date: "14 Sept 2026",
    duration: "55 min",
    status: "Available",
    videoKey: "video_se_batch01_class03_vocab",
    notesSummary: "Key words: Hesitant, Eloquent, Articulate, Punctual, Collaborative with contextual usage dialogues."
  },
  {
    id: "rec-se-04",
    classId: "cls-se-04",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    title: "Class 04 — Pronunciation, Accent & Speech Rhythm",
    topic: "Pronunciation",
    classNumber: 4,
    date: "16 Sept 2026",
    duration: "60 min",
    status: "Available",
    videoKey: "video_se_batch01_class04_pronun",
    notesSummary: "Fixing 's' vs 'sh', 'v' vs 'w', and mastering word stress on two-syllable nouns vs verbs."
  },
  {
    id: "rec-fd-01",
    classId: "cls-fd-01",
    batchId: "batch-foundation-oct-2026",
    batchName: "English Foundation — Batch October 2026",
    title: "Class 01 — Alphabet Sounds & Phonics Essentials",
    topic: "Phonics & Sounds",
    classNumber: 1,
    date: "11 Sept 2026",
    duration: "50 min",
    status: "Available",
    videoKey: "video_fd_batch01_class01_phonics",
    notesSummary: "English alphabet 44 distinct sounds explained with Urdu/Hindi phoneme comparisons."
  },
  {
    id: "rec-fd-02",
    classId: "cls-fd-02",
    batchId: "batch-foundation-oct-2026",
    batchName: "English Foundation — Batch October 2026",
    title: "Class 02 — Simple Sentences (Is, Am, Are, Was, Were)",
    topic: "Grammar Made Easy",
    classNumber: 2,
    date: "15 Sept 2026",
    duration: "55 min",
    status: "Available",
    videoKey: "video_fd_batch01_class02_sentences",
    notesSummary: "20 practical sentence patterns with 'is/am/are' and everyday objects."
  }
];

const studyMaterials: DBStudyMaterial[] = [
  {
    id: "mat-01",
    batchId: "batch-spoken-oct-2026",
    classId: "cls-se-01",
    title: "Self-Introduction Master Guide & 10 Sample Scripts.pdf",
    description: "Detailed breakdown of introducing yourself in interviews, meetings, and casual gatherings with audio phonetic hints.",
    fileType: "pdf",
    fileSize: "2.4 MB",
    downloadUrl: "#",
    pdfUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
    isViewOnly: true,
    allowDownload: false,
    uploadedAt: "10 Sept 2026"
  },
  {
    id: "mat-02",
    batchId: "batch-spoken-oct-2026",
    classId: "cls-se-02",
    title: "100 Daily Routine Sentence Cheat Sheet.pdf",
    description: "Natural everyday expressions with Hindi translation and pronunciation guide.",
    fileType: "pdf",
    fileSize: "3.1 MB",
    downloadUrl: "#",
    pdfUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
    isViewOnly: true,
    allowDownload: false,
    uploadedAt: "12 Sept 2026"
  },
  {
    id: "mat-03",
    batchId: "batch-spoken-oct-2026",
    classId: "cls-se-04",
    title: "Pronunciation & Tongue Position Handbook.pdf",
    description: "Visual mouth diagrams for mastering challenging English consonant sounds.",
    fileType: "pdf",
    fileSize: "4.8 MB",
    downloadUrl: "#",
    pdfUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
    isViewOnly: true,
    allowDownload: false,
    uploadedAt: "16 Sept 2026"
  },
  {
    id: "mat-fd-01",
    batchId: "batch-foundation-oct-2026",
    classId: "cls-fd-01",
    title: "English Alphabet Phonics & Sound Chart.pdf",
    description: "Foundational phonics workbook with practice exercises.",
    fileType: "pdf",
    fileSize: "1.9 MB",
    downloadUrl: "#",
    pdfUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
    isViewOnly: true,
    allowDownload: false,
    uploadedAt: "11 Sept 2026"
  }
];

const MATERIALS_STORAGE_FILE = path.join(process.cwd(), "uploads", "study-materials.json");

function loadPersistedMaterials(): void {
  try {
    if (fs.existsSync(MATERIALS_STORAGE_FILE)) {
      const data = fs.readFileSync(MATERIALS_STORAGE_FILE, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list) && list.length > 0) {
        const existingIds = new Set(list.map((m: any) => m.id));
        for (const item of studyMaterials) {
          if (!existingIds.has(item.id)) {
            list.push(item);
          }
        }
        studyMaterials.length = 0;
        studyMaterials.push(...list);
        console.log(`Loaded ${studyMaterials.length} study materials from ${MATERIALS_STORAGE_FILE}`);
      }
    }
  } catch (err) {
    console.warn("Could not load persisted study materials:", err);
  }
}

function savePersistedMaterials(): void {
  try {
    const dir = path.dirname(MATERIALS_STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MATERIALS_STORAGE_FILE, JSON.stringify(studyMaterials, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save persisted study materials:", err);
  }
}

loadPersistedMaterials();

const assignments: DBAssignment[] = [
  {
    id: "asg-01",
    batchId: "batch-spoken-oct-2026",
    classId: "cls-se-01",
    title: "Record 90-Second Self Introduction Audio",
    description: "Record and submit your 90-second self-introduction applying the 3 rules discussed in Class 01. Share your name, background, and goals.",
    dueDate: "22 Sept 2026",
    totalPoints: 20,
    submissionsCount: 19
  },
  {
    id: "asg-02",
    batchId: "batch-spoken-oct-2026",
    classId: "cls-se-04",
    title: "Pronunciation Drill: 15 Minimal Pairs Practice",
    description: "Read aloud the 15 minimal pair sentences (ship/sheep, pen/pan, live/leave) and write 5 original sentences.",
    dueDate: "25 Sept 2026",
    totalPoints: 25,
    submissionsCount: 14
  }
];

const submissions: DBAssignmentSubmission[] = [
  {
    id: "sub-01",
    assignmentId: "asg-01",
    studentId: "usr-student-01",
    studentName: "Mohd Farhan",
    batchId: "batch-spoken-oct-2026",
    submittedAt: "2026-09-11T18:30:00Z",
    content: "Audio script: Hello everyone! My name is Mohd Farhan. I am from Amroha, UP. I am pursuing my Bachelor of Arts. I joined Wits Lingo Academy to communicate smoothly and speak English without hesitation.",
    status: "Graded",
    score: 18,
    feedback: "Well done Farhan! Clear articulation. Just remember to pause naturally between sentences. Keep it up!"
  }
];

const announcements: DBAnnouncement[] = [
  {
    id: "ann-holiday-01",
    batchId: "all",
    batchName: "All Batches (Academy-wide)",
    title: "🏖️ Academy Holiday Notice: Gandhi Jayanti Observance",
    message: "Dear Students & Parents,\n\nPlease note that Wits Lingo Academy and all live online classrooms will remain closed on Friday, 2nd October 2026 on the occasion of Gandhi Jayanti. No live speaking classes or teacher consultations will take place on this day.\n\nKey Guidelines for Students:\n• Self-paced vocabulary audio drills and previous session recordings will remain accessible 24/7 on your student dashboard.\n• Homework submissions for Assignment 03 will have an extended deadline until 4th October 2026.\n• Regular interactive live classes will resume punctually on Saturday, 3rd October as per your regular batch schedule.\n\nWarm regards,\nWits Lingo Administration",
    date: "28 Sept 2026",
    author: "Ziyaur Rehman Zia",
    priority: "Important",
    category: "Holiday",
    effectiveDate: "2nd October 2026 (Full Day)",
    isPinned: true
  },
  {
    id: "ann-cls-02",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English & Daily Fluency",
    title: "📢 Spoken English Batch: 1-on-1 Mock Interview Pairs on Friday",
    message: "Attention Batch October 2026 learners:\n\nThis Friday's live session (07:30 PM - 08:30 PM IST) will feature mandatory 1-on-1 mock speaking pairs and individual fluency evaluations.\n\nPreparation Checklist:\n1. Please join the live class room 5 minutes early with your video camera turned on and microphone tested.\n2. Review the '100 High-Frequency Daily Dialogue Sheet' available in your study materials section.\n3. Prepare a concise 2-minute introduction covering your background, professional aspirations, and daily routine.\n\nActive participation is compulsory for monthly certificate grading.",
    date: "26 Sept 2026",
    author: "Ziyaur Rehman Zia",
    priority: "Urgent",
    category: "Class Notice",
    effectiveDate: "Friday, 07:30 PM IST",
    isPinned: true
  },
  {
    id: "ann-sched-03",
    batchId: "batch-found-oct-2026",
    batchName: "English Foundation (Basics)",
    title: "🕒 English Foundation: Timing Adjusted to 5:00 PM for Revision Week",
    message: "Dear Foundation Batch students,\n\nTo allow 15 extra minutes of guided pronunciation drills, our daily evening live class will temporarily commence at 05:00 PM IST instead of 04:30 PM IST during the upcoming Revision Week (28th Sept to 2nd Oct).\n\nPlease verify your class links on the dashboard. Class duration will be 60 minutes of intensive practice.",
    date: "24 Sept 2026",
    author: "Ziyaur Rehman Zia",
    priority: "Normal",
    category: "Schedule Change",
    effectiveDate: "28 Sept - 2 Oct 2026",
    isPinned: false
  },
  {
    id: "ann-gen-04",
    batchId: "all",
    batchName: "All Batches (Academy-wide)",
    title: "🎧 15 New Pronunciation & Tongue-Twister Audio Drills Uploaded",
    message: "Exciting learning update!\n\n15 new studio-recorded audio drills focusing on removing Mother Tongue Influence (MTI), mastering 'P' vs 'B' and 'V' vs 'W' sound articulation, and connected conversational speech have been added to the Study Materials library.\n\nAll students are recommended to listen and shadow-speak for at least 10 minutes every morning.",
    date: "22 Sept 2026",
    author: "Ziyaur Rehman Zia",
    priority: "Normal",
    category: "General",
    effectiveDate: "Available Now",
    isPinned: false
  }
];

const attendanceRecords: DBAttendance[] = [
  {
    id: "att-01",
    studentId: "usr-student-01",
    studentName: "Mohd Farhan",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    classId: "cls-se-01",
    classTitle: "Class 01 — Introduction & Overcoming Hesitation",
    joinTime: "7:00 PM",
    leaveTime: "7:58 PM",
    durationMinutes: 58,
    status: "Present",
    date: "10 Sept 2026"
  },
  {
    id: "att-02",
    studentId: "usr-student-01",
    studentName: "Mohd Farhan",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    classId: "cls-se-02",
    classTitle: "Class 02 — Daily Conversation & Routine Sentences",
    joinTime: "7:02 PM",
    leaveTime: "8:02 PM",
    durationMinutes: 60,
    status: "Present",
    date: "12 Sept 2026"
  },
  {
    id: "att-03",
    studentId: "usr-student-01",
    studentName: "Mohd Farhan",
    batchId: "batch-spoken-oct-2026",
    batchName: "Spoken English — Batch October 2026 (Batch 01)",
    classId: "cls-se-03",
    classTitle: "Class 03 — Useful Vocabulary in Real Context",
    joinTime: "7:00 PM",
    leaveTime: "7:55 PM",
    durationMinutes: 55,
    status: "Present",
    date: "14 Sept 2026"
  }
];

// Dynamic CMS content editable from the Admin Panel
let cmsContent: any = {
  academyName: "WITS LINGO",
  tagline: "A Global Language Platform",
  announcementText: "New Batch Starts from 1st of each month • Admissions Open for October & November 2026",
  announcementBtnText: "",
  showAnnouncement: true,
  phoneNumbers: ["7310952271", "8791287575"],
  email: "Witslingo@gmail.com",
  location: "Wits Lingo Academy, Dhakka, Amroha, Uttar Pradesh, India",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb8dJ6C0rGiTXEMDB93k",
  instagram: "https://www.instagram.com/witslingo?stkn=MWc0OTc5ZHU5OTVrNA==",
  facebook: "https://www.facebook.com/share/1BP5jTfk9B/",
  courses: [
    {
      id: "course-foundation",
      name: "English Foundation",
      level: "Beginner",
      shortDescription: "For learners starting from the basics, building fundamentals with zero hesitation.",
      whatYouWillLearn: [
        "Basic phonetics, clear alphabet sounds & sound articulation",
        "High-frequency everyday words & practical vocabulary",
        "Simple subject-verb sentence framing without translation",
        "Overcoming stage fear & basic self-introduction"
      ],
      duration: "2 Months (40 Sessions)",
      learningFormat: "Live Online Classroom (Evening Batches)",
      fee: 1199,
      badge: "Popular Foundation",
      isPublished: true
    },
    {
      id: "course-spoken-english",
      name: "Spoken English",
      level: "Beginner to Intermediate",
      shortDescription: "Practical English speaking and everyday communication for students and job seekers.",
      whatYouWillLearn: [
        "Fluency training & immediate hesitation removal",
        "Conversational drills for market, bank, travel & social events",
        "Elimination of mother-tongue influence (MTI)",
        "Thinking directly in English during daily conversations"
      ],
      duration: "2.5 Months (50 Sessions)",
      learningFormat: "Live Batches + Daily Speaking Drills",
      fee: 1499,
      badge: "Most Popular",
      isPublished: true
    },
    {
      id: "course-vocabulary",
      name: "English Vocabulary",
      level: "Intermediate",
      shortDescription: "Useful vocabulary with practical real-life examples, idioms, and active speaking practice.",
      whatYouWillLearn: [
        "1,000+ active conversational words & collocations",
        "Contextual idioms, phrasal verbs & smart alternatives",
        "Memory retention techniques (no rote memorisation)",
        "Applying new vocabulary naturally in impromptu dialogues"
      ],
      duration: "1.5 Months (30 Sessions)",
      learningFormat: "Interactive Vocabulary Workshops",
      fee: 999,
      isPublished: true
    },
    {
      id: "course-conversation",
      name: "English Conversation",
      level: "Intermediate",
      shortDescription: "Real-life conversation and speaking practice in simulated environments.",
      whatYouWillLearn: [
        "One-on-one and group situational roleplays",
        "Handling casual small talk, phone calls & discussions",
        "Polite interruptions, expressing opinions & agreement",
        "Confidence building with peer interaction"
      ],
      duration: "2 Months (40 Sessions)",
      learningFormat: "100% Speaking & Dialogue Practice",
      fee: 1299,
      isPublished: true
    },
    {
      id: "course-communication-skills",
      name: "Communication Skills",
      level: "Intermediate to Advanced",
      shortDescription: "Confidence, expression, interview mastery, and effective communication in professional life.",
      whatYouWillLearn: [
        "Job interview preparation & self-pitch articulation",
        "Public speaking, stage presence & body language",
        "Professional email, etiquette & formal discussion",
        "Clear, articulate presentation skills"
      ],
      duration: "2 Months (35 Sessions)",
      learningFormat: "Masterclass Format + Mock Interviews",
      fee: 1699,
      badge: "Career Boost",
      isPublished: true
    },
    {
      id: "course-advanced-english",
      name: "Advanced English",
      level: "Advanced",
      shortDescription: "For learners who want to develop stronger fluency, nuanced vocabulary, and leadership communication.",
      whatYouWillLearn: [
        "Nuanced tone control, formal vs informal language mastery",
        "Advanced debate, spontaneous argument articulation",
        "Refined accent clarity, pacing, stress & intonation",
        "Complex idea synthesis and persuasive speech"
      ],
      duration: "3 Months (60 Sessions)",
      learningFormat: "Executive Live Batch",
      fee: 1999,
      badge: "Career Ready",
      isPublished: true
    }
  ],
  testimonials: [
    {
      id: "test-01",
      studentName: "Mohd Farhan",
      courseBatch: "Spoken English — Batch 01",
      city: "Amroha, UP",
      date: "September 2026",
      testimonial: "Wits Lingo changed the way I look at English. Earlier, I used to freeze whenever someone asked me a question in English. Zia Sir's practical step-by-step approach helped me speak naturally in just a few weeks without memorising heavy grammar rules."
    },
    {
      id: "test-02",
      studentName: "Shabana Parveen",
      courseBatch: "English Foundation",
      city: "Moradabad, UP",
      date: "August 2026",
      testimonial: "Coming from a Hindi-medium background, I always lacked confidence in college. In Wits Lingo Academy, every single student gets a chance to speak. The batch recordings and daily worksheets are immense help!"
    },
    {
      id: "test-03",
      studentName: "Mohammad Danish",
      courseBatch: "Spoken English & Communication",
      city: "Sambhal, UP",
      date: "July 2026",
      testimonial: "The batch system is so well organized. The live classes feel like a physical classroom, and having recorded classes to revise anytime on phone gave me tremendous confidence for my job interviews."
    }
  ]
};

// Helper: Token generator & validation
function generateAuthToken(user: DBUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    batchIds: user.batchIds,
    admissionId: user.admissionId,
    issuedAt: Date.now()
  };
  const str = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(str).digest("hex");
  return `${str}.${signature}`;
}

function verifyAuthToken(authHeader?: string): { userId: string; role: string; email: string; name: string; batchIds: string[]; admissionId?: string } | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7).trim();
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [dataB64, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(dataB64).digest("hex");
  if (sig !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(dataB64, "base64").toString("utf-8"));
    return payload;
  } catch (e) {
    return null;
  }
}

// Generate secure signed temporary video playback URL token (expires in 1 hour)
function generateSignedPlaybackToken(studentId: string, classId: string, batchId: string): string {
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour validity
  const payload = { studentId, classId, batchId, expiresAt };
  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(str).digest("hex");
  return `${str}.${sig}`;
}

function verifyPlaybackToken(token: string): { studentId: string; classId: string; batchId: string; expiresAt: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [str, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(str).digest("hex");
  if (sig !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(str, "base64url").toString("utf-8"));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // File uploads directory setup
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not initialize uploads directory:", e);
  }

  const uploadedPdfFiles = new Map<string, {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    dataBase64: string;
    uploadedAt: string;
    b2FileId?: string;
    b2Url?: string;
  }>();

  // Allow larger payloads for PDF file uploads from files/gallery (up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS / headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Wits Lingo Academy Server", timestamp: new Date().toISOString() });
  });

  // 1. AUTH: Login (Supports Email, Admission ID / Roll No, and Admin Key)
  app.post("/api/auth/login", (req, res) => {
    const { email, username, password, adminPasskey } = req.body;

    // Direct Admin unlock support (simple security for opening admin)
    if (adminPasskey || (!email && !username && password)) {
      const pass = adminPasskey || password;
      const adminUser = users.find(u => u.role === "admin");
      if (adminUser && (adminUser.passwordHash === pass || pass === "admin123")) {
        const token = generateAuthToken(adminUser);
        return res.json({
          token,
          user: {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: adminUser.role,
            phone: adminUser.phone,
            batchIds: adminUser.batchIds,
            admissionId: adminUser.admissionId,
            registrationDate: adminUser.registrationDate
          }
        });
      }
      return res.status(401).json({ error: "Invalid admin security key / password." });
    }

    const loginIdentifier = (email || username || "").trim().toLowerCase();
    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "Please provide your Email or Admission ID, and Password." });
    }

    const user = users.find(u => 
      u.email.toLowerCase() === loginIdentifier || 
      (u.admissionId && u.admissionId.toLowerCase() === loginIdentifier)
    );

    if (!user || (user.passwordHash !== password && !(user.role === 'admin' && password === 'admin123'))) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your Email/Admission ID and Password." });
    }

    const token = generateAuthToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        batchIds: user.batchIds,
        admissionId: user.admissionId,
        registrationDate: user.registrationDate
      }
    });
  });

  // 2. AUTH: Get Current User
  app.get("/api/auth/me", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    const user = users.find(u => u.id === auth.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return user with their authorized batches
    const userBatches = batches.filter(b => user.batchIds.includes(b.id));

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        batchIds: user.batchIds,
        admissionId: user.admissionId,
        registrationDate: user.registrationDate
      },
      batches: userBatches
    });
  });

  // 3. BATCHES: List Batches (Public or Authenticated)
  app.get("/api/batches", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (auth && auth.role === "admin") {
      // Admin gets all batches with full stats
      return res.json({ batches });
    } else if (auth && auth.role === "student") {
      // Student gets their assigned batches plus active public listings
      const myBatches = batches.filter(b => auth.batchIds.includes(b.id));
      return res.json({ batches: myBatches, allPublicBatches: batches });
    }

    // Public visitor
    res.json({ batches });
  });

  // 4. BATCH ACCESS CONTROL: Get Classes for Batch
  // CRITICAL REQUIREMENT: Strict authorization at backend/database level.
  app.get("/api/batches/:batchId/classes", (req, res) => {
    const { batchId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required. Please login to access batch classes." });
    }

    // Check authorization: Admin has access to all; student must be enrolled in this batch
    if (auth.role !== "admin" && !auth.batchIds.includes(batchId)) {
      return res.status(403).json({
        error: "Access Denied: You do not have authorization to view or access this batch's classes.",
        code: "BATCH_UNAUTHORIZED",
        requestedBatchId: batchId
      });
    }

    const batchClasses = classes.filter(c => c.batchId === batchId);
    res.json({ classes: batchClasses });
  });

  // 4b. BATCH RECORDINGS (Authorized for Enrolled Students & Admin)
  app.get("/api/batches/:batchId/recordings", (req, res) => {
    const { batchId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required. Please login to view recordings." });
    }

    if (auth.role !== "admin" && !(auth.batchIds || []).includes(batchId)) {
      return res.status(403).json({
        error: "Access Denied: You do not have authorization to view recordings for this batch.",
        code: "BATCH_UNAUTHORIZED",
        requestedBatchId: batchId
      });
    }

    const batchRecordings = recordings.filter(r => r.batchId === batchId);
    res.json({ recordings: batchRecordings });
  });

  // 4c. BATCH RECORDING STREAM TICKET (Generates signed expiring playback token)
  app.get("/api/batches/:batchId/recordings/:recordingId/stream-ticket", (req, res) => {
    const { batchId, recordingId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required to stream recording." });
    }

    if (auth.role !== "admin" && !(auth.batchIds || []).includes(batchId)) {
      return res.status(403).json({
        error: "Access Denied: You do not have permission to access recordings for this batch.",
        code: "UNAUTHORIZED_RECORDING_ACCESS"
      });
    }

    const rec = recordings.find(r => r.id === recordingId && r.batchId === batchId);
    if (!rec) {
      return res.status(404).json({ error: "Recording not found for this batch." });
    }

    const token = generateSignedPlaybackToken(auth.userId, rec.classId, batchId);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    res.json({
      success: true,
      playbackTicket: token,
      streamUrl: `/api/stream/recording/${token}`,
      expiresAt,
      watermarkText: `${auth.name} • ${auth.userId} • Wits Lingo Academy Authorized Student`,
      recording: rec
    });
  });

  // 5. CLASS DETAIL & ACCESS VERIFICATION
  app.get("/api/classes/:classId", (req, res) => {
    const { classId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const cls = classes.find(c => c.id === classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found." });
    }

    // Check student assigned batch
    if (auth.role !== "admin" && !auth.batchIds.includes(cls.batchId)) {
      return res.status(403).json({
        error: "Access Denied: You are not authorized to access this class. It belongs to another batch.",
        code: "CLASS_BATCH_MISMATCH"
      });
    }

    const clsRecording = recordings.find(r => r.classId === classId);
    const clsMaterials = studyMaterials.filter(m => m.classId === classId || (m.batchId === cls.batchId && !m.classId));
    const clsAssignments = assignments.filter(a => a.classId === classId || (a.batchId === cls.batchId && !a.classId));

    res.json({
      class: cls,
      recording: clsRecording,
      materials: clsMaterials,
      assignments: clsAssignments
    });
  });

  // 6. ATTENDANCE: Join Class (Logs Attendance on Server)
  app.post("/api/classes/:classId/join", (req, res) => {
    const { classId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const cls = classes.find(c => c.id === classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found." });
    }

    if (auth.role !== "admin" && !auth.batchIds.includes(cls.batchId)) {
      return res.status(403).json({ error: "Access Denied: You cannot join a live class for an unauthorized batch." });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // Check existing attendance or create record
    let att = attendanceRecords.find(a => a.studentId === auth.userId && a.classId === classId);
    if (!att) {
      att = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        studentId: auth.userId,
        studentName: auth.name,
        batchId: cls.batchId,
        batchName: cls.batchName,
        classId: cls.id,
        classTitle: cls.title,
        joinTime: timeStr,
        durationMinutes: 1,
        status: "Present",
        date: dateStr
      };
      attendanceRecords.unshift(att);
    }

    res.json({
      success: true,
      message: "Attendance recorded successfully.",
      attendanceId: att.id,
      joinedAt: timeStr,
      liveSession: {
        classId: cls.id,
        title: cls.title,
        batchName: cls.batchName,
        instructor: cls.teacherName,
        isLive: cls.status === "Live"
      }
    });
  });

  // 7. ATTENDANCE: Leave Class (Updates duration)
  app.post("/api/classes/:classId/leave", (req, res) => {
    const { classId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);
    const { durationMinutes } = req.body;

    if (!auth) return res.status(401).json({ error: "Unauthorized" });

    const att = attendanceRecords.find(a => a.studentId === auth.userId && a.classId === classId);
    if (att) {
      const now = new Date();
      att.leaveTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (durationMinutes && typeof durationMinutes === "number") {
        att.durationMinutes = Math.max(att.durationMinutes, durationMinutes);
      }
    }

    res.json({ success: true, message: "Attendance session closed." });
  });

  // 8. VIDEO SECURITY: Get Signed Expiring Playback Token
  // CRITICAL REQUIREMENT: Strict verification at backend level. Expiring signed token.
  app.get("/api/classes/:classId/recording-token", (req, res) => {
    const { classId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required to watch recording." });
    }

    const cls = classes.find(c => c.id === classId);
    if (!cls) {
      return res.status(404).json({ error: "Class not found." });
    }

    // Backend access check: does student's assigned batch match the class batch?
    if (auth.role !== "admin" && !auth.batchIds.includes(cls.batchId)) {
      return res.status(403).json({
        error: "Access Denied: You do not have permission to access recordings for this batch.",
        code: "UNAUTHORIZED_RECORDING_ACCESS"
      });
    }

    const rec = recordings.find(r => r.classId === classId);
    if (!rec) {
      return res.status(404).json({ error: "No recording available for this class yet." });
    }

    // Generate signed token with 1 hour expiration
    const token = generateSignedPlaybackToken(auth.userId, classId, cls.batchId);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    res.json({
      success: true,
      playbackToken: token,
      streamUrl: `/api/stream/recording/${token}`,
      expiresAt,
      watermarkText: `${auth.name} • ${auth.userId} • Wits Lingo Academy Authorized Student`,
      recording: {
        id: rec.id,
        title: rec.title,
        topic: rec.topic,
        classNumber: rec.classNumber,
        date: rec.date,
        duration: rec.duration,
        notesSummary: rec.notesSummary
      }
    });
  });

  // 9. SECURE STREAMING GATEWAY: Validates signed token before serving video metadata/stream
  app.get("/api/stream/recording/:token", (req, res) => {
    const { token } = req.params;
    const verified = verifyPlaybackToken(token);

    if (!verified) {
      return res.status(403).json({
        error: "Invalid or expired video playback token. Please refresh your dashboard to generate a new signed session.",
        code: "TOKEN_EXPIRED_OR_INVALID"
      });
    }

    const cls = classes.find(c => c.id === verified.classId);
    const rec = recordings.find(r => r.classId === verified.classId);
    const user = users.find(u => u.id === verified.studentId);

    if (!cls || !rec) {
      return res.status(404).json({ error: "Recording stream not found." });
    }

    // Check user still in batch
    if (user && user.role !== "admin" && !user.batchIds.includes(verified.batchId)) {
      return res.status(403).json({ error: "Revoked authorization: Student no longer belongs to this batch." });
    }

    res.json({
      secureStream: true,
      classId: cls.id,
      title: cls.title,
      duration: rec.duration,
      watermark: `${user?.name || 'Student'} • WL-VERIFIED • Session Expiry ${new Date(verified.expiresAt).toLocaleTimeString()}`,
      videoKey: rec.videoKey,
      mimeType: "video/mp4",
      playbackProtocol: "HLS_Signed_VOD",
      notes: rec.notesSummary
    });
  });

  // 10. BATCH MATERIALS (Authorized)
  app.get("/api/batches/:batchId/materials", (req, res) => {
    const { batchId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) return res.status(401).json({ error: "Authentication required." });
    if (auth.role !== "admin" && !auth.batchIds.includes(batchId)) {
      return res.status(403).json({ error: "Access Denied: You are not authorized to access study materials for this batch." });
    }

    const materials = studyMaterials.filter(m => m.batchId === batchId);
    res.json({ materials });
  });

  // 11. BATCH ASSIGNMENTS (Authorized)
  app.get("/api/batches/:batchId/assignments", (req, res) => {
    const { batchId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) return res.status(401).json({ error: "Authentication required." });
    if (auth.role !== "admin" && !auth.batchIds.includes(batchId)) {
      return res.status(403).json({ error: "Access Denied: You are not authorized to access assignments for this batch." });
    }

    const batchAssignments = assignments.filter(a => a.batchId === batchId);
    const mySubmissions = submissions.filter(s => s.studentId === auth.userId);

    res.json({
      assignments: batchAssignments,
      submissions: mySubmissions
    });
  });

  // 12. SUBMIT ASSIGNMENT
  app.post("/api/assignments/:assignmentId/submit", (req, res) => {
    const { assignmentId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);
    const { content } = req.body;

    if (!auth) return res.status(401).json({ error: "Authentication required." });
    if (!content || !content.trim()) return res.status(400).json({ error: "Submission content cannot be empty." });

    const asg = assignments.find(a => a.id === assignmentId);
    if (!asg) return res.status(404).json({ error: "Assignment not found." });

    if (auth.role !== "admin" && !auth.batchIds.includes(asg.batchId)) {
      return res.status(403).json({ error: "Access Denied: You do not belong to this assignment's batch." });
    }

    const submission: DBAssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId,
      studentId: auth.userId,
      studentName: auth.name,
      batchId: asg.batchId,
      submittedAt: new Date().toISOString(),
      content: content.trim(),
      status: "Submitted"
    };

    submissions.unshift(submission);
    asg.submissionsCount += 1;

    res.json({ success: true, message: "Assignment submitted successfully! Teacher will review it soon.", submission });
  });

  // 13. BATCH ANNOUNCEMENTS (Authorized)
  app.get("/api/batches/:batchId/announcements", (req, res) => {
    const { batchId } = req.params;
    const auth = verifyAuthToken(req.headers.authorization);

    if (!auth) return res.status(401).json({ error: "Authentication required." });
    if (auth.role !== "admin" && !auth.batchIds.includes(batchId)) {
      return res.status(403).json({ error: "Access Denied: You are not authorized to view announcements for this batch." });
    }

    const batchAnnouncements = announcements.filter(a => a.batchId === batchId);
    res.json({ announcements: batchAnnouncements });
  });

  // 14. ADMISSION & REGISTRATION WITH PAYMENT CONFIRMATION
  // Requirement: "Course fee payment with Registration. No registration confirmed unless the fee is successfully paid. I'll use my razor pay link for it. (also PayPal option)"
  // "All batchwise students data, e.g. Batch, October, 2026, batch November, 2026 etc. And all registered students with their important details, like, Name, father name, date of birth, district and state, and contacts etc."
  app.post("/api/admissions/register", (req, res) => {
    const {
      name,
      fatherName,
      dob,
      gender,
      country,
      district,
      state,
      pincode,
      phone,
      phoneCountryCode,
      whatsapp,
      whatsappCountryCode,
      email,
      address,
      qualification,
      currentEnglishLevel,
      courseId,
      batchId,
      paymentMethod,
      paymentTxnId,
      isFeePaid
    } = req.body;

    if (!name || !fatherName || !dob || !district || !state || !phone || !whatsapp || !email || !courseId || !batchId) {
      return res.status(400).json({ error: "Please fill all required student and parent fields including Mobile Phone and WhatsApp Number." });
    }

    // Clean and validate 10 digits for Mobile Phone
    const pCode = phoneCountryCode || (typeof phone === 'string' && phone.startsWith('+') ? phone.split(' ')[0] : '+91');
    const rawPhoneDigits = (phone || "").toString().replace(/\D/g, "");
    const pCodeDigits = pCode.replace(/\D/g, "");
    let cleanPhone = rawPhoneDigits;
    if (pCodeDigits && cleanPhone.length === 10 + pCodeDigits.length && cleanPhone.startsWith(pCodeDigits)) {
      cleanPhone = cleanPhone.slice(pCodeDigits.length);
    } else if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Mobile Phone number must be exactly 10 digits." });
    }

    // Clean and validate 10 digits for WhatsApp Number
    const wCode = whatsappCountryCode || (typeof whatsapp === 'string' && whatsapp.startsWith('+') ? whatsapp.split(' ')[0] : pCode);
    const rawWhatsappDigits = (whatsapp || "").toString().replace(/\D/g, "");
    const wCodeDigits = wCode.replace(/\D/g, "");
    let cleanWhatsapp = rawWhatsappDigits;
    if (wCodeDigits && cleanWhatsapp.length === 10 + wCodeDigits.length && cleanWhatsapp.startsWith(wCodeDigits)) {
      cleanWhatsapp = cleanWhatsapp.slice(wCodeDigits.length);
    } else if (cleanWhatsapp.length > 10) {
      cleanWhatsapp = cleanWhatsapp.slice(-10);
    }
    if (cleanWhatsapp.length !== 10) {
      return res.status(400).json({ error: "WhatsApp number is required and must be exactly 10 digits." });
    }

    const fullPhoneFormatted = `${pCode} ${cleanPhone}`;
    const fullWhatsappFormatted = `${wCode} ${cleanWhatsapp}`;

    if (!isFeePaid) {
      return res.status(400).json({
        error: "Course fee payment is required to confirm admission. No registration is confirmed unless the fee is successfully paid.",
        paymentRequired: true
      });
    }

    const batch = batches.find(b => b.id === batchId);
    if (!batch) {
      return res.status(404).json({ error: "Selected batch not found." });
    }

    const course = cmsContent.courses.find((c: any) => c.id === courseId) || { name: "Spoken English", fee: 1499 };

    // Generate unique Admission ID
    const batchYearMonth = batch.batchCode.replace(/[^A-Za-z0-9]/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const admissionId = `WL-${batchYearMonth}-${randomSeq}`;

    const studentReg: DBStudentRegistration = {
      id: `reg-${Date.now()}`,
      admissionId,
      name: name.trim(),
      fatherName: fatherName.trim(),
      dob,
      gender: gender || "Not Specified",
      country: country?.trim() || "India",
      district: district.trim(),
      state: state.trim(),
      pincode: pincode?.trim() || "",
      phone: fullPhoneFormatted,
      whatsapp: fullWhatsappFormatted,
      email: email.trim().toLowerCase(),
      address: address?.trim() || `${district}, ${state}, ${country || 'India'}${pincode ? ' - ' + pincode : ''}`,
      qualification: qualification || "Undergraduate",
      currentEnglishLevel: currentEnglishLevel || "Beginner",
      courseId,
      courseName: course.name,
      batchId: batch.id,
      batchName: batch.name,
      feeAmount: course.fee,
      paymentStatus: "Paid",
      paymentMethod: paymentMethod || "UPI / Google Pay",
      paymentCurrency: req.body.paymentCurrency || "INR",
      paymentAmountFormatted: req.body.paymentAmountFormatted || `₹${course.fee.toLocaleString()}`,
      paymentTxnId: paymentTxnId || `txn_${Date.now()}`,
      registeredAt: new Date().toISOString()
    };

    registrations.unshift(studentReg);

    // Update batch student count
    batch.currentStudentsCount += 1;

    // Check if user account already exists or create new student account
    const assignedPassword = (req.body.password || req.body.studentPassword || "WitsLingo@2026").trim();

    let user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      if (!user.batchIds.includes(batch.id)) {
        user.batchIds.push(batch.id);
      }
      if (assignedPassword && assignedPassword !== "student123") {
        user.passwordHash = assignedPassword;
      }
      if (!user.admissionId) {
        user.admissionId = admissionId;
      }
    } else {
      user = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: assignedPassword,
        role: "student",
        phone: fullPhoneFormatted,
        batchIds: [batch.id],
        admissionId,
        registrationDate: new Date().toISOString().split("T")[0]
      };
      users.push(user);
    }

    const token = generateAuthToken(user);

    // Official WhatsApp Confirmation Message
    const fullCountryDigits = (wCodeDigits || "91").replace(/\D/g, "") || "91";
    const whatsappCleanRecipient = `${fullCountryDigits}${cleanWhatsapp}`;
    const whatsappConfirmationText = 
`🎓 *WITS LINGO — OFFICIAL ADMISSION CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━
Dear *${name.trim()}*,
Congratulations! Your seat has been successfully confirmed at *WITS LINGO — A Global Language Platform*.

📋 *ADMISSION SUMMARY*
• *Admission ID / Roll No:* ${admissionId}
• *Student Name:* ${name.trim()}
• *Father's Name:* ${fatherName.trim()}
• *Enrolled Course:* ${course.name}
• *Assigned Batch:* ${batch.name} (${batch.batchCode})
• *Batch Timings:* ${batch.scheduleTime || 'Daily 1-Hour Live Class'}
• *Batch Start Date:* ${batch.startDate || '1st of the month'}
• *Fee Paid:* ${studentReg.paymentAmountFormatted || '₹' + course.fee} (Verified)
• *Payment Ref:* ${studentReg.paymentTxnId}

🔐 *PURCHASED BATCH PORTAL LOGIN*
• *Portal URL:* https://witslingo.com/login
• *Username:* ${user.email} (or ${admissionId})
• *Password:* ${user.passwordHash}

📱 *BATCH WHATSAPP GROUP & SUPPORT*
Save our official mentor helpline on WhatsApp:
📞 *+91 8791287575* / *+91 7310952271*
Our academic counsellor will add you to your exclusive batch WhatsApp group.

Welcome to the journey of speaking English naturally!
*WITS LINGO*
_A Global Language Platform_
www.witslingo.com`;

    const encodedWhatsappMsg = encodeURIComponent(whatsappConfirmationText);
    const whatsappStudentUrl = `https://api.whatsapp.com/send?phone=${whatsappCleanRecipient}&text=${encodedWhatsappMsg}`;
    const whatsappAdminUrl = `https://api.whatsapp.com/send?phone=918791287575&text=${encodedWhatsappMsg}`;
    const waMeStudentUrl = `https://wa.me/${whatsappCleanRecipient}?text=${encodedWhatsappMsg}`;
    const waMeAdminUrl = `https://wa.me/918791287575?text=${encodedWhatsappMsg}`;

    studentReg.whatsappConfirmationMessage = whatsappConfirmationText;
    studentReg.whatsappStudentUrl = whatsappStudentUrl;
    studentReg.whatsappAdminUrl = whatsappAdminUrl;

    res.json({
      success: true,
      message: "Admission registered and course fee verified successfully! Welcome to WITS LINGO.",
      admissionId,
      registration: studentReg,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        batchIds: user.batchIds,
        admissionId
      },
      credentials: {
        username: user.email,
        alternativeUsername: admissionId,
        password: user.passwordHash
      },
      defaultPasswordHint: user.passwordHash,
      whatsapp: {
        recipientNumber: fullWhatsappFormatted,
        cleanRecipient: whatsappCleanRecipient,
        confirmationMessage: whatsappConfirmationText,
        studentUrl: whatsappStudentUrl,
        adminUrl: whatsappAdminUrl,
        waMeStudentUrl,
        waMeAdminUrl
      }
    });
  });

  // 14b. STUDENT: Get Own Admission Confirmation Slip & WhatsApp Links
  app.get("/api/student/admission-slip", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const reg = registrations.find(r => 
      (auth.admissionId && r.admissionId === auth.admissionId) ||
      r.email.toLowerCase() === auth.email.toLowerCase()
    );

    if (!reg) {
      return res.status(404).json({ error: "No admission registration found for this student account." });
    }

    const batch = batches.find(b => b.id === reg.batchId);
    const rawCleanPhone = (reg.whatsapp || reg.phone || '').replace(/\D/g, '');
    const recipientDigits = rawCleanPhone.length === 10 ? `91${rawCleanPhone}` : rawCleanPhone;

    const encodedMsg = encodeURIComponent(
      reg.whatsappConfirmationMessage || 
`🎓 *WITS LINGO — OFFICIAL ADMISSION CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━
Dear *${reg.name}*,
Your seat is confirmed at *WITS LINGO — A Global Language Platform*!

• Admission ID: ${reg.admissionId}
• Course: ${reg.courseName}
• Batch: ${reg.batchName} (${batch?.batchCode || 'ACTIVE'})
• Timings: ${batch?.scheduleTime || 'Daily Live Class'}
• Username: ${reg.email}
• Fee Paid: ₹${reg.feeAmount} (Verified)

Mentor WhatsApp Support: +91 8791287575
www.witslingo.com`
    );

    const studentUrl = reg.whatsappStudentUrl || `https://api.whatsapp.com/send?phone=${recipientDigits}&text=${encodedMsg}`;
    const adminUrl = reg.whatsappAdminUrl || `https://api.whatsapp.com/send?phone=918791287575&text=${encodedMsg}`;

    res.json({
      success: true,
      slip: {
        admissionId: reg.admissionId,
        name: reg.name,
        fatherName: reg.fatherName,
        dob: reg.dob,
        gender: reg.gender,
        phone: reg.phone,
        whatsapp: reg.whatsapp,
        email: reg.email,
        country: reg.country || "India",
        state: reg.state,
        district: reg.district,
        pincode: reg.pincode,
        address: reg.address,
        courseName: reg.courseName,
        batchName: reg.batchName,
        batchCode: batch?.batchCode || "WL-2026",
        batchTiming: batch?.scheduleTime || "Daily 1-Hour Live Class",
        feeAmount: reg.feeAmount,
        formattedAmount: reg.paymentAmountFormatted || `₹${reg.feeAmount}`,
        paymentStatus: reg.paymentStatus,
        paymentMethod: reg.paymentMethod,
        txnId: reg.paymentTxnId,
        registeredAt: reg.registeredAt,
        username: auth.email,
        password: auth.role === "student" ? "WitsLingo@2026" : undefined,
        whatsappConfirmationMessage: reg.whatsappConfirmationMessage,
        whatsappStudentUrl: studentUrl,
        whatsappAdminUrl: adminUrl
      }
    });
  });

  // 15. ADMIN: List Registered Students (Batch-wise filter support)
  app.get("/api/admin/students", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Access Denied: Admin authorization required." });
    }

    const { batchId } = req.query;
    let list = registrations;
    if (batchId && typeof batchId === "string" && batchId !== "all") {
      list = list.filter(r => r.batchId === batchId);
    }

    res.json({ students: list, totalCount: list.length });
  });

  // 16. ADMIN: Batch Management (Create Batch)
  app.post("/api/admin/batches", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Access Denied: Admin authorization required." });
    }

    const { name, courseId, courseName, batchCode, startDate, endDate, teacherName, scheduleTime, maxStudents, status } = req.body;
    if (!name || !batchCode) {
      return res.status(400).json({ error: "Batch name and code are required." });
    }

    const newBatch: DBBatch = {
      id: `batch-${batchCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name,
      courseId: courseId || "course-spoken-english",
      courseName: courseName || "Spoken English",
      batchCode,
      startDate: startDate || "2026-10-01",
      endDate: endDate || "2026-12-31",
      teacherName: teacherName || "Ziyaur Rehman Zia",
      scheduleTime: scheduleTime || "Mon, Wed, Fri 7:00 PM - 8:00 PM IST",
      maxStudents: Number(maxStudents) || 35,
      currentStudentsCount: 0,
      status: status || "Upcoming",
      isVisibleOnWebsite: req.body.isVisibleOnWebsite !== false
    };

    batches.unshift(newBatch);
    res.json({ success: true, batch: newBatch });
  });

  // 17. ADMIN: Schedule New Class or Toggle Live
  app.post("/api/admin/schedule-class", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Access Denied: Admin authorization required." });
    }

    const { batchId, title, topic, classNumber, date, startTime, endTime, durationMinutes, teacherName, description, status } = req.body;
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return res.status(400).json({ error: "Invalid batch." });

    const newClass: DBClass = {
      id: `cls-${Date.now()}`,
      batchId,
      batchName: batch.name,
      title: title || `Class ${classNumber || (classes.length + 1)} — ${topic || 'English Session'}`,
      topic: topic || "English Practice",
      classNumber: Number(classNumber) || classes.length + 1,
      date: date || new Date().toLocaleDateString('en-GB'),
      startTime: startTime || "7:00 PM",
      endTime: endTime || "8:00 PM",
      durationMinutes: Number(durationMinutes) || 60,
      teacherName: teacherName || "Ziyaur Rehman Zia",
      description: description || "Interactive class session.",
      status: status || "Upcoming",
      hasStudyMaterial: false,
      hasAssignment: false
    };

    classes.push(newClass);

    // If live, dispatch notification announcement
    if (status === "Live") {
      announcements.unshift({
        id: `ann-${Date.now()}`,
        batchId: batch.id,
        batchName: batch.name,
        title: `🔴 Class is LIVE: ${newClass.title}`,
        message: `Instructor ${newClass.teacherName} has started the live class. Click 'Join Live Class' in your student dashboard to attend now!`,
        date: new Date().toLocaleDateString('en-GB'),
        author: newClass.teacherName,
        priority: "Urgent"
      });
    }

    res.json({ success: true, class: newClass });
  });

  // 18. ADMIN: Toggle Class Status (Live / Completed / Upcoming) & Auto-recording
  app.post("/api/admin/classes/:classId/status", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Access Denied: Admin authorization required." });
    }

    const { classId } = req.params;
    const { status, autoRecord } = req.body;

    const cls = classes.find(c => c.id === classId);
    if (!cls) return res.status(404).json({ error: "Class not found." });

    const oldStatus = cls.status;
    cls.status = status;

    // Requirement: "After the class ends: Live Class → Recording Processing → Recorded Class. The recording should automatically be attached to that particular class and batch."
    if (oldStatus === "Live" && status === "Completed" && autoRecord !== false) {
      const recId = `rec-${cls.id}`;
      let rec = recordings.find(r => r.classId === cls.id);
      if (!rec) {
        rec = {
          id: recId,
          classId: cls.id,
          batchId: cls.batchId,
          batchName: cls.batchName,
          title: cls.title,
          topic: cls.topic,
          classNumber: cls.classNumber,
          date: cls.date,
          duration: `${cls.durationMinutes || 60} min`,
          status: "Available",
          videoKey: `video_rec_${cls.batchId}_${cls.id}`,
          notesSummary: `Auto-recorded session for ${cls.title}. Complete recording available for authorized batch students.`
        };
        recordings.unshift(rec);
        cls.recordingId = rec.id;
      }

      // Add announcement for students
      announcements.unshift({
        id: `ann-${Date.now()}`,
        batchId: cls.batchId,
        batchName: cls.batchName,
        title: `▶ Recording Available: ${cls.title}`,
        message: `The recording for ${cls.title} has completed processing and is now available in your Recorded Classes section.`,
        date: new Date().toLocaleDateString('en-GB'),
        author: "Wits Lingo Academy",
        priority: "Normal"
      });
    }

    res.json({ success: true, class: cls });
  });

  // 19. ADMIN: Upload or Attach Manual Recording
  app.post("/api/admin/recordings", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { classId, title, topic, duration, notesSummary } = req.body;
    const cls = classes.find(c => c.id === classId);
    if (!cls) return res.status(400).json({ error: "Valid class ID is required." });

    const newRec: DBRecording = {
      id: `rec-${Date.now()}`,
      classId: cls.id,
      batchId: cls.batchId,
      batchName: cls.batchName,
      title: title || cls.title,
      topic: topic || cls.topic,
      classNumber: cls.classNumber,
      date: cls.date,
      duration: duration || "60 min",
      status: "Available",
      videoKey: `video_${cls.batchId}_manual_${Date.now()}`,
      notesSummary: notesSummary || `Recorded lecture for ${cls.title}.`
    };

    recordings.unshift(newRec);
    cls.recordingId = newRec.id;
    cls.status = "Completed";

    res.json({ success: true, recording: newRec });
  });

  // 20a. PUBLIC: Get All Live Website Study Materials & PDF Resources
  app.get("/api/materials", (req, res) => {
    res.json({ materials: studyMaterials });
  });

  // 20b. ADMIN: Get All Study Materials
  app.get("/api/admin/materials", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    res.json({ materials: studyMaterials });
  });

  // 20c. ADMIN: Upload Study Material (PDF with View-Only support)
  app.post("/api/admin/materials", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { batchId, classId, title, description, fileType, fileSize, pdfUrl, isViewOnly, allowDownload, isVisibleOnWebsite, category, level } = req.body;
    const newMat: DBStudyMaterial = {
      id: `mat-${Date.now()}`,
      batchId: batchId || "batch-spoken-oct-2026",
      classId,
      title: title || "Lecture Notes & Practice Sheet.pdf",
      description: description || "Study materials uploaded by instructor.",
      fileType: fileType || "pdf",
      fileSize: fileSize || "2.1 MB",
      downloadUrl: "#",
      pdfUrl: pdfUrl || "",
      isViewOnly: isViewOnly !== undefined ? Boolean(isViewOnly) : true,
      allowDownload: Boolean(allowDownload),
      isVisibleOnWebsite: isVisibleOnWebsite !== undefined ? Boolean(isVisibleOnWebsite) : true,
      category: category || "Worksheets",
      level: level || "All Levels",
      uploadedAt: new Date().toLocaleDateString('en-GB')
    };

    studyMaterials.unshift(newMat);
    if (classId) {
      const cls = classes.find(c => c.id === classId);
      if (cls) cls.hasStudyMaterial = true;
    }
    savePersistedMaterials();

    res.json({ success: true, material: newMat, materials: studyMaterials });
  });

  // 20d. ADMIN: Update Study Material (PDF Link & View-Only settings)
  app.put("/api/admin/materials/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { id } = req.params;
    const mat = studyMaterials.find(m => m.id === id);
    if (!mat) {
      return res.status(404).json({ error: "Study material not found." });
    }

    const { title, description, batchId, fileType, fileSize, pdfUrl, isViewOnly, allowDownload, isVisibleOnWebsite, category, level } = req.body;
    if (title !== undefined) mat.title = title;
    if (description !== undefined) mat.description = description;
    if (batchId !== undefined) mat.batchId = batchId;
    if (fileType !== undefined) mat.fileType = fileType;
    if (fileSize !== undefined) mat.fileSize = fileSize;
    if (pdfUrl !== undefined) mat.pdfUrl = pdfUrl;
    if (isViewOnly !== undefined) mat.isViewOnly = Boolean(isViewOnly);
    if (allowDownload !== undefined) mat.allowDownload = Boolean(allowDownload);
    if (isVisibleOnWebsite !== undefined) mat.isVisibleOnWebsite = Boolean(isVisibleOnWebsite);
    if (category !== undefined) mat.category = category;
    if (level !== undefined) mat.level = level;

    savePersistedMaterials();
    res.json({ success: true, material: mat, materials: studyMaterials });
  });

  // 20c. ADMIN: Check Backblaze B2 Connection Status
  app.get("/api/admin/b2-status", async (req, res) => {
    try {
      const native = await getB2NativeAuth();
      if (native && native.bucketName) {
        return res.json({
          connected: true,
          bucket: native.bucketName,
          endpoint: "s3.us-east-005.backblazeb2.com",
          bucketId: native.bucketId,
        });
      }

      const config = getBackblazeConfig();
      if (config) {
        return res.json({
          connected: true,
          bucket: config.bucket,
          endpoint: config.cleanEndpoint,
        });
      }

      res.json({
        connected: false,
        bucket: null,
      });
    } catch (e) {
      res.json({
        connected: false,
        bucket: null,
      });
    }
  });

  // 20d. ADMIN: Upload PDF file directly from Gallery / Files
  app.post("/api/admin/upload-file", async (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { filename, dataBase64, mimeType } = req.body;
    if (!dataBase64) {
      return res.status(400).json({ error: "No file data received." });
    }

    const safeFilename = (filename || "document.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const base64Content = dataBase64.includes(",") ? dataBase64.split(",")[1] : dataBase64;
    const buffer = Buffer.from(base64Content, "base64");

    // Save to disk for durability / local fallback
    try {
      const diskPath = path.join(uploadsDir, `${fileId}.pdf`);
      fs.writeFileSync(diskPath, buffer);
    } catch (err) {
      console.warn("Failed saving upload to disk:", err);
    }

    const formattedSize = buffer.length > 1024 * 1024
      ? `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(buffer.length / 1024)} KB`;

    let finalUrl = `/api/files/pdf/${fileId}/${encodeURIComponent(safeFilename)}`;
    let uploadedToB2 = false;
    let b2FileId: string | undefined;
    let b2Url: string | undefined;

    // Direct upload to Backblaze B2 (Supports both Master & App Keys)
    try {
      const objectKey = `materials/${fileId}-${safeFilename}`;
      const b2Res = await uploadBufferToB2(objectKey, buffer, mimeType || "application/pdf");
      if (b2Res.success) {
        uploadedToB2 = true;
        b2FileId = b2Res.fileId;
        b2Url = b2Res.url;
        // Keep finalUrl as `/api/files/pdf/${fileId}/${encodeURIComponent(safeFilename)}`
        // so documents are served locally through the inline streaming endpoint without Chrome X-Frame-Options blocking.
      } else {
        console.warn("B2 upload returned non-success, using local fallback:", b2Res.error);
      }
    } catch (b2Err: any) {
      console.warn("Failed uploading to Backblaze B2, fell back to local storage:", b2Err?.message);
    }

    uploadedPdfFiles.set(fileId, {
      id: fileId,
      filename: safeFilename,
      mimeType: mimeType || "application/pdf",
      size: buffer.length,
      dataBase64: base64Content,
      uploadedAt: new Date().toISOString(),
      b2FileId,
      b2Url,
    });

    res.json({
      success: true,
      fileId,
      filename: safeFilename,
      fileSize: formattedSize,
      url: finalUrl,
      uploadedToB2,
      dataUrl: `data:application/pdf;base64,${base64Content}`
    });
  });

  // 20e. Serve uploaded PDF files with inline headers for protected reader
  app.get("/api/files/pdf/:id/:filename?", async (req, res) => {
    const { id } = req.params;
    let buffer: Buffer | null = null;
    let filename = "document.pdf";
    let mimeType = "application/pdf";

    const memFile = uploadedPdfFiles.get(id);
    if (memFile) {
      buffer = Buffer.from(memFile.dataBase64, "base64");
      filename = memFile.filename;
      mimeType = memFile.mimeType || "application/pdf";
    } else {
      const diskPath = path.join(uploadsDir, `${id}.pdf`);
      if (fs.existsSync(diskPath)) {
        try {
          buffer = fs.readFileSync(diskPath);
        } catch (e) {}
      }
    }

    // If not in local cache or disk, retrieve from Backblaze B2
    if (!buffer && memFile?.b2FileId) {
      try {
        const b2 = await getB2NativeAuth();
        if (b2) {
          const dlRes = await fetch(`${b2.downloadUrl}/b2api/v3/b2_download_file_by_id?fileId=${memFile.b2FileId}`, {
            headers: { Authorization: b2.authorizationToken }
          });
          if (dlRes.ok) {
            buffer = Buffer.from(await dlRes.arrayBuffer());
          }
        }
      } catch (e) {
        console.warn("Failed retrieving PDF from B2:", e);
      }
    }

    if (!buffer) {
      return res.status(404).send("PDF document not found.");
    }

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.removeHeader("X-Frame-Options");
    res.send(buffer);
  });

  // 20f. Safe Document Proxy: Streams external PDFs (Backblaze B2, external URLs) 
  // with clean inline headers to prevent Chrome "This page has been blocked by Chrome" X-Frame-Options errors.
  app.get("/api/proxy-pdf", async (req, res) => {
    try {
      const rawUrl = req.query.url as string;
      if (!rawUrl || typeof rawUrl !== "string") {
        return res.status(400).send("Missing target document URL.");
      }

      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        return res.status(400).send("Invalid document URL format.");
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).send("Only HTTP and HTTPS URLs are permitted.");
      }

      // If it is a Backblaze B2 URL, try to include native B2 auth token if needed
      let b2AuthHeader = "";
      if (rawUrl.includes("backblazeb2.com") || rawUrl.includes(".b2.cloud")) {
        try {
          const b2 = await getB2NativeAuth();
          if (b2?.authorizationToken) {
            b2AuthHeader = b2.authorizationToken;
          }
        } catch (b2Err) {
          console.warn("Could not retrieve B2 auth for proxy:", b2Err);
        }
      }

      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/pdf,*/*;q=0.8"
      };
      if (b2AuthHeader && !rawUrl.includes("Authorization=")) {
        headers["Authorization"] = b2AuthHeader;
      }

      const fetchRes = await fetch(rawUrl, {
        headers,
        redirect: "follow"
      });

      if (!fetchRes.ok) {
        return res.status(fetchRes.status).send(`Remote document returned status ${fetchRes.status}`);
      }

      const contentType = fetchRes.headers.get("content-type") || "application/pdf";
      const buffer = Buffer.from(await fetchRes.arrayBuffer());

      const pathname = parsedUrl.pathname;
      const basename = path.basename(pathname) || "document.pdf";
      const safeBasename = basename.endsWith(".pdf") ? basename : `${basename}.pdf`;

      res.setHeader("Content-Type", contentType.includes("pdf") ? "application/pdf" : contentType);
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(safeBasename)}"`);
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("X-Content-Type-Options", "nosniff");
      // Explicitly allow embedding in our own frame
      res.removeHeader("X-Frame-Options");
      res.removeHeader("Content-Security-Policy");
      res.send(buffer);
    } catch (err: any) {
      console.error("Error proxying PDF document:", err);
      res.status(500).send("Unable to stream the requested document.");
    }
  });

  // 21. ADMIN: Post Batch Announcement
  app.post("/api/admin/announcements", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { batchId, title, message, priority, category, effectiveDate, isPinned } = req.body;
    const batch = batches.find(b => b.id === batchId);

    const newAnn: DBAnnouncement = {
      id: `ann-${Date.now()}`,
      batchId: batchId === 'all' ? 'all' : (batchId || (batch ? batch.id : "all")),
      batchName: batchId === 'all' ? "All Batches (Academy-wide)" : (batch ? batch.name : "All Batches (Academy-wide)"),
      title: title || "Official Academy Announcement",
      message: message || "",
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: "Ziyaur Rehman Zia",
      priority: priority || "Normal",
      category: category || "General",
      effectiveDate: effectiveDate || "",
      isPinned: Boolean(isPinned)
    };

    announcements.unshift(newAnn);
    res.json({ success: true, announcement: newAnn });
  });

  // 21b. PUBLIC: Get All Active Announcements & Notices
  app.get("/api/announcements", (req, res) => {
    res.json({ announcements });
  });

  // 21c. ADMIN: Update Announcement
  app.put("/api/admin/announcements/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { id } = req.params;
    const annIndex = announcements.findIndex(a => a.id === id);
    if (annIndex === -1) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    const { title, message, priority, category, effectiveDate, isPinned, batchId } = req.body;
    const batch = batches.find(b => b.id === batchId);

    announcements[annIndex] = {
      ...announcements[annIndex],
      title: title !== undefined ? title : announcements[annIndex].title,
      message: message !== undefined ? message : announcements[annIndex].message,
      priority: priority !== undefined ? priority : announcements[annIndex].priority,
      category: category !== undefined ? category : announcements[annIndex].category,
      effectiveDate: effectiveDate !== undefined ? effectiveDate : announcements[annIndex].effectiveDate,
      isPinned: isPinned !== undefined ? Boolean(isPinned) : announcements[annIndex].isPinned,
      batchId: batchId !== undefined ? (batchId === 'all' ? 'all' : (batch ? batch.id : batchId)) : announcements[annIndex].batchId,
      batchName: batchId === 'all' ? "All Batches (Academy-wide)" : (batch ? batch.name : announcements[annIndex].batchName)
    };

    res.json({ success: true, announcement: announcements[annIndex] });
  });

  // 21d. ADMIN: Delete Announcement
  app.delete("/api/admin/announcements/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { id } = req.params;
    const idx = announcements.findIndex(a => a.id === id);
    if (idx !== -1) {
      announcements.splice(idx, 1);
    }
    res.json({ success: true });
  });

  // 22. ADMIN: View Attendance Logs (Batch-wise)
  app.get("/api/admin/attendance", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { batchId, classId } = req.query;
    let list = attendanceRecords;
    if (batchId && typeof batchId === "string" && batchId !== "all") {
      list = list.filter(a => a.batchId === batchId);
    }
    if (classId && typeof classId === "string") {
      list = list.filter(a => a.classId === classId);
    }

    res.json({ attendance: list, totalCount: list.length });
  });

  // DELETE Student / Admission
  app.delete("/api/admin/students/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const regIdx = registrations.findIndex(r => r.id === id || r.admissionId === id);
    if (regIdx !== -1) {
      const reg = registrations[regIdx];
      registrations.splice(regIdx, 1);
      // Remove from users if exists
      const userIdx = users.findIndex(u => u.admissionId === reg.admissionId || u.email === reg.email);
      if (userIdx !== -1) {
        users.splice(userIdx, 1);
      }
      return res.json({ success: true, message: "Student admission deleted successfully." });
    }
    res.status(404).json({ error: "Student registration not found." });
  });

  // UPDATE Student / Admission
  app.put("/api/admin/students/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const reg = registrations.find(r => r.id === id || r.admissionId === id);
    if (!reg) return res.status(404).json({ error: "Student registration not found." });

    Object.assign(reg, req.body);
    res.json({ success: true, student: reg });
  });

  // UPDATE Batch
  app.put("/api/admin/batches/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const batch = batches.find(b => b.id === id);
    if (!batch) return res.status(404).json({ error: "Batch not found." });

    Object.assign(batch, req.body);
    res.json({ success: true, batch });
  });

  // DELETE Batch
  app.delete("/api/admin/batches/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const idx = batches.findIndex(b => b.id === id);
    if (idx !== -1) {
      batches.splice(idx, 1);
      return res.json({ success: true, message: "Batch deleted successfully." });
    }
    res.status(404).json({ error: "Batch not found." });
  });

  // UPDATE Class
  app.put("/api/admin/classes/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const cls = classes.find(c => c.id === id);
    if (!cls) return res.status(404).json({ error: "Class not found." });

    Object.assign(cls, req.body);
    res.json({ success: true, class: cls });
  });

  // DELETE Class
  app.delete("/api/admin/classes/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const idx = classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      classes.splice(idx, 1);
      return res.json({ success: true, message: "Class deleted successfully." });
    }
    res.status(404).json({ error: "Class not found." });
  });

  // UPDATE Recording
  app.put("/api/admin/recordings/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const rec = recordings.find(r => r.id === id);
    if (!rec) return res.status(404).json({ error: "Recording not found." });

    Object.assign(rec, req.body);
    res.json({ success: true, recording: rec });
  });

  // DELETE Recording
  app.delete("/api/admin/recordings/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const idx = recordings.findIndex(r => r.id === id);
    if (idx !== -1) {
      recordings.splice(idx, 1);
      return res.json({ success: true, message: "Recording deleted successfully." });
    }
    res.status(404).json({ error: "Recording not found." });
  });

  // DELETE Material
  app.delete("/api/admin/materials/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }
    const { id } = req.params;
    const idx = studyMaterials.findIndex(m => m.id === id);
    if (idx !== -1) {
      studyMaterials.splice(idx, 1);
      return res.json({ success: true, message: "Study material deleted.", materials: studyMaterials });
    }
    res.status(404).json({ error: "Material not found." });
  });

  // 23. CMS: Public Website Content & Admin Editable Content
  app.get("/api/cms/content", (req, res) => {
    res.json({ content: cmsContent });
  });

  app.post("/api/cms/content", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const { courses, testimonials, phoneNumbers, email, location, announcementText, announcementBtnText, showAnnouncement, settings } = req.body;
    if (courses) cmsContent.courses = courses;
    if (testimonials) cmsContent.testimonials = testimonials;
    if (phoneNumbers) cmsContent.phoneNumbers = phoneNumbers;
    if (email) cmsContent.email = email;
    if (location) cmsContent.location = location;
    if (announcementText !== undefined) cmsContent.announcementText = announcementText;
    if (announcementBtnText !== undefined) cmsContent.announcementBtnText = announcementBtnText;
    if (showAnnouncement !== undefined) cmsContent.showAnnouncement = showAnnouncement;
    if (settings) {
      cmsContent.settings = { ...cmsContent.settings, ...settings };
    }

    res.json({ success: true, content: cmsContent });
  });

  // 24. CONTACT FORM INQUIRY
  app.post("/api/contact", (req, res) => {
    const { name, contact, learningInterest, message } = req.body;
    if (!name || !contact || !message) {
      return res.status(400).json({ error: "Please fill in all contact form fields." });
    }

    const whatsappConfirmationText = 
`👋 *NEW INQUIRY RECEIVED — WITS LINGO*
━━━━━━━━━━━━━━━━━━━━
Dear *${name.trim()}*,
Thank you for contacting *WITS LINGO — A Global Language Platform*!

📋 *INQUIRY SUMMARY*
• *Name:* ${name.trim()}
• *Contact:* ${contact.trim()}
• *Course Interest:* ${learningInterest || 'Spoken English'}
• *Message:* ${message.trim()}

Our senior counsellor or mentor will get in touch with you shortly. You can also chat directly with us on WhatsApp: +91 8791287575.

*WITS LINGO*
_Learn Easily. Speak Naturally. Think Clearly._`;

    const encodedMsg = encodeURIComponent(whatsappConfirmationText);
    const rawContactDigits = (contact || "").toString().replace(/\D/g, "");
    const studentUrl = rawContactDigits.length === 10 ? `https://wa.me/91${rawContactDigits}?text=${encodedMsg}` : null;
    const adminUrl = `https://wa.me/918791287575?text=${encodedMsg}`;

    res.json({
      success: true,
      message: "Thank you for reaching out to WITS LINGO! Your inquiry has been received.",
      whatsapp: {
        confirmationMessage: whatsappConfirmationText,
        studentUrl,
        adminUrl
      }
    });
  });

  // 24A. FULL WEBSITE REPORT & ARCHITECTURE DOCUMENTATION ENDPOINT
  app.get("/api/documentation", (req, res) => {
    res.json({
      status: "success",
      academy: "WITS LINGO — A Global Language Platform",
      reportTitle: "WITS LINGO Full Architecture & System Documentation (A to Z)",
      generatedDate: new Date().toISOString(),
      metadata: {
        server: "Node.js Express 4.x",
        client: "React 18 + Vite + Tailwind CSS",
        storage: "Backblaze B2 & Disk Proxy",
        auth: "HMAC-SHA256 Token Engine",
        port: 3000
      },
      sections: {
        executiveSummary: "WITS LINGO is a global English language training and digital classroom ecosystem founded by Ziyaur Rehman Zia.",
        admissionEngine: "100% web-based registration without WhatsApp dependency, multi-currency fee submission, and instant downloadable PDF admission slip.",
        studentPortal: "Batch-isolated dashboard, live attendance logging, expiring signed playback tickets, anti-piracy video watermarking, and protected PDF reader.",
        adminPanel: "Full CRUD control over students, courses, batches, classes, Backblaze B2 study materials, and announcements.",
        apiDirectoryCount: 25
      }
    });
  });

  // 24B. COURSES MANAGEMENT & PUBLICATION CMS (Edit anytime, past or post publication)
  app.get("/api/courses", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    const includeAll = req.query.includeAll === "true" || (auth && auth.role === "admin");
    
    if (includeAll) {
      return res.json({ courses: cmsContent.courses });
    }
    // Public visitors see published courses (isPublished !== false)
    const publishedCourses = cmsContent.courses.filter((c: any) => c.isPublished !== false);
    res.json({ courses: publishedCourses });
  });

  app.post("/api/courses", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required to create courses." });
    }

    const { name, level, shortDescription, whatYouWillLearn, duration, learningFormat, fee, badge, isPublished } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Course name is required." });
    }

    const newCourse = {
      id: `course-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name,
      level: level || "Beginner",
      shortDescription: shortDescription || "",
      whatYouWillLearn: Array.isArray(whatYouWillLearn) ? whatYouWillLearn : [],
      duration: duration || "2 Months",
      learningFormat: learningFormat || "Live Online Classroom",
      fee: Number(fee) || 1199,
      badge: badge || "",
      isPublished: isPublished !== false // default to true if not specified
    };

    cmsContent.courses.push(newCourse);
    res.status(201).json({ success: true, course: newCourse, courses: cmsContent.courses });
  });

  app.put("/api/courses/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required to edit courses." });
    }

    const courseIndex = cmsContent.courses.findIndex((c: any) => c.id === req.params.id);
    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    const currentCourse = cmsContent.courses[courseIndex];
    const { name, level, shortDescription, whatYouWillLearn, duration, learningFormat, fee, badge, isPublished } = req.body;

    const updatedCourse = {
      ...currentCourse,
      name: name !== undefined ? name : currentCourse.name,
      level: level !== undefined ? level : currentCourse.level,
      shortDescription: shortDescription !== undefined ? shortDescription : currentCourse.shortDescription,
      whatYouWillLearn: Array.isArray(whatYouWillLearn) ? whatYouWillLearn : currentCourse.whatYouWillLearn,
      duration: duration !== undefined ? duration : currentCourse.duration,
      learningFormat: learningFormat !== undefined ? learningFormat : currentCourse.learningFormat,
      fee: fee !== undefined ? Number(fee) : currentCourse.fee,
      badge: badge !== undefined ? badge : currentCourse.badge,
      isPublished: isPublished !== undefined ? isPublished : currentCourse.isPublished
    };

    cmsContent.courses[courseIndex] = updatedCourse;
    res.json({ success: true, course: updatedCourse, courses: cmsContent.courses });
  });

  app.patch("/api/courses/:id/publish", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required." });
    }

    const courseIndex = cmsContent.courses.findIndex((c: any) => c.id === req.params.id);
    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    const currentCourse = cmsContent.courses[courseIndex];
    const newStatus = req.body.isPublished !== undefined ? Boolean(req.body.isPublished) : !Boolean(currentCourse.isPublished);
    currentCourse.isPublished = newStatus;

    res.json({ success: true, course: currentCourse, isPublished: newStatus, courses: cmsContent.courses });
  });

  app.delete("/api/courses/:id", (req, res) => {
    const auth = verifyAuthToken(req.headers.authorization);
    if (!auth || auth.role !== "admin") {
      return res.status(403).json({ error: "Admin authorization required to delete courses." });
    }

    const courseIndex = cmsContent.courses.findIndex((c: any) => c.id === req.params.id);
    if (courseIndex === -1) {
      return res.status(404).json({ error: "Course not found." });
    }

    const deleted = cmsContent.courses.splice(courseIndex, 1)[0];
    res.json({ success: true, deleted, courses: cmsContent.courses });
  });

  // 25. VITE / STATIC MIDDLEWARE SETUP
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Wits Lingo Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
