import React, { useState, useEffect } from 'react';
import { User, Batch, ClassSession, Recording, StudyMaterial, CourseData, TestimonialData, SiteSettings, Announcement } from '../types';
import { 
  Users, Layers, Video, Play, FileText, Settings, Plus, Trash2, 
  Edit3, CheckCircle2, Download, Search, ShieldCheck, LogOut, 
  ExternalLink, Filter, ArrowLeft, Save, Globe, MessageSquare, 
  X, Check, AlertTriangle, Phone, Mail, MapPin, Eye, EyeOff, RefreshCw,
  Megaphone, Pin, Clock, Calendar, Tag, Lock, Sparkles, Link as LinkIcon, BookOpen, Bell,
  Landmark, CreditCard
} from 'lucide-react';
import { AnnouncementModal } from './AnnouncementModal';
import { ProtectedPdfViewer } from './ProtectedPdfViewer';
import { PdfUploadInput } from './PdfUploadInput';
import { optimizePdfUrl } from '../utils/pdfOptimizer';
import { useScrollLock } from '../hooks/useScrollLock';
import { CountryCodePhoneInput } from './CountryCodePhoneInput';
import { CountryPhoneCode, DEFAULT_COUNTRY_CODE, ALL_COUNTRY_PHONE_CODES } from '../data/countryPhoneCodes';
import { AddressHierarchySelector } from './AddressHierarchySelector';

interface AdminPanelProps {
  currentUser: User;
  token: string;
  onLogout: () => void;
  onBackToHome?: () => void;
  onOpenSystemReport?: () => void;
  courses: CourseData[];
  onUpdateCourses: (courses: CourseData[]) => void;
  batches: Batch[];
  onUpdateBatches: (batches: Batch[]) => void;
  testimonials: TestimonialData[];
  onUpdateTestimonials: (testimonials: TestimonialData[]) => void;
  siteSettings: SiteSettings;
  onUpdateSiteSettings: (settings: SiteSettings) => void;
  announcements?: Announcement[];
  onUpdateAnnouncements?: (announcements: Announcement[]) => void;
  materials?: StudyMaterial[];
  onUpdateMaterials?: (materials: StudyMaterial[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  token,
  onLogout,
  onBackToHome,
  onOpenSystemReport,
  courses,
  onUpdateCourses,
  batches,
  onUpdateBatches,
  testimonials,
  onUpdateTestimonials,
  siteSettings,
  onUpdateSiteSettings,
  announcements = [],
  onUpdateAnnouncements,
  materials: externalMaterials = [],
  onUpdateMaterials
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'batches' | 'classes' | 'recordings' | 'materials' | 'testimonials' | 'announcements' | 'settings'>('students');
  
  // Data states
  const [students, setStudents] = useState<any[]>([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('All');
  const [searchStudent, setSearchStudent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Class, Recording, Material state
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    if (externalMaterials && externalMaterials.length > 0) return externalMaterials;
    try {
      const saved = localStorage.getItem('wits_lingo_materials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    if (externalMaterials && externalMaterials.length > 0) {
      setMaterials(externalMaterials);
    }
  }, [externalMaterials]);

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [courseVisibilityFilter, setCourseVisibilityFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseLevelFilter, setCourseLevelFilter] = useState('all');
  const [newBulletPointForEdit, setNewBulletPointForEdit] = useState('');
  const [newBulletPointForAdd, setNewBulletPointForAdd] = useState('');
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchVisibilityFilter, setBatchVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [showAddRecordingModal, setShowAddRecordingModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [previewingPdfMaterial, setPreviewingPdfMaterial] = useState<{ title: string; pdfUrl?: string; description?: string; category?: string; batchName?: string } | null>(null);
  const [materialFilterBatch, setMaterialFilterBatch] = useState<string>('all');
  const [showAddTestimonialModal, setShowAddTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialData | null>(null);

  // Delete Confirmation Modal State (Safe for sandboxed iframes - never blocks)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    itemName: string;
    itemType: string;
    description?: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Announcements & Holiday Notices state
  const [localAnnouncements, setLocalAnnouncements] = useState<Announcement[]>(announcements || []);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewingAnnouncement, setPreviewingAnnouncement] = useState<Announcement | null>(null);
  const [announcementFilter, setAnnouncementFilter] = useState<string>('all');

  const [newAnnouncement, setNewAnnouncement] = useState<{
    title: string;
    category: 'Holiday' | 'Class Notice' | 'Schedule Change' | 'Urgent Alert' | 'Exam / Test' | 'General';
    batchId: string;
    priority: 'Normal' | 'Important' | 'Urgent';
    effectiveDate: string;
    message: string;
    isPinned: boolean;
  }>({
    title: '',
    category: 'Holiday',
    batchId: 'all',
    priority: 'Important',
    effectiveDate: '',
    message: '',
    isPinned: false
  });

  // Lock background body scroll whenever any admin modal/overlay is open
  const isAnyAdminModalOpen = Boolean(
    showAddStudentModal ||
    editingStudent ||
    showAddCourseModal ||
    editingCourse ||
    showAddBatchModal ||
    editingBatch ||
    showAddClassModal ||
    editingClass ||
    showAddRecordingModal ||
    showAddMaterialModal ||
    editingMaterial ||
    previewingPdfMaterial ||
    showAddTestimonialModal ||
    editingTestimonial ||
    showAddAnnouncementModal ||
    editingAnnouncement ||
    previewingAnnouncement ||
    deleteModal
  );
  useScrollLock(isAnyAdminModalOpen);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      setLocalAnnouncements(announcements);
    }
  }, [announcements]);

  const updateAllAnnouncements = (newAnns: Announcement[]) => {
    setLocalAnnouncements(newAnns);
    if (onUpdateAnnouncements) {
      onUpdateAnnouncements(newAnns);
    }
  };

  // Form states for new additions
  const [adminPhoneCountry, setAdminPhoneCountry] = useState<CountryPhoneCode>(DEFAULT_COUNTRY_CODE);
  const [adminWhatsappCountry, setAdminWhatsappCountry] = useState<CountryPhoneCode>(DEFAULT_COUNTRY_CODE);
  const [newStudent, setNewStudent] = useState({
    name: '',
    fatherName: '',
    dob: '2000-01-01',
    phone: '',
    whatsapp: '',
    email: '',
    country: 'India',
    state: 'Uttar Pradesh',
    district: 'Amroha',
    pincode: '244221',
    address: '',
    batchId: batches[0]?.id || 'batch-spoken-oct-2026',
    courseId: courses[0]?.id || 'course-spoken-english'
  });

  const [newCourse, setNewCourse] = useState<Partial<CourseData>>({
    name: '',
    level: 'Beginner to Intermediate',
    shortDescription: '',
    whatYouWillLearn: ['Master natural conversational speaking', 'Overcome public hesitation and stage fear', 'Daily vocabulary in context', 'Pronunciation and accent clarity'],
    duration: '2 Months (40 Sessions)',
    learningFormat: 'Live Online Classroom (Evening Batches)',
    fee: 1499,
    badge: 'Popular'
  });

  const [newBatch, setNewBatch] = useState<Partial<Batch>>({
    name: '',
    batchCode: '',
    courseId: courses[0]?.id || 'course-spoken-english',
    courseName: courses[0]?.name || 'Spoken English',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    scheduleTime: '07:30 PM - 08:30 PM IST (Mon, Wed, Fri)',
    maxCapacity: 35,
    maxStudents: 35,
    currentStudentsCount: 0,
    enrolledCount: 0,
    status: 'Upcoming',
    teacherName: 'Ziyaur Rehman Zia',
    isVisibleOnWebsite: true
  });

  const [newClass, setNewClass] = useState({
    batchId: batches[0]?.id || 'batch-spoken-oct-2026',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '07:30 PM - 08:30 PM IST',
    joinUrl: 'https://meet.google.com/wits-lingo-live',
    instructorName: 'Ziyaur Rehman Zia'
  });

  const [newRecording, setNewRecording] = useState({
    batchId: batches[0]?.id || 'batch-spoken-oct-2026',
    title: '',
    topic: 'Spoken English Practice',
    duration: '60 min',
    videoUrl: 'https://www.youtube.com',
    recordedDate: new Date().toLocaleDateString('en-GB'),
    description: 'Auto-synced class recording for enrolled students.'
  });

  const [newMaterial, setNewMaterial] = useState({
    batchId: 'all',
    title: '',
    description: 'Practical PDF notes & daily vocabulary drill sheet.',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    downloadUrl: '',
    pdfUrl: '',
    isViewOnly: true,
    category: 'Worksheets',
    level: 'All Levels',
    isVisibleOnWebsite: true
  });

  const [newTestimonial, setNewTestimonial] = useState<Partial<TestimonialData>>({
    studentName: '',
    courseBatch: 'Spoken English • Batch 01',
    city: 'Amroha, UP',
    testimonial: '',
    verified: true
  });

  // Local site settings copy for CMS editing
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...siteSettings });

  // Show transient feedback message
  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Load initial admin data
  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Batches
      const bRes = await fetch('/api/batches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        if (Array.isArray(bData) && bData.length > 0) {
          onUpdateBatches(bData);
        }
      }

      // 2. Students
      const sRes = await fetch('/api/admin/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sRes.ok) {
        const sData = await sRes.json();
        setStudents(sData.students || []);
      }

      // 3. Classes
      const cRes = await fetch('/api/batches/batch-spoken-oct-2026/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        setClasses(Array.isArray(cData) ? cData : (cData.classes || []));
      }

      // 4. Study Materials
      const mRes = await fetch('/api/admin/materials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        const loaded = Array.isArray(mData) ? mData : (mData.materials || []);
        setMaterials(loaded);
        if (onUpdateMaterials) onUpdateMaterials(loaded);
        try {
          localStorage.setItem('wits_lingo_materials', JSON.stringify(loaded));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // 1. STUDENTS / ADMISSIONS HANDLERS
  // ----------------------------------------------------------------------
  const filteredStudents = students.filter((st) => {
    const matchesBatch = selectedBatchFilter === 'All' || 
      st.batchId === selectedBatchFilter || 
      (st.enrolledBatchIds && st.enrolledBatchIds.includes(selectedBatchFilter));
    const matchesSearch = 
      st.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      st.district?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      st.phone?.includes(searchStudent) ||
      st.admissionId?.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const handleDeleteStudent = (studentId: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Student Admission',
      itemName: name,
      itemType: 'student admission record',
      description: `Are you sure you want to delete the admission record for "${name}" (${studentId})? This student will be removed from all enrolled batch rosters and portal access.`,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (err) {
          console.error('Delete student error', err);
        }
        setStudents(prev => prev.filter(s => s.id !== studentId && s.admissionId !== studentId));
        triggerFeedback(`Student admission for "${name}" deleted.`);
      }
    });
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await fetch(`/api/admin/students/${editingStudent.id || editingStudent.admissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingStudent)
      });
      setStudents(prev => prev.map(s => (s.id === editingStudent.id ? editingStudent : s)));
      setEditingStudent(null);
      triggerFeedback('Student admission details updated successfully.');
    } catch (err) {
      setStudents(prev => prev.map(s => (s.id === editingStudent.id ? editingStudent : s)));
      setEditingStudent(null);
      triggerFeedback('Student details saved.');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = newStudent.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert('Mobile Phone Number is required and must be exactly 10 digits.');
      return;
    }
    const cleanWhatsapp = (newStudent.whatsapp || '').replace(/\D/g, '');
    if (cleanWhatsapp.length !== 10) {
      alert('WhatsApp Number is required and must be exactly 10 digits.');
      return;
    }
    const createdId = `reg-${Date.now()}`;
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const admissionId = `WL-OCT26-${randomSeq}`;
    const targetBatch = batches.find(b => b.id === newStudent.batchId);
    const targetCourse = courses.find(c => c.id === newStudent.courseId);

    const record = {
      id: createdId,
      admissionId,
      name: newStudent.name.trim(),
      fatherName: newStudent.fatherName.trim(),
      dob: newStudent.dob,
      phone: `${adminPhoneCountry.dialCode} ${cleanPhone}`,
      whatsapp: `${adminWhatsappCountry.dialCode} ${cleanWhatsapp}`,
      email: newStudent.email.trim().toLowerCase(),
      country: newStudent.country || 'India',
      district: newStudent.district.trim(),
      state: newStudent.state.trim(),
      pincode: newStudent.pincode.trim(),
      address: newStudent.address || `${newStudent.district}, ${newStudent.state}, ${newStudent.country}`,
      batchId: newStudent.batchId,
      batchName: targetBatch?.name || 'Spoken English Batch',
      enrolledBatchIds: [newStudent.batchId],
      courseId: newStudent.courseId,
      courseName: targetCourse?.name || 'Spoken English',
      paymentStatus: 'Paid' as const,
      paymentMethod: 'Cash / Manual Admission',
      registeredAt: new Date().toISOString()
    };

    setStudents([record, ...students]);
    setShowAddStudentModal(false);
    setNewStudent({
      name: '',
      fatherName: '',
      dob: '2000-01-01',
      phone: '',
      whatsapp: '',
      email: '',
      country: 'India',
      state: 'Uttar Pradesh',
      district: 'Amroha',
      pincode: '244221',
      address: '',
      batchId: batches[0]?.id || 'batch-spoken-oct-2026',
      courseId: courses[0]?.id || 'course-spoken-english'
    });
    triggerFeedback(`Student "${record.name}" admitted successfully! (Admission ID: ${admissionId})`);
  };

  const handleExportCSV = () => {
    const headers = ['Admission ID', 'Student Name', "Father's Name", 'DOB', 'Country', 'State', 'District', 'PIN / Postal Code', 'Phone', 'WhatsApp', 'Email', 'Batch', 'Fee Status'];
    const rows = filteredStudents.map(s => [
      s.admissionId || '',
      `"${s.name || ''}"`,
      `"${s.fatherName || ''}"`,
      s.dob || '',
      `"${s.country || 'India'}"`,
      `"${s.state || ''}"`,
      `"${s.district || ''}"`,
      `"${s.pincode || ''}"`,
      s.phone || '',
      s.whatsapp || '',
      s.email || '',
      `"${s.batchName || (s.enrolledBatchIds ? s.enrolledBatchIds.join(', ') : '')}"`,
      s.paymentStatus || 'Paid'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wits_Lingo_Students_${selectedBatchFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------------------------
  // 2. COURSES CMS HANDLERS (Editable at any time, past or post publication)
  // ----------------------------------------------------------------------
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name) return;
    const courseToAdd: CourseData = {
      id: `course-${newCourse.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name: newCourse.name,
      level: newCourse.level || 'Beginner to Intermediate',
      shortDescription: newCourse.shortDescription || 'Practical language training.',
      whatYouWillLearn: Array.isArray(newCourse.whatYouWillLearn) && newCourse.whatYouWillLearn.length > 0
        ? newCourse.whatYouWillLearn
        : ['Master natural conversational speaking', 'Overcome public hesitation and stage fear', 'Daily vocabulary in context', 'Pronunciation and accent clarity'],
      duration: newCourse.duration || '2 Months (40 Sessions)',
      learningFormat: newCourse.learningFormat || 'Live Online Classroom',
      fee: Number(newCourse.fee) || 1499,
      badge: newCourse.badge || '',
      isPublished: newCourse.isPublished !== false
    };
    const updated = [...courses, courseToAdd];
    onUpdateCourses(updated);
    setShowAddCourseModal(false);
    setNewBulletPointForAdd('');
    triggerFeedback(
      courseToAdd.isPublished
        ? `New course "${courseToAdd.name}" published live to website!`
        : `New course "${courseToAdd.name}" saved as draft (unpublished).`
    );
  };

  const handleSaveEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    const updated = courses.map(c => c.id === editingCourse.id ? editingCourse : c);
    onUpdateCourses(updated);
    setEditingCourse(null);
    setNewBulletPointForEdit('');
    triggerFeedback(`Course "${editingCourse.name}" changes saved successfully! (Status: ${editingCourse.isPublished !== false ? 'Live Published' : 'Draft / Unpublished'})`);
  };

  const handleTogglePublishCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    const nextStatus = !(course.isPublished !== false);
    const updated = courses.map(c => c.id === courseId ? { ...c, isPublished: nextStatus } : c);
    onUpdateCourses(updated);
    triggerFeedback(
      nextStatus
        ? `Course "${course.name}" is now LIVE on website (Published)!`
        : `Course "${course.name}" is now UNPUBLISHED (Saved as Draft, hidden from public visitors).`
    );
  };

  const handleDeleteCourse = (courseId: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Course',
      itemName: name,
      itemType: 'course',
      description: `Are you sure you want to permanently delete course "${name}" from the academy catalog? This action cannot be undone.`,
      onConfirm: () => {
        const updated = courses.filter(c => c.id !== courseId);
        onUpdateCourses(updated);
        triggerFeedback(`Course "${name}" deleted.`);
      }
    });
  };

  // ----------------------------------------------------------------------
  // 3. BATCHES HANDLERS
  // ----------------------------------------------------------------------
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatch.name || !newBatch.batchCode) return;
    const batchToAdd: Batch = {
      id: `batch-${newBatch.batchCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name: newBatch.name,
      batchCode: newBatch.batchCode,
      courseId: newBatch.courseId || courses[0]?.id || 'course-spoken-english',
      courseName: newBatch.courseName || courses[0]?.name || 'Spoken English',
      startDate: newBatch.startDate || '2026-10-01',
      endDate: newBatch.endDate || '2026-12-31',
      scheduleTime: newBatch.scheduleTime || '07:30 PM - 08:30 PM IST',
      maxCapacity: Number(newBatch.maxCapacity) || 35,
      maxStudents: Number(newBatch.maxCapacity) || 35,
      currentStudentsCount: 0,
      enrolledCount: 0,
      status: newBatch.status || 'Upcoming',
      teacherName: newBatch.teacherName || 'Ziyaur Rehman Zia',
      isVisibleOnWebsite: newBatch.isVisibleOnWebsite !== false
    };

    try {
      await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(batchToAdd)
      });
    } catch (e) {}

    const updated = [batchToAdd, ...batches];
    onUpdateBatches(updated);
    setShowAddBatchModal(false);
    setNewBatch({
      name: '',
      batchCode: '',
      courseId: courses[0]?.id || 'course-spoken-english',
      courseName: courses[0]?.name || 'Spoken English',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      scheduleTime: '07:30 PM - 08:30 PM IST (Mon, Wed, Fri)',
      maxCapacity: 35,
      maxStudents: 35,
      currentStudentsCount: 0,
      enrolledCount: 0,
      status: 'Upcoming',
      teacherName: 'Ziyaur Rehman Zia',
      isVisibleOnWebsite: true
    });
    triggerFeedback(`Batch "${batchToAdd.name}" created.`);
  };

  const handleToggleBatchVisibility = async (batchId: string) => {
    const target = batches.find(b => b.id === batchId);
    if (!target) return;
    const nextState = !(target.isVisibleOnWebsite !== false);
    const updatedBatch: Batch = {
      ...target,
      isVisibleOnWebsite: nextState
    };
    try {
      await fetch(`/api/admin/batches/${batchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedBatch)
      });
    } catch (e) {}
    const updated = batches.map(b => b.id === batchId ? updatedBatch : b);
    onUpdateBatches(updated);
    triggerFeedback(
      nextState
        ? `Batch "${target.name}" is now VISIBLE on website.`
        : `Batch "${target.name}" is now HIDDEN from website.`
    );
  };

  const handleToggleShowBatchesSection = async () => {
    const nextState = !(localSettings.showBatchesSection ?? true);
    const updatedSettings: SiteSettings = {
      ...localSettings,
      showBatchesSection: nextState
    };
    setLocalSettings(updatedSettings);
    onUpdateSiteSettings(updatedSettings);
    try {
      await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          showBatchesSection: nextState,
          settings: updatedSettings
        })
      });
    } catch (e) {}
    triggerFeedback(
      nextState
        ? 'Batches & Seat Capacity section is now VISIBLE on public website!'
        : 'Batches & Seat Capacity section is now HIDDEN from public website.'
    );
  };

  const handleSaveEditBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    try {
      await fetch(`/api/admin/batches/${editingBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingBatch)
      });
    } catch (e) {}
    const updated = batches.map(b => b.id === editingBatch.id ? editingBatch : b);
    onUpdateBatches(updated);
    setEditingBatch(null);
    triggerFeedback(`Batch "${editingBatch.name}" updated.`);
  };

  const handleDeleteBatch = (batchId: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Batch',
      itemName: name,
      itemType: 'batch',
      description: `Are you sure you want to delete batch "${name}"? Active schedules and class rosters associated with this batch will be impacted.`,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/batches/${batchId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (e) {}
        const updated = batches.filter(b => b.id !== batchId);
        onUpdateBatches(updated);
        triggerFeedback(`Batch "${name}" deleted.`);
      }
    });
  };

  // ----------------------------------------------------------------------
  // 4. LIVE CLASSES HANDLERS
  // ----------------------------------------------------------------------
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: ClassSession = {
      id: `cls-${Date.now()}`,
      batchId: newClass.batchId,
      batchName: batches.find(b => b.id === newClass.batchId)?.name || 'Spoken English Batch',
      title: newClass.title,
      topic: 'Live English Session',
      classNumber: classes.length + 1,
      startTime: '07:30 PM',
      endTime: '08:30 PM',
      durationMinutes: 60,
      teacherName: newClass.instructorName || 'Ziyaur Rehman Zia',
      description: newClass.description || 'Live interactive session.',
      date: newClass.date,
      time: newClass.time,
      status: 'Upcoming',
      joinUrl: newClass.joinUrl,
      instructorName: newClass.instructorName,
      hasStudyMaterial: false,
      hasAssignment: false
    };
    try {
      await fetch(`/api/admin/batches/${newClass.batchId}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(created)
      });
    } catch (e) {}
    setClasses([created, ...classes]);
    setShowAddClassModal(false);
    triggerFeedback(`Class "${created.title}" scheduled! Enrolled students will see it in their dashboard.`);
  };

  const handleToggleClassStatus = async (clsId: string, newStatus: 'Upcoming' | 'Live' | 'Completed') => {
    setClasses(prev => prev.map(c => c.id === clsId ? { ...c, status: newStatus } : c));
    try {
      await fetch(`/api/admin/classes/${clsId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
    triggerFeedback(`Class status switched to ${newStatus}.`);
  };

  const handleDeleteClass = (clsId: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Class Session',
      itemName: title,
      itemType: 'scheduled class',
      description: `Are you sure you want to delete the class session "${title}"?`,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/classes/${clsId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (e) {}
        setClasses(prev => prev.filter(c => c.id !== clsId));
        triggerFeedback(`Class "${title}" deleted.`);
      }
    });
  };

  // ----------------------------------------------------------------------
  // 5. RECORDINGS HANDLERS
  // ----------------------------------------------------------------------
  const handleAddRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    const rec: Recording = {
      id: `rec-${Date.now()}`,
      batchId: newRecording.batchId,
      batchName: batches.find(b => b.id === newRecording.batchId)?.name || 'Spoken English',
      classId: `cls-${Date.now()}`,
      title: newRecording.title,
      topic: newRecording.topic,
      classNumber: recordings.length + 1,
      date: newRecording.recordedDate,
      duration: newRecording.duration,
      status: 'Available',
      videoKey: newRecording.videoUrl,
      recordedDate: newRecording.recordedDate,
      description: newRecording.description
    };
    try {
      await fetch('/api/admin/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(rec)
      });
    } catch (e) {}
    setRecordings([rec, ...recordings]);
    setShowAddRecordingModal(false);
    triggerFeedback(`Recording "${rec.title}" uploaded.`);
  };

  const handleDeleteRecording = (recId: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Recording',
      itemName: title,
      itemType: 'lecture recording',
      description: `Are you sure you want to delete recording "${title}" from the student vault?`,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/recordings/${recId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (e) {}
        setRecordings(prev => prev.filter(r => r.id !== recId));
        triggerFeedback(`Recording deleted.`);
      }
    });
  };

  // ----------------------------------------------------------------------
  // 6. STUDY MATERIALS HANDLERS (With PDF Link & View-Only Protection)
  // ----------------------------------------------------------------------
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const opt = optimizePdfUrl(newMaterial.pdfUrl);
    const mat: StudyMaterial = {
      id: `mat-${Date.now()}`,
      batchId: newMaterial.batchId || 'all',
      title: newMaterial.title,
      description: newMaterial.description,
      fileType: (newMaterial.fileType as 'pdf' | 'doc' | 'notes') || 'pdf',
      fileSize: newMaterial.fileSize || '2.1 MB',
      downloadUrl: '#',
      pdfUrl: opt.embedUrl || newMaterial.pdfUrl,
      isViewOnly: newMaterial.isViewOnly !== false,
      allowDownload: false,
      uploadedAt: new Date().toLocaleDateString('en-GB'),
      uploadedDate: new Date().toLocaleDateString('en-GB'),
      category: newMaterial.category || 'Worksheets',
      level: newMaterial.level || 'All Levels',
      isVisibleOnWebsite: newMaterial.isVisibleOnWebsite !== false
    };

    let updatedList = [mat, ...materials];
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(mat)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.materials && Array.isArray(data.materials)) {
          updatedList = data.materials;
        }
      }
    } catch (e) {
      console.warn('Failed to upload material to backend:', e);
    }

    setMaterials(updatedList);
    if (onUpdateMaterials) onUpdateMaterials(updatedList);
    try {
      localStorage.setItem('wits_lingo_materials', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('wits_lingo_material_updated', { detail: updatedList }));
    } catch (e) {}

    setShowAddMaterialModal(false);
    setNewMaterial({
      batchId: 'all',
      title: '',
      description: 'Practical PDF notes & daily vocabulary drill sheet.',
      fileType: 'pdf',
      fileSize: '1.8 MB',
      downloadUrl: '',
      pdfUrl: '',
      isViewOnly: true,
      category: 'Worksheets',
      level: 'All Levels',
      isVisibleOnWebsite: true
    });
    triggerFeedback(`Study material "${mat.title}" published & visible on website!`);
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    const opt = optimizePdfUrl(editingMaterial.pdfUrl || '');
    const updated: StudyMaterial = {
      ...editingMaterial,
      pdfUrl: opt.embedUrl || editingMaterial.pdfUrl,
      isViewOnly: editingMaterial.isViewOnly !== false,
      allowDownload: false,
      category: editingMaterial.category || 'Worksheets',
      level: editingMaterial.level || 'All Levels',
      isVisibleOnWebsite: editingMaterial.isVisibleOnWebsite !== false
    };

    let updatedList = materials.map(m => m.id === editingMaterial.id ? updated : m);
    try {
      const res = await fetch(`/api/admin/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.materials && Array.isArray(data.materials)) {
          updatedList = data.materials;
        }
      }
    } catch (e) {
      console.warn('Failed to update material on backend:', e);
    }

    setMaterials(updatedList);
    if (onUpdateMaterials) onUpdateMaterials(updatedList);
    try {
      localStorage.setItem('wits_lingo_materials', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('wits_lingo_material_updated', { detail: updatedList }));
    } catch (e) {}

    setEditingMaterial(null);
    triggerFeedback(`Study material "${updated.title}" updated.`);
  };

  const handleDeleteMaterial = (matId: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Study Material',
      itemName: title,
      itemType: 'study resource',
      description: `Are you sure you want to delete "${title}"? Students and website visitors will no longer be able to open or view this material.`,
      onConfirm: async () => {
        let updatedList = materials.filter(m => m.id !== matId);
        try {
          const res = await fetch(`/api/admin/materials/${matId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.materials && Array.isArray(data.materials)) {
              updatedList = data.materials;
            }
          }
        } catch (e) {
          console.warn('Failed to delete material on backend:', e);
        }

        setMaterials(updatedList);
        if (onUpdateMaterials) onUpdateMaterials(updatedList);
        try {
          localStorage.setItem('wits_lingo_materials', JSON.stringify(updatedList));
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('wits_lingo_material_updated', { detail: updatedList }));
        } catch (e) {}

        triggerFeedback(`Study material deleted.`);
      }
    });
  };

  // ----------------------------------------------------------------------
  // 7. TESTIMONIALS HANDLERS
  // ----------------------------------------------------------------------
  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.studentName || !newTestimonial.testimonial) return;
    const item: TestimonialData = {
      id: `test-${Date.now()}`,
      studentName: newTestimonial.studentName,
      courseBatch: newTestimonial.courseBatch || 'Spoken English',
      city: newTestimonial.city || 'India',
      testimonial: newTestimonial.testimonial,
      verified: newTestimonial.verified ?? true
    };
    const updated = [item, ...testimonials];
    onUpdateTestimonials(updated);
    setShowAddTestimonialModal(false);
    triggerFeedback(`Review from "${item.studentName}" published on homepage!`);
  };

  const handleSaveEditTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    const updated = testimonials.map(t => t.id === editingTestimonial.id ? editingTestimonial : t);
    onUpdateTestimonials(updated);
    setEditingTestimonial(null);
    triggerFeedback('Testimonial updated.');
  };

  const handleDeleteTestimonial = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Testimonial',
      itemName: name,
      itemType: 'student review',
      description: `Are you sure you want to delete the testimonial from "${name}"? It will be removed from the homepage reviews section.`,
      onConfirm: () => {
        const updated = testimonials.filter(t => t.id !== id);
        onUpdateTestimonials(updated);
        triggerFeedback(`Review deleted.`);
      }
    });
  };

  // ----------------------------------------------------------------------
  // 7b. ANNOUNCEMENTS & HOLIDAYS MANAGEMENT
  // ----------------------------------------------------------------------
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      triggerFeedback('Please provide both notice title and description.');
      return;
    }

    const targetBatch = batches.find(b => b.id === newAnnouncement.batchId);
    const batchName = newAnnouncement.batchId === 'all' 
      ? 'All Batches (Academy-wide)' 
      : (targetBatch?.name || 'All Batches');

    const createdAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title.trim(),
      message: newAnnouncement.message.trim(),
      category: newAnnouncement.category,
      batchId: newAnnouncement.batchId,
      batchName,
      priority: newAnnouncement.priority,
      effectiveDate: newAnnouncement.effectiveDate.trim() || new Date().toLocaleDateString('en-GB'),
      isPinned: newAnnouncement.isPinned,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: siteSettings?.founderName || 'Ziyaur Rehman Zia'
    };

    try {
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(createdAnn)
      });
    } catch (err) {}

    const updated = [createdAnn, ...localAnnouncements];
    updateAllAnnouncements(updated);
    setShowAddAnnouncementModal(false);
    setNewAnnouncement({
      title: '',
      category: 'Holiday',
      batchId: 'all',
      priority: 'Important',
      effectiveDate: '',
      message: '',
      isPinned: false
    });
    triggerFeedback(`Notice "${createdAnn.title}" published successfully!`);
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    const targetBatch = batches.find(b => b.id === editingAnnouncement.batchId);
    const updatedRecord: Announcement = {
      ...editingAnnouncement,
      batchName: editingAnnouncement.batchId === 'all'
        ? 'All Batches (Academy-wide)'
        : (targetBatch?.name || editingAnnouncement.batchName)
    };

    try {
      await fetch(`/api/admin/announcements/${updatedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedRecord)
      });
    } catch (err) {}

    const updated = localAnnouncements.map(a => a.id === updatedRecord.id ? updatedRecord : a);
    updateAllAnnouncements(updated);
    setEditingAnnouncement(null);
    triggerFeedback(`Notice "${updatedRecord.title}" updated.`);
  };

  const handleDeleteAnnouncement = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Notice',
      itemName: title,
      itemType: 'academy circular',
      description: `Are you sure you want to remove the notice "${title}"? It will no longer be visible on student notices or homepage boards.`,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/announcements/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (err) {}

        const updated = localAnnouncements.filter(a => a.id !== id);
        updateAllAnnouncements(updated);
        triggerFeedback(`Notice removed.`);
      }
    });
  };

  const handleTogglePinAnnouncement = async (id: string) => {
    const target = localAnnouncements.find(a => a.id === id);
    if (!target) return;
    const updatedTarget = { ...target, isPinned: !target.isPinned };
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isPinned: updatedTarget.isPinned })
      });
    } catch (err) {}

    const updated = localAnnouncements.map(a => a.id === id ? updatedTarget : a);
    updateAllAnnouncements(updated);
    triggerFeedback(updatedTarget.isPinned ? `Notice pinned to top.` : `Notice unpinned.`);
  };

  // ----------------------------------------------------------------------
  // 8. SITE SETTINGS & CMS SAVE
  // ----------------------------------------------------------------------
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSiteSettings(localSettings);
    try {
      await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          phoneNumbers: [localSettings.phone1, localSettings.phone2],
          email: localSettings.email,
          location: localSettings.address,
          announcementText: localSettings.announcementText,
          announcementBtnText: localSettings.announcementBtnText || '',
          showAnnouncement: localSettings.showAnnouncement,
          settings: localSettings
        })
      });
    } catch (e) {}
    triggerFeedback('All website settings and top announcement banner saved live!');
  };

  return (
    <div className="min-h-screen bg-[#F8F6FB] pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Toast / Feedback Banner */}
        {feedbackMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#3B0764] text-white px-5 py-3 rounded-2xl shadow-xl border border-purple-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-xs font-semibold">{feedbackMessage}</span>
          </div>
        )}

        {/* Top Navigation & Brand Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#3B0764] to-[#4A1D96] text-white flex items-center justify-center font-extrabold text-lg shadow-md tracking-wider">
              ZRZ
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-[#4A1D96]">
                  Wits Lingo Academy Master Admin
                </span>
                <span className="text-xs text-slate-400">
                  Logged in as: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.email})
                </span>
              </div>
              <h1 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Website & Academy Control Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, change, or delete any function, course, batch, admission, class, recording, or setting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
            {onOpenSystemReport && (
              <button
                onClick={onOpenSystemReport}
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#4A1D96] text-xs font-bold transition-colors flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                title="Download full report of the website as PDF"
              >
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                <span>Website Report (PDF)</span>
              </button>
            )}

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                id="admin-view-website-btn"
                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#4A1D96] text-xs font-bold transition-colors flex items-center gap-1.5 border border-purple-200 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>View Live Website</span>
              </button>
            )}

            <button
              onClick={onLogout}
              id="admin-logout-btn"
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-red-50 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 border-b border-purple-100 pb-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'students', label: `Admissions & Students (${students.length})`, icon: Users },
            { id: 'courses', label: `Courses & Pricing (${courses.length})`, icon: Layers },
            { id: 'batches', label: `Batches & Capacity (${batches.length})`, icon: RefreshCw },
            { id: 'classes', label: 'Live Classes Scheduler', icon: Video },
            { id: 'recordings', label: 'Class Recordings', icon: Play },
            { id: 'materials', label: 'Study Notes & PDFs', icon: FileText },
            { id: 'testimonials', label: `Student Reviews (${testimonials.length})`, icon: MessageSquare },
            { id: 'announcements', label: `Notices & Holidays (${localAnnouncements.length})`, icon: Megaphone },
            { id: 'settings', label: 'Website CMS & Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#4A1D96] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-[#4A1D96]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: ADMISSIONS & REGISTERED STUDENTS */}
        {/* ==================================================================== */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                  Student Admissions & Records
                </h2>
                <p className="text-xs text-slate-500">
                  Search, edit, verify, or remove enrolled students across all academy batches.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  id="admin-add-student-btn"
                  className="px-3.5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admit New Student</span>
                </button>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={selectedBatchFilter}
                    onChange={(e) => setSelectedBatchFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="All">All Batches</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student, phone, city..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#4A1D96] w-48 sm:w-60"
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                  title="Download CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3 px-4 rounded-l-xl">Admission ID</th>
                    <th className="py-3 px-4">Student & Parent</th>
                    <th className="py-3 px-4">District & State</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Batch Enrolled</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((st) => (
                      <tr key={st.id || st.admissionId} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#4A1D96]">
                          {st.admissionId || 'WL-PENDING'}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[11px] text-slate-500">S/D/O {st.fatherName || 'Guardian'}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <p className="font-semibold text-slate-900">{st.district || 'Amroha'}, {st.state || 'UP'}</p>
                          <p className="text-[11px] text-slate-500">
                            {st.country || 'India'}{st.pincode ? ` • ${st.pincode}` : ''}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-900">{st.phone}</p>
                          <p className="text-[11px] text-slate-500">{st.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-[#4A1D96] border border-purple-200">
                            {batches.find(b => b.id === st.batchId)?.name || st.batchName || 'October Batch'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                {st.paymentStatus || 'Paid'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-800">
                                {st.paymentAmountFormatted || `₹${st.feeAmount || 1499}`}
                              </span>
                            </div>
                            <p className="text-[10px] font-semibold text-purple-900 truncate max-w-[130px]" title={st.paymentMethod}>
                              {st.paymentMethod || 'UPI / Bank'}
                            </p>
                            {st.paymentTxnId && (
                              <p className="text-[9px] font-mono text-slate-400 truncate max-w-[125px]" title={st.paymentTxnId}>
                                Ref: {st.paymentTxnId}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setEditingStudent({ ...st })}
                            title="Edit Student"
                            className="p-1.5 text-slate-400 hover:text-[#4A1D96] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st.id || st.admissionId, st.name)}
                            title="Delete Student"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: COURSES CATALOG & PRICING CMS (Anytime Editable Past or Post Publication) */}
        {/* ==================================================================== */}
        {activeTab === 'courses' && (() => {
          const totalCount = courses.length;
          const publishedCount = courses.filter(c => c.isPublished !== false).length;
          const draftCount = courses.filter(c => c.isPublished === false).length;

          const filteredCourses = courses.filter((course) => {
            if (courseVisibilityFilter === 'published' && course.isPublished === false) return false;
            if (courseVisibilityFilter === 'draft' && course.isPublished !== false) return false;
            if (courseLevelFilter !== 'all' && !course.level.toLowerCase().includes(courseLevelFilter.toLowerCase())) return false;
            if (courseSearchQuery.trim()) {
              const q = courseSearchQuery.toLowerCase();
              const matchName = course.name.toLowerCase().includes(q);
              const matchDesc = course.shortDescription?.toLowerCase().includes(q);
              const matchLevel = course.level?.toLowerCase().includes(q);
              const matchBadge = course.badge?.toLowerCase().includes(q);
              const matchFormat = course.learningFormat?.toLowerCase().includes(q);
              const matchSyllabus = course.whatYouWillLearn?.some(item => item.toLowerCase().includes(q));
              if (!matchName && !matchDesc && !matchLevel && !matchBadge && !matchFormat && !matchSyllabus) return false;
            }
            return true;
          });

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
              {/* Header & Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                      Courses Catalog & Publication CMS
                    </h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#4A1D96]">
                      Editable Anytime
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Edit course titles, pricing, curriculum points, duration, and learning formats anytime — before publication (drafts) or after publication (live website).
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start lg:self-auto">
                  <button
                    onClick={() => {
                      setNewCourse({
                        name: '',
                        level: 'Beginner to Intermediate',
                        shortDescription: '',
                        whatYouWillLearn: [
                          'Master natural conversational speaking',
                          'Overcome public hesitation and stage fear',
                          'Daily vocabulary in context',
                          'Pronunciation and accent clarity'
                        ],
                        duration: '2 Months (40 Sessions)',
                        learningFormat: 'Live Online Classroom (Evening Batches)',
                        fee: 1499,
                        badge: 'Popular Foundation',
                        isPublished: true
                      });
                      setNewBulletPointForAdd('');
                      setShowAddCourseModal(true);
                    }}
                    id="admin-add-course-btn"
                    className="px-4 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Course</span>
                  </button>
                </div>
              </div>

              {/* Course Status Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCourseVisibilityFilter('all')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    courseVisibilityFilter === 'all'
                      ? 'border-purple-300 bg-purple-50/70 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">All Courses</span>
                  <span className="font-['Outfit'] text-xl font-extrabold text-[#4A1D96]">{totalCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseVisibilityFilter('published')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    courseVisibilityFilter === 'published'
                      ? 'border-emerald-300 bg-emerald-50/70 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    Live on Website
                  </span>
                  <span className="font-['Outfit'] text-xl font-extrabold text-emerald-700">{publishedCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseVisibilityFilter('draft')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    courseVisibilityFilter === 'draft'
                      ? 'border-amber-300 bg-amber-50/70 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-700 block flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Drafts / Unpublished
                  </span>
                  <span className="font-['Outfit'] text-xl font-extrabold text-amber-700">{draftCount}</span>
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF9FC] p-3 rounded-2xl border border-purple-100">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by course title, syllabus topic, level, or format..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#4A1D96]"
                  />
                  {courseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCourseSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Level:</span>
                  {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCourseLevelFilter(lvl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        courseLevelFilter === lvl
                          ? 'bg-[#4A1D96] text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {lvl === 'all' ? 'All Levels' : lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => {
                    const isLive = course.isPublished !== false;
                    return (
                      <div
                        key={course.id}
                        className={`rounded-2xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                          isLive
                            ? 'border-purple-200 bg-white hover:border-purple-300 hover:shadow-md'
                            : 'border-amber-200/90 bg-amber-50/20 hover:border-amber-300'
                        }`}
                      >
                        {/* Status Ribbon & Quick Publish Toggle */}
                        <div
                          className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
                            isLive
                              ? 'bg-emerald-50/80 border-emerald-100 text-emerald-900'
                              : 'bg-amber-50 border-amber-200 text-amber-900'
                          }`}
                        >
                          <span className="font-bold flex items-center gap-1.5 text-[11px]">
                            {isLive ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>LIVE ON WEBSITE</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>DRAFT (UNPUBLISHED)</span>
                              </>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleTogglePublishCourse(course.id)}
                            title={isLive ? 'Unpublish from public website' : 'Publish to live website'}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                              isLive
                                ? 'bg-white hover:bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                          >
                            {isLive ? 'Unpublish' : 'Publish Now'}
                          </button>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            {/* Badges */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#4A1D96] border border-purple-200">
                                {course.level}
                              </span>
                              {course.badge && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>{course.badge}</span>
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                              {course.name}
                            </h3>

                            {/* Short Description */}
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {course.shortDescription}
                            </p>

                            {/* Metadata Pills: Duration & Format */}
                            <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <div className="truncate">
                                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Duration</span>
                                  <span className="font-bold text-slate-800 truncate block text-[11px]">{course.duration}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <div className="truncate">
                                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Format</span>
                                  <span className="font-bold text-slate-800 truncate block text-[11px]">{course.learningFormat}</span>
                                </div>
                              </div>
                            </div>

                            {/* What Students Learn (Full Bullet Checklist) */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  What You Will Learn ({course.whatYouWillLearn?.length || 0})
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {course.whatYouWillLearn?.map((item, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 leading-tight">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-bold uppercase">Course Fee</span>
                              <span className="font-['Outfit'] font-black text-xl text-[#3B0764]">
                                ₹{course.fee?.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-500 ml-1">/ batch</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCourse({
                                    ...course,
                                    whatYouWillLearn: Array.isArray(course.whatYouWillLearn)
                                      ? [...course.whatYouWillLearn]
                                      : []
                                  });
                                  setNewBulletPointForEdit('');
                                }}
                                className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-bold text-[#4A1D96] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Course</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course.id, course.name)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete Course"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <p className="text-sm font-bold text-slate-600">No courses match your filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCourseVisibilityFilter('all');
                        setCourseSearchQuery('');
                        setCourseLevelFilter('all');
                      }}
                      className="text-xs font-bold text-purple-700 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ==================================================================== */}
        {/* TAB 3: BATCHES MANAGEMENT */}
        {/* ==================================================================== */}
        {activeTab === 'batches' && (() => {
          const isSectionVisible = localSettings.showBatchesSection ?? true;
          const visibleBatchesCount = batches.filter(b => b.isVisibleOnWebsite !== false).length;
          const hiddenBatchesCount = batches.filter(b => b.isVisibleOnWebsite === false).length;

          const filteredBatches = batches.filter((batch) => {
            if (batchVisibilityFilter === 'visible' && batch.isVisibleOnWebsite === false) return false;
            if (batchVisibilityFilter === 'hidden' && batch.isVisibleOnWebsite !== false) return false;

            if (batchSearchQuery.trim()) {
              const q = batchSearchQuery.toLowerCase();
              const matchName = batch.name?.toLowerCase().includes(q);
              const matchCode = batch.batchCode?.toLowerCase().includes(q);
              const matchCourse = batch.courseName?.toLowerCase().includes(q);
              const matchMentor = batch.teacherName?.toLowerCase().includes(q);
              if (!matchName && !matchCode && !matchCourse && !matchMentor) return false;
            }
            return true;
          });

          return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
              {/* Header & Master Section Switch */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                      Batches & Seat Capacity Control
                    </h2>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                      isSectionVisible 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {isSectionVisible ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Section Live on Website</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-amber-700" />
                          <span>Section Hidden from Website</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage batch names, schedules, timing, student capacity, and public website visibility.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  {/* Master Section Visibility Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleShowBatchesSection}
                    id="admin-toggle-batches-section-btn"
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-2xs ${
                      isSectionVisible
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    }`}
                    title={isSectionVisible ? 'Click to hide the Batches & Capacity section from the public website' : 'Click to show the Batches & Capacity section on the public website'}
                  >
                    {isSectionVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hide Section from Website</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>Show Section on Website</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowAddBatchModal(true)}
                    id="admin-add-batch-btn"
                    className="px-4 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Batch</span>
                  </button>
                </div>
              </div>

              {/* Master Status Notice (when whole section is hidden) */}
              {!isSectionVisible && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                      <EyeOff className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-950">
                        The entire "Batches & Capacity" section is currently hidden from the public website.
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Visitors cannot see this section or any batches until you click "Show Section on Website".
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleShowBatchesSection}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Turn On Section
                  </button>
                </div>
              )}

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-purple-50/40 p-3 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setBatchVisibilityFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      batchVisibilityFilter === 'all'
                        ? 'bg-[#4A1D96] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-purple-100/60 border border-purple-100'
                    }`}
                  >
                    All Batches ({batches.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchVisibilityFilter('visible')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      batchVisibilityFilter === 'visible'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Live on Web ({visibleBatchesCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchVisibilityFilter('hidden')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      batchVisibilityFilter === 'hidden'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Hidden from Web ({hiddenBatchesCount})</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by batch, code, mentor..."
                    value={batchSearchQuery}
                    onChange={(e) => setBatchSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-400 placeholder:text-slate-400"
                  />
                  {batchSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBatchSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Batches Grid */}
              {filteredBatches.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <EyeOff className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No batches match your filter or search.</p>
                  <button
                    type="button"
                    onClick={() => { setBatchVisibilityFilter('all'); setBatchSearchQuery(''); }}
                    className="mt-3 text-xs text-[#4A1D96] font-bold hover:underline cursor-pointer"
                  >
                    Reset filters and show all
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBatches.map((batch) => {
                    const enrolled = batch.enrolledCount ?? batch.currentStudentsCount ?? 0;
                    const capacity = batch.maxCapacity ?? batch.maxStudents ?? 35;
                    const pct = Math.min(100, Math.round((enrolled / capacity) * 100));
                    const isVisible = batch.isVisibleOnWebsite !== false;

                    return (
                      <div
                        key={batch.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isVisible
                            ? 'border-purple-100 bg-[#FAF9FC] hover:border-purple-300 hover:shadow-xs'
                            : 'border-dashed border-amber-300/80 bg-amber-50/25'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Badges Row */}
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-[#4A1D96] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                {batch.batchCode}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                batch.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                batch.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {batch.status}
                              </span>
                            </div>

                            {/* Live/Hidden indicator */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                              isVisible
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}>
                              {isVisible ? (
                                <>
                                  <Eye className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>Live on Web</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Hidden</span>
                                </>
                              )}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-['Outfit'] font-bold text-base text-slate-900 mt-1">
                              {batch.name}
                            </h3>
                            <p className="text-[11px] text-purple-700 font-medium">
                              {batch.courseName || 'Spoken English'}
                            </p>
                          </div>

                          <div className="space-y-1 text-xs text-slate-600">
                            <p>
                              <strong>Timing:</strong> {batch.scheduleTime}
                            </p>
                            <p>
                              <strong>Mentor:</strong> {batch.teacherName || 'Ziyaur Rehman Zia'}
                            </p>
                          </div>

                          {/* Capacity Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                              <span>Capacity Enrollment</span>
                              <span>{enrolled} / {capacity} Students ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-amber-500' : 'bg-[#4A1D96]'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="pt-3 mt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                          {/* Toggle batch visibility */}
                          <button
                            type="button"
                            onClick={() => handleToggleBatchVisibility(batch.id)}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isVisible
                                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800 shadow-2xs'
                            }`}
                            title={isVisible ? 'Hide this batch card from the public website' : 'Make this batch card visible on the public website'}
                          >
                            {isVisible ? (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-500" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Unhide</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingBatch({ ...batch })}
                              className="px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-xs font-bold text-[#4A1D96] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch.id, batch.name)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================================================================== */}
        {/* TAB 4: LIVE CLASSES SCHEDULER */}
        {/* ==================================================================== */}
        {activeTab === 'classes' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                  Live Class Sessions & Meeting Links
                </h2>
                <p className="text-xs text-slate-500">
                  Schedule live sessions, update Google Meet / Zoom links, and trigger live or completed status.
                </p>
              </div>

              <button
                onClick={() => setShowAddClassModal(true)}
                id="admin-add-class-btn"
                className="px-4 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule New Class</span>
              </button>
            </div>

            <div className="space-y-4">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-[#FAF9FC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-purple-200 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{cls.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cls.status === 'Live' ? 'bg-red-100 text-red-700 animate-pulse' :
                          cls.status === 'Completed' ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {cls.status === 'Live' ? '🔴 LIVE NOW' : cls.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>Date:</strong> {cls.date} • <strong>Time:</strong> {cls.time}
                      </p>
                      {cls.joinUrl && (
                        <p className="text-xs text-purple-700 font-mono truncate max-w-md">
                          <strong>Meet Link:</strong> {cls.joinUrl}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                      {cls.status !== 'Live' && (
                        <button
                          onClick={() => handleToggleClassStatus(cls.id, 'Live')}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                        >
                          Start Live
                        </button>
                      )}
                      {cls.status === 'Live' && (
                        <button
                          onClick={() => handleToggleClassStatus(cls.id, 'Completed')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClass(cls.id, cls.title)}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  No classes scheduled yet. Click "Schedule New Class" above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: CLASS RECORDINGS */}
        {/* ==================================================================== */}
        {activeTab === 'recordings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                  Batch Recorded Lectures & Vault
                </h2>
                <p className="text-xs text-slate-500">
                  Upload, manage, and delete lecture recordings accessible to authorized batch students.
                </p>
              </div>

              <button
                onClick={() => setShowAddRecordingModal(true)}
                id="admin-add-rec-btn"
                className="px-4 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Recording</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recordings.length > 0 ? (
                recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-[#FAF9FC] space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#4A1D96]">
                        <span>{rec.topic || 'Class Lecture'}</span>
                        <span className="text-slate-400">{rec.duration || '60 min'}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{rec.title}</h4>
                      <p className="text-[11px] text-slate-500">Recorded: {rec.recordedDate || 'Recent'}</p>
                      {rec.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{rec.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => handleDeleteRecording(rec.id, rec.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Recording"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-slate-400">
                  No recordings added yet. Click "Add New Recording" to attach lectures.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: STUDY MATERIALS & PDFS */}
        {/* ==================================================================== */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                    Study Materials, PDFs & Practice Notes
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>View-Only Protected</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload PDF links (Google Drive, OneDrive, or Direct PDF) with anti-download security. Students can read smoothly but cannot download.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {/* Batch Filter */}
                <select
                  value={materialFilterBatch}
                  onChange={(e) => setMaterialFilterBatch(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-hidden focus:border-[#4A1D96]"
                >
                  <option value="all">All Batches ({materials.length})</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({materials.filter(m => m.batchId === b.id).length})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddMaterialModal(true)}
                  id="admin-add-mat-btn"
                  className="px-4 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Study Resource</span>
                </button>
              </div>
            </div>

            {/* View-Only Security Feature Banner */}
            <div className="p-4 rounded-2xl bg-linear-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#4A1D96] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Protected PDF Viewing Engine Active</h4>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    All PDF materials uploaded here are served in a secure <strong>View-Only</strong> container. Right-click, Ctrl+S saving, Ctrl+P printing, and student file downloads are intercepted to protect your academy's proprietary intellectual property.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 text-[11px] font-bold text-purple-900 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Drive Auto-Optimizer</span>
              </div>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {materials.filter(m => materialFilterBatch === 'all' || m.batchId === materialFilterBatch).length > 0 ? (
                materials
                  .filter(m => materialFilterBatch === 'all' || m.batchId === materialFilterBatch)
                  .map((mat) => {
                    const batchObj = batches.find(b => b.id === mat.batchId);
                    const opt = optimizePdfUrl(mat.pdfUrl || '');

                    return (
                      <div
                        key={mat.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-[#FAF9FC] hover:border-purple-200 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-purple-700">
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                              {mat.fileType ? mat.fileType.toUpperCase() : 'PDF'} • {mat.fileSize || '1.8 MB'}
                            </span>
                            <span className="text-slate-400">{mat.uploadedDate || 'Uploaded'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block truncate">
                              📚 {batchObj ? batchObj.name : 'Academy Wide'}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 mt-0.5 line-clamp-1">{mat.title}</h4>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-1">{mat.description}</p>
                          </div>

                          {/* Security & Link Status Badges */}
                          <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>View-Only (No Download)</span>
                            </span>

                            {mat.pdfUrl ? (
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium flex items-center gap-1 truncate max-w-[180px]">
                                <LinkIcon className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{opt.provider === 'Google Drive' ? 'Google Drive Embed' : (opt.provider === 'Direct PDF' ? 'Direct PDF' : opt.provider)}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
                                <BookOpen className="w-2.5 h-2.5" />
                                <span>Digital Curriculum Guide</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setPreviewingPdfMaterial({
                              title: mat.title,
                              pdfUrl: mat.pdfUrl || mat.downloadUrl,
                              description: mat.description,
                              category: 'Batch Study Material',
                              batchName: batchObj?.name || 'Spoken English Batch'
                            })}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-[#4A1D96] text-[#4A1D96] hover:text-white border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Test View-Only Reader as a student"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Test Reader</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingMaterial(mat)}
                              className="p-1.5 text-slate-500 hover:text-[#4A1D96] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Material & PDF Link"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-3 py-12 text-center text-slate-400">
                  No materials found for this batch. Click "Upload Study Resource" to add files.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7: STUDENT TESTIMONIALS & REVIEWS CMS */}
        {/* ==================================================================== */}
        {activeTab === 'testimonials' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                  Homepage Student Testimonials CMS
                </h2>
                <p className="text-xs text-slate-500">
                  Control all student reviews displayed in the "Student Success & Reviews" section of the website.
                </p>
              </div>

              <button
                onClick={() => setShowAddTestimonialModal(true)}
                id="admin-add-testimonial-btn"
                className="px-4 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student Review</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((test) => (
                <div
                  key={test.id}
                  className="p-5 rounded-2xl border border-purple-100 bg-[#FAF9FC] space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{test.studentName}</h4>
                        <p className="text-[11px] text-purple-700 font-semibold">{test.courseBatch}</p>
                      </div>
                      {test.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{test.testimonial}"
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">Location: {test.city || 'India'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingTestimonial({ ...test })}
                      className="px-3 py-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-xs font-bold text-[#4A1D96] transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(test.id, test.studentName)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 7b: ACADEMY NOTICES, HOLIDAYS & BATCH CIRCULARS */}
        {/* ==================================================================== */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                    Academy Notices, Holidays & Batch Circulars
                  </h2>
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {localAnnouncements.length} Total
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage official academy holiday notices, batch class circulars, and schedule adjustments. Any changes appear instantly on the live website notice board and in the official popup circular.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="admin-add-announcement-btn"
                  onClick={() => setShowAddAnnouncementModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Notice / Holiday</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'all', label: 'All Notices' },
                { id: 'Holiday', label: '🏖️ Holidays' },
                { id: 'Class Notice', label: '📢 Class Notices' },
                { id: 'Schedule Change', label: '🕒 Schedule Changes' },
                { id: 'Urgent Alert', label: '🚨 Urgent Alerts' },
                { id: 'General', label: '📌 General Updates' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setAnnouncementFilter(filter.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    announcementFilter === filter.id
                      ? 'bg-[#4A1D96] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Announcements List */}
            <div className="space-y-3.5">
              {localAnnouncements
                .filter(a => announcementFilter === 'all' || a.category === announcementFilter)
                .map((ann) => {
                  const isHoliday = ann.category === 'Holiday';
                  const isClassNotice = ann.category === 'Class Notice';
                  const isSchedule = ann.category === 'Schedule Change';
                  const isUrgent = ann.priority === 'Urgent';

                  return (
                    <div
                      key={ann.id}
                      className="p-5 rounded-2xl border border-slate-200/90 hover:border-purple-200 bg-white hover:bg-purple-50/20 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                            isHoliday
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : isClassNotice
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                              : isSchedule
                              ? 'bg-blue-100 text-blue-900 border-blue-200'
                              : 'bg-purple-100 text-purple-900 border-purple-200'
                          }`}>
                            {isHoliday ? '🏖️ Holiday Notice' : isClassNotice ? '📢 Class Notice' : isSchedule ? '🕒 Schedule Update' : '📌 Notice'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : ann.priority === 'Important'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ann.priority} Priority
                          </span>

                          <button
                            type="button"
                            onClick={() => handleTogglePinAnnouncement(ann.id)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                              ann.isPinned
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                            title="Toggle pin to top of homepage board"
                          >
                            <Pin className={`w-3 h-3 ${ann.isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
                            <span>{ann.isPinned ? 'Pinned' : 'Pin'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Published: {ann.date}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                          {ann.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-line line-clamp-3 leading-relaxed">
                          {ann.message}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-3 flex-wrap text-slate-500">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            Target: {ann.batchName}
                          </span>
                          {ann.effectiveDate && (
                            <span className="text-purple-700 font-medium">
                              Effective: {ann.effectiveDate}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewingAnnouncement(ann)}
                            className="px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#4A1D96] font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview Popup</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingAnnouncement(ann)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Notice"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {localAnnouncements.filter(a => announcementFilter === 'all' || a.category === announcementFilter).length === 0 && (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Megaphone className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No notices found</p>
                  <p className="text-xs text-slate-500 mt-1">Publish a new holiday notice or class circular using the button above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: WEBSITE SETTINGS & ACADEMY CMS */}
        {/* ==================================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="font-['Outfit'] font-bold text-xl text-slate-900">
                Website Content & Institutional Settings CMS
              </h2>
              <p className="text-xs text-slate-500">
                Change your academy contact details, announcement bar, founder highlights, and social links in real time.
              </p>
            </div>

            <form onSubmit={handleSaveSiteSettings} className="space-y-6">
              {/* Announcement Bar & Live Preview */}
              <div className="p-6 rounded-3xl bg-purple-50/70 border-2 border-purple-200/80 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/70 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#4A1D96] text-white flex items-center justify-center shadow-xs">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Top Website Announcement Banner (CMS)</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-200 text-[#3B0764]">
                          Live Header
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Controls the purple announcement bar at the very top of your website and the hero notice badge.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-white px-3.5 py-1.5 rounded-xl border border-purple-200 shadow-xs self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={localSettings.showAnnouncement}
                      onChange={(e) => setLocalSettings({ ...localSettings, showAnnouncement: e.target.checked })}
                      className="w-4 h-4 rounded text-[#4A1D96] accent-[#4A1D96] cursor-pointer"
                    />
                    <span>{localSettings.showAnnouncement ? '🟢 Banner Active' : '⚪ Banner Hidden'}</span>
                  </label>
                </div>

                {/* Live Header Simulation Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600 flex items-center gap-1.5">
                      <span>Live Website Header Preview</span>
                      <span className="text-[10px] text-purple-700 font-semibold">(Updates in real-time as you type)</span>
                    </span>
                    {!localSettings.showAnnouncement && (
                      <span className="text-amber-700 font-bold text-[10px] bg-amber-100 px-2 py-0.5 rounded">
                        Currently hidden on website
                      </span>
                    )}
                  </div>

                  <div className={`relative overflow-hidden rounded-2xl border ${localSettings.showAnnouncement ? 'border-purple-900 shadow-md' : 'border-slate-300 opacity-60'}`}>
                    <div className="bg-gradient-to-r from-[#2E1065] via-[#4A1D96] to-[#3B0764] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                      <span className="font-medium truncate max-w-xl">
                        {localSettings.announcementText || 'New Batch Starts from 1st of each month • Admissions Open for October & November 2026'}
                      </span>
                      {localSettings.announcementBtnText ? (
                        <span className="underline ml-2 font-semibold text-purple-200 flex-shrink-0">
                          {localSettings.announcementBtnText}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Fields for Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1 text-xs">
                      Banner Announcement Message *
                    </label>
                    <input
                      type="text"
                      required
                      value={localSettings.announcementText}
                      onChange={(e) => setLocalSettings({ ...localSettings, announcementText: e.target.value })}
                      placeholder="e.g. New Batch Starts from 1st of each month • Admissions Open for October & November 2026"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:border-[#4A1D96] shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">
                      Action Button Text
                    </label>
                    <input
                      type="text"
                      value={localSettings.announcementBtnText || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, announcementBtnText: e.target.value })}
                      placeholder="Optional (leave empty for no button)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-300 bg-white text-xs text-slate-900 font-medium focus:outline-hidden focus:border-[#4A1D96] shadow-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Opens the admission registration popup</span>
                  </div>
                </div>

                {/* Quick 1-Click Preset Templates */}
                <div className="pt-2 border-t border-purple-200/60">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    💡 Quick Presets (Click to apply template):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        announcementText: 'New Batch Starts from 1st of each month • Admissions Open for October & November 2026',
                        announcementBtnText: '',
                        showAnnouncement: true
                      })}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      📅 1st of Each Month (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        announcementText: '⚡ Admissions Open for Next Month Batch — Only 5 Seats Left for Personal Speaking Attention!',
                        announcementBtnText: 'Claim Your Seat →',
                        showAnnouncement: true
                      })}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      🚨 Limited Seats Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        announcementText: '🏖️ Academy Holiday Notice: Classes Closed for Holiday Observance • Online Drills Active 24/7',
                        announcementBtnText: 'View Details →',
                        showAnnouncement: true
                      })}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      🏖️ Holiday Notice
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocalSettings({
                        ...localSettings,
                        announcementText: '🎉 Free Live Spoken English Trial Class This Weekend • Limited Free Registrations Open!',
                        announcementBtnText: 'Book Free Demo →',
                        showAnnouncement: true
                      })}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      🎉 Free Demo Weekend
                    </button>
                  </div>
                </div>
              </div>

              {/* Batches & Seat Capacity Section Visibility Control */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-amber-50/40 border border-purple-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#4A1D96] text-white flex items-center justify-center shadow-xs">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Batches & Seat Capacity Public Section</span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          (localSettings.showBatchesSection ?? true)
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {(localSettings.showBatchesSection ?? true) ? 'Live Section' : 'Section Hidden'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Controls whether the "Upcoming Batches & Seat Capacity" section is rendered on the public website homepage and navbar.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-white px-3.5 py-1.5 rounded-xl border border-purple-200 shadow-2xs self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={localSettings.showBatchesSection ?? true}
                      onChange={(e) => setLocalSettings({ ...localSettings, showBatchesSection: e.target.checked })}
                      className="w-4 h-4 rounded text-[#4A1D96] accent-[#4A1D96] cursor-pointer"
                    />
                    <span>{(localSettings.showBatchesSection ?? true) ? '🟢 Section Visible' : '⚪ Section Hidden'}</span>
                  </label>
                </div>
              </div>

              {/* Academy Identity & Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academy Brand Name</label>
                  <input
                    type="text"
                    value={localSettings.academyName}
                    onChange={(e) => setLocalSettings({ ...localSettings, academyName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Tagline</label>
                  <input
                    type="text"
                    value={localSettings.tagline}
                    onChange={(e) => setLocalSettings({ ...localSettings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={localSettings.phone1}
                    onChange={(e) => setLocalSettings({ ...localSettings, phone1: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    value={localSettings.phone2}
                    onChange={(e) => setLocalSettings({ ...localSettings, phone2: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    value={localSettings.email}
                    onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Physical Academy Location / Address</label>
                  <input
                    type="text"
                    value={localSettings.address}
                    onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Social URLs */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Official Channels & Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">WhatsApp Channel URL</label>
                    <input
                      type="url"
                      value={localSettings.whatsappChannelUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappChannelUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={localSettings.instagramUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, instagramUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">YouTube Channel URL</label>
                    <input
                      type="url"
                      value={localSettings.youtubeUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, youtubeUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Facebook URL</label>
                    <input
                      type="url"
                      value={localSettings.facebookUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, facebookUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Bank Account & Payment Options Configuration */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/70 via-white to-emerald-50/30 border-2 border-purple-200/80 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/70 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#4A1D96] text-white flex items-center justify-center shadow-xs">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Direct Bank Account & Payment Options Setup</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Incoming Payments
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Configure your official bank account details, UPI ID, and SWIFT code to receive student fee transfers directly into your bank account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bank Name *</label>
                    <input
                      type="text"
                      value={localSettings.bankName || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankName: e.target.value })}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      value={localSettings.bankAccountHolder || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankAccountHolder: e.target.value })}
                      placeholder="e.g. Wits Lingo Academy / Mohammad Ziya"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={localSettings.bankAccountNumber || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 38920194821"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      value={localSettings.bankIfscCode || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankIfscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                    <select
                      value={localSettings.bankAccountType || 'Current Account'}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankAccountType: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Current Account">Current Account (Business)</option>
                      <option value="Savings Account">Savings Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Branch Location</label>
                    <input
                      type="text"
                      value={localSettings.bankBranch || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankBranch: e.target.value })}
                      placeholder="e.g. Amroha Main Branch, Uttar Pradesh, India"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      International SWIFT / BIC Code (For All Countries Remittance)
                    </label>
                    <input
                      type="text"
                      value={localSettings.bankSwiftBic || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, bankSwiftBic: e.target.value.toUpperCase() })}
                      placeholder="e.g. SBININBB123"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono uppercase"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used by foreign banks worldwide for direct international inward wires in all currencies</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary UPI ID (Google Pay / PhonePe / Paytm / QR)</label>
                    <input
                      type="text"
                      value={localSettings.upiId || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, upiId: e.target.value })}
                      placeholder="e.g. 8791287575@ybl"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">PhonePe / Google Pay Registered Mobile Number</label>
                    <input
                      type="text"
                      value={localSettings.upiNumber || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, upiNumber: e.target.value })}
                      placeholder="e.g. +91 8791287575"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Razorpay Payment Gateway Link (For Cards, NetBanking & International)
                    </label>
                    <input
                      type="url"
                      value={localSettings.razorpayPaymentLink || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, razorpayPaymentLink: e.target.value })}
                      placeholder="https://rzp.io/l/witslingo"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Direct students to your official Razorpay payment page for instant card, net banking, or international card checkouts.
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Highlights */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Our Accomplishments & Stats Numbers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Completed Batches Metric</label>
                    <input
                      type="text"
                      value={localSettings.batchesCompletedCount}
                      onChange={(e) => setLocalSettings({ ...localSettings, batchesCompletedCount: e.target.value })}
                      placeholder="15+"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Students Improved Metric</label>
                    <input
                      type="text"
                      value={localSettings.activeStudentsCount}
                      onChange={(e) => setLocalSettings({ ...localSettings, activeStudentsCount: e.target.value })}
                      placeholder="100+"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Security Password */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4A1D96]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Admin Security Passkey / Password
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  This is the simple security key required to open the Admin Dashboard from the website footer.
                </p>
                <div className="max-w-xs pt-1">
                  <input
                    type="text"
                    value={localSettings.adminPasskey || 'admin123'}
                    onChange={(e) => setLocalSettings({ ...localSettings, adminPasskey: e.target.value })}
                    placeholder="admin123"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  id="admin-save-settings-btn"
                  className="px-6 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-purple-900/10"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Website Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADMIT NEW STUDENT */}
        {/* ==================================================================== */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Admit New Student to Batch
                </h3>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="e.g. Mohammad Bilal"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Father's Name *</label>
                    <input
                      type="text"
                      required
                      value={newStudent.fatherName}
                      onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                      placeholder="Father's full name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newStudent.dob}
                      onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CountryCodePhoneInput
                    id="admin-new-student-phone"
                    label="Mobile Phone"
                    required={true}
                    country={adminPhoneCountry}
                    onCountryChange={setAdminPhoneCountry}
                    phoneNumber={newStudent.phone}
                    onPhoneNumberChange={(cleanDigits) =>
                      setNewStudent((prev) => ({ ...prev, phone: cleanDigits }))
                    }
                    placeholder="9876543210"
                  />
                  <CountryCodePhoneInput
                    id="admin-new-student-whatsapp"
                    label="WhatsApp Number"
                    required={true}
                    country={adminWhatsappCountry}
                    onCountryChange={setAdminWhatsappCountry}
                    phoneNumber={newStudent.whatsapp}
                    onPhoneNumberChange={(cleanDigits) =>
                      setNewStudent((prev) => ({ ...prev, whatsapp: cleanDigits }))
                    }
                    placeholder="9876543210"
                    extraHeaderAction={
                      <button
                        type="button"
                        onClick={() => {
                          setAdminWhatsappCountry(adminPhoneCountry);
                          setNewStudent((prev) => ({ ...prev, whatsapp: prev.phone }));
                        }}
                        className="text-[10px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                        title="Copy from Mobile Phone"
                      >
                        Same as Mobile
                      </button>
                    }
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                {/* Location Hierarchy: Country, State, District, Postal Code */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="mb-2">
                    <span className="font-bold text-slate-800 text-xs block">
                      Student Location & Address
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Country, State/Province, District/City, and Postal Code
                    </span>
                  </div>

                  <AddressHierarchySelector
                    country={newStudent.country}
                    onCountryChange={(newCountry) => {
                      setNewStudent((prev) => ({ ...prev, country: newCountry }));
                      const matched = ALL_COUNTRY_PHONE_CODES.find(
                        (c) => c.name.toLowerCase() === newCountry.toLowerCase()
                      );
                      if (matched) {
                        setAdminPhoneCountry(matched);
                        setAdminWhatsappCountry(matched);
                      }
                    }}
                    state={newStudent.state}
                    onStateChange={(newState) =>
                      setNewStudent((prev) => ({ ...prev, state: newState }))
                    }
                    district={newStudent.district}
                    onDistrictChange={(newDistrict) =>
                      setNewStudent((prev) => ({ ...prev, district: newDistrict }))
                    }
                    pincode={newStudent.pincode}
                    onPincodeChange={(newPincode) =>
                      setNewStudent((prev) => ({ ...prev, pincode: newPincode }))
                    }
                    address={newStudent.address}
                    onAddressChange={(newAddress) =>
                      setNewStudent((prev) => ({ ...prev, address: newAddress }))
                    }
                    required={true}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign to Batch *</label>
                  <select
                    value={newStudent.batchId}
                    onChange={(e) => setNewStudent({ ...newStudent, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.batchCode})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Confirm Admission
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: EDIT STUDENT */}
        {/* ==================================================================== */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Edit Student Admission ({editingStudent.admissionId})
                </h3>
                <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Father's Name</label>
                    <input
                      type="text"
                      value={editingStudent.fatherName || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      value={editingStudent.phone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="mb-2">
                    <span className="font-bold text-slate-800 text-xs block">
                      Student Location & Address
                    </span>
                  </div>
                  <AddressHierarchySelector
                    country={editingStudent.country || 'India'}
                    onCountryChange={(c) => setEditingStudent((prev: any) => ({ ...prev, country: c }))}
                    state={editingStudent.state || ''}
                    onStateChange={(s) => setEditingStudent((prev: any) => ({ ...prev, state: s }))}
                    district={editingStudent.district || ''}
                    onDistrictChange={(d) => setEditingStudent((prev: any) => ({ ...prev, district: d }))}
                    pincode={editingStudent.pincode || ''}
                    onPincodeChange={(p) => setEditingStudent((prev: any) => ({ ...prev, pincode: p }))}
                    address={editingStudent.address || ''}
                    onAddressChange={(a) => setEditingStudent((prev: any) => ({ ...prev, address: a }))}
                    required={false}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Batch</label>
                  <select
                    value={editingStudent.batchId || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD NEW COURSE */}
        {/* ==================================================================== */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-['Outfit'] font-bold text-xl text-slate-900">
                    Add New Course to Academy
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define course details, pricing, syllabus points, and choose whether to publish immediately or save as draft.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-4 text-xs">
                {/* Publication Status Selector */}
                <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-purple-100 space-y-2">
                  <label className="font-bold text-slate-800 block text-xs">
                    Publication Status <span className="text-slate-400 font-normal">(Can be edited anytime)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCourse({ ...newCourse, isPublished: true })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        newCourse.isPublished !== false
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                      <div>
                        <span className="font-bold block text-xs">🟢 Publish to Live Website</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Immediately visible & open for admissions</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCourse({ ...newCourse, isPublished: false })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        newCourse.isPublished === false
                          ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                      <div>
                        <span className="font-bold block text-xs">🟡 Save as Draft</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Hidden from website, refine before publishing</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Course Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spoken English & Accent Mastery"
                    value={newCourse.name || ''}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                  />
                </div>

                {/* Level & Fee */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Level</label>
                    <select
                      value={newCourse.level || 'Beginner to Intermediate'}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Course Fee (INR ₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newCourse.fee || 1499}
                        onChange={(e) => setNewCourse({ ...newCourse, fee: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-extrabold text-[#4A1D96] text-xs focus:outline-hidden focus:border-[#4A1D96]"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration & Learning Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration || ''}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="e.g. 2.5 Months (50 Sessions)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Learning Format</label>
                    <input
                      type="text"
                      value={newCourse.learningFormat || ''}
                      onChange={(e) => setNewCourse({ ...newCourse, learningFormat: e.target.value })}
                      placeholder="e.g. Live Batches + Daily Speaking Drills"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    />
                  </div>
                </div>

                {/* Badge / Ribbon */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Badge / Ribbon <span className="text-slate-400 font-normal">(Optional label shown on course card)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCourse.badge || ''}
                      onChange={(e) => setNewCourse({ ...newCourse, badge: e.target.value })}
                      placeholder="e.g. Popular Foundation, Most Popular, Career Boost"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    />
                    <div className="flex items-center gap-1">
                      {['Popular Foundation', 'Most Popular', 'Career Boost'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewCourse({ ...newCourse, badge: preset })}
                          className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-[#4A1D96] rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={newCourse.shortDescription || ''}
                    onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                    placeholder="Brief engaging overview of the course for website visitors"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed focus:outline-hidden focus:border-[#4A1D96]"
                  />
                </div>

                {/* What You Will Learn (Interactive Bullet Points Manager) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block text-xs">
                      What Students Learn (Curriculum Bullet Points) — {newCourse.whatYouWillLearn?.length || 0} Points
                    </label>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {newCourse.whatYouWillLearn && newCourse.whatYouWillLearn.length > 0 ? (
                      newCourse.whatYouWillLearn.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-[#4A1D96] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updatedPoints = [...(newCourse.whatYouWillLearn || [])];
                              updatedPoints[idx] = e.target.value;
                              setNewCourse({ ...newCourse, whatYouWillLearn: updatedPoints });
                            }}
                            className="flex-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedPoints = (newCourse.whatYouWillLearn || []).filter((_, i) => i !== idx);
                              setNewCourse({ ...newCourse, whatYouWillLearn: updatedPoints });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic py-2">No learning outcomes added yet.</p>
                    )}
                  </div>

                  {/* Add Point Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a new learning outcome point (e.g. Master interview self-pitch)..."
                      value={newBulletPointForAdd}
                      onChange={(e) => setNewBulletPointForAdd(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newBulletPointForAdd.trim()) {
                            setNewCourse({
                              ...newCourse,
                              whatYouWillLearn: [...(newCourse.whatYouWillLearn || []), newBulletPointForAdd.trim()]
                            });
                            setNewBulletPointForAdd('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBulletPointForAdd.trim()) {
                          setNewCourse({
                            ...newCourse,
                            whatYouWillLearn: [...(newCourse.whatYouWillLearn || []), newBulletPointForAdd.trim()]
                          });
                          setNewBulletPointForAdd('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#4A1D96] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddCourseModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{newCourse.isPublished !== false ? 'Publish Course Live' : 'Save as Draft Course'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: EDIT COURSE (Editable at any time, past or post publication) */}
        {/* ==================================================================== */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Outfit'] font-bold text-xl text-slate-900">
                      Edit Course: {editingCourse.name}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        editingCourse.isPublished !== false
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {editingCourse.isPublished !== false ? 'Live Published' : 'Draft / Unpublished'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Admin Control: Modify all course specifications, syllabus bullets, fees, and publication status anytime (past or post publication).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditCourse} className="space-y-4 text-xs">
                {/* Publication Status Toggle Card */}
                <div className="p-4 rounded-2xl bg-[#FAF9FC] border border-purple-100 space-y-2">
                  <label className="font-bold text-slate-800 block text-xs">
                    Publication Status (Switch anytime past or post publication)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingCourse({ ...editingCourse, isPublished: true })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        editingCourse.isPublished !== false
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                      <div>
                        <span className="font-bold block text-xs">🟢 Live Published on Website</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Displayed in course catalog and open for admissions</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingCourse({ ...editingCourse, isPublished: false })}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        editingCourse.isPublished === false
                          ? 'border-amber-300 bg-amber-50 text-amber-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                      <div>
                        <span className="font-bold block text-xs">🟡 Draft / Unpublished</span>
                        <span className="text-[10px] text-slate-500 block leading-tight">Hidden from website visitors, safe to edit privately</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Course Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                  />
                </div>

                {/* Fee & Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Live Website Fee (INR ₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editingCourse.fee}
                        onChange={(e) => setEditingCourse({ ...editingCourse, fee: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-extrabold text-[#4A1D96] text-xs focus:outline-hidden focus:border-[#4A1D96]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Level</label>
                    <select
                      value={editingCourse.level}
                      onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                </div>

                {/* Duration & Learning Format */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingCourse.duration}
                      onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                      placeholder="e.g. 2 Months (40 Sessions)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Learning Format</label>
                    <input
                      type="text"
                      value={editingCourse.learningFormat || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, learningFormat: e.target.value })}
                      placeholder="e.g. Live Online Classroom (Evening Batches)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    />
                  </div>
                </div>

                {/* Badge */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Badge / Ribbon <span className="text-slate-400 font-normal">(Shown on course card, or leave blank)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCourse.badge || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, badge: e.target.value })}
                      placeholder="e.g. Popular Foundation, Most Popular, Career Boost"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-[#4A1D96]"
                    />
                    <div className="flex items-center gap-1">
                      {['Popular Foundation', 'Most Popular', 'Career Boost'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setEditingCourse({ ...editingCourse, badge: preset })}
                          className="px-2 py-1 bg-slate-100 hover:bg-purple-100 hover:text-[#4A1D96] rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                      {editingCourse.badge && (
                        <button
                          type="button"
                          onClick={() => setEditingCourse({ ...editingCourse, badge: '' })}
                          className="px-2 py-1 text-slate-400 hover:text-red-600 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={editingCourse.shortDescription}
                    onChange={(e) => setEditingCourse({ ...editingCourse, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed focus:outline-hidden focus:border-[#4A1D96]"
                  />
                </div>

                {/* What You Will Learn (Interactive Bullet Points Manager) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 block text-xs">
                      What Students Learn (Curriculum Bullet Points) — {editingCourse.whatYouWillLearn?.length || 0} Points
                    </label>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {editingCourse.whatYouWillLearn && editingCourse.whatYouWillLearn.length > 0 ? (
                      editingCourse.whatYouWillLearn.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-[#4A1D96] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => {
                              const updatedPoints = [...(editingCourse.whatYouWillLearn || [])];
                              updatedPoints[idx] = e.target.value;
                              setEditingCourse({ ...editingCourse, whatYouWillLearn: updatedPoints });
                            }}
                            className="flex-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updatedPoints = (editingCourse.whatYouWillLearn || []).filter((_, i) => i !== idx);
                              setEditingCourse({ ...editingCourse, whatYouWillLearn: updatedPoints });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic py-2">No learning outcomes added yet.</p>
                    )}
                  </div>

                  {/* Add Point Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add a new learning outcome point (e.g. Situational roleplay & debates)..."
                      value={newBulletPointForEdit}
                      onChange={(e) => setNewBulletPointForEdit(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newBulletPointForEdit.trim()) {
                            setEditingCourse({
                              ...editingCourse,
                              whatYouWillLearn: [...(editingCourse.whatYouWillLearn || []), newBulletPointForEdit.trim()]
                            });
                            setNewBulletPointForEdit('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBulletPointForEdit.trim()) {
                          setEditingCourse({
                            ...editingCourse,
                            whatYouWillLearn: [...(editingCourse.whatYouWillLearn || []), newBulletPointForEdit.trim()]
                          });
                          setNewBulletPointForEdit('');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#4A1D96] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingCourse({
                      ...editingCourse,
                      isPublished: !(editingCourse.isPublished !== false)
                    })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      editingCourse.isPublished !== false
                        ? 'border-amber-300 text-amber-800 hover:bg-amber-50'
                        : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    {editingCourse.isPublished !== false ? 'Switch to Draft (Unpublish)' : 'Switch to Published (Live)'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCourse(null)}
                      className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Course Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD BATCH */}
        {/* ==================================================================== */}
        {showAddBatchModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Create New Batch
                </h3>
                <button onClick={() => setShowAddBatchModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddBatch} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spoken English — Batch November 2026"
                    value={newBatch.name || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Batch Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BATCH-NOV-2026"
                      value={newBatch.batchCode || ''}
                      onChange={(e) => setNewBatch({ ...newBatch, batchCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 uppercase font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Student Intake</label>
                    <input
                      type="number"
                      value={newBatch.maxCapacity || 35}
                      onChange={(e) => setNewBatch({ ...newBatch, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Schedule Timing</label>
                  <input
                    type="text"
                    value={newBatch.scheduleTime || ''}
                    onChange={(e) => setNewBatch({ ...newBatch, scheduleTime: e.target.value })}
                    placeholder="e.g. Mon, Wed, Fri 7:30 PM - 8:30 PM IST"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newBatch.startDate || ''}
                      onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={newBatch.status || 'Upcoming'}
                      onChange={(e) => setNewBatch({ ...newBatch, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Website Visibility Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Show on Public Website</span>
                    <span className="text-[11px] text-slate-500">Allow website visitors to see this batch and its seat capacity</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={newBatch.isVisibleOnWebsite !== false}
                      onChange={(e) => setNewBatch({ ...newBatch, isVisibleOnWebsite: e.target.checked })}
                      className="w-4 h-4 rounded text-[#4A1D96] accent-[#4A1D96] cursor-pointer"
                    />
                    <span className={newBatch.isVisibleOnWebsite !== false ? 'text-emerald-700 font-bold' : 'text-slate-500 font-bold'}>
                      {newBatch.isVisibleOnWebsite !== false ? '🟢 Visible' : '⚪ Hidden'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddBatchModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Publish Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: EDIT BATCH */}
        {/* ==================================================================== */}
        {editingBatch && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Edit Batch ({editingBatch.name})
                </h3>
                <button onClick={() => setEditingBatch(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditBatch} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Name</label>
                  <input
                    type="text"
                    required
                    value={editingBatch.name}
                    onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={editingBatch.scheduleTime}
                    onChange={(e) => setEditingBatch({ ...editingBatch, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Capacity</label>
                    <input
                      type="number"
                      value={editingBatch.maxCapacity || 35}
                      onChange={(e) => setEditingBatch({ ...editingBatch, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={editingBatch.status}
                      onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Website Visibility Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Show on Public Website</span>
                    <span className="text-[11px] text-slate-500">Allow website visitors to see this batch and its seat capacity</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                    <input
                      type="checkbox"
                      checked={editingBatch.isVisibleOnWebsite !== false}
                      onChange={(e) => setEditingBatch({ ...editingBatch, isVisibleOnWebsite: e.target.checked })}
                      className="w-4 h-4 rounded text-[#4A1D96] accent-[#4A1D96] cursor-pointer"
                    />
                    <span className={editingBatch.isVisibleOnWebsite !== false ? 'text-emerald-700 font-bold' : 'text-slate-500 font-bold'}>
                      {editingBatch.isVisibleOnWebsite !== false ? '🟢 Visible' : '⚪ Hidden'}
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingBatch(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Save Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: SCHEDULE LIVE CLASS */}
        {/* ==================================================================== */}
        {showAddClassModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Schedule New Class Session
                </h3>
                <button onClick={() => setShowAddClassModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Batch</label>
                  <select
                    value={newClass.batchId}
                    onChange={(e) => setNewClass({ ...newClass, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Day 04: Real-Life Hesitation Removal Drills"
                    value={newClass.title}
                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newClass.date}
                      onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time</label>
                    <input
                      type="text"
                      required
                      value={newClass.time}
                      onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Live Meeting URL (Zoom / Google Meet)</label>
                  <input
                    type="url"
                    required
                    value={newClass.joinUrl}
                    onChange={(e) => setNewClass({ ...newClass, joinUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddClassModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Publish Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD RECORDING */}
        {/* ==================================================================== */}
        {showAddRecordingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Upload / Attach Lecture Recording
                </h3>
                <button onClick={() => setShowAddRecordingModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRecording} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Batch</label>
                  <select
                    value={newRecording.batchId}
                    onChange={(e) => setNewRecording({ ...newRecording, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recording Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Class 03 — Practical Dialogue Drills"
                    value={newRecording.title}
                    onChange={(e) => setNewRecording({ ...newRecording, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Topic</label>
                    <input
                      type="text"
                      value={newRecording.topic}
                      onChange={(e) => setNewRecording({ ...newRecording, topic: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Duration</label>
                    <input
                      type="text"
                      value={newRecording.duration}
                      onChange={(e) => setNewRecording({ ...newRecording, duration: e.target.value })}
                      placeholder="60 min"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Video Stream / Storage Key</label>
                  <input
                    type="text"
                    value={newRecording.videoUrl}
                    onChange={(e) => setNewRecording({ ...newRecording, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddRecordingModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Save Recording
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD STUDY MATERIAL */}
        {/* ==================================================================== */}
        {showAddMaterialModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4A1D96] flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                      Upload Study Resource
                    </h3>
                    <p className="text-[11px] text-slate-500">Upload PDF from your Gallery / Files or provide a cloud link</p>
                  </div>
                </div>
                <button onClick={() => setShowAddMaterialModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMaterial} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Batch *</label>
                  <select
                    value={newMaterial.batchId}
                    onChange={(e) => setNewMaterial({ ...newMaterial, batchId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] bg-slate-50 text-slate-900 font-medium"
                  >
                    <option value="all">🌟 All Batches & Public Website (Knowledge Bank)</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Knowledge Bank Category *</label>
                    <select
                      value={newMaterial.category}
                      onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                    >
                      <option value="Worksheets">Worksheets</option>
                      <option value="English Vocabulary">English Vocabulary</option>
                      <option value="Daily Sentences">Daily Sentences</option>
                      <option value="Grammar Guides">Grammar Guides</option>
                      <option value="Speaking Practice">Speaking Practice</option>
                      <option value="E-books">E-books</option>
                      <option value="Learning Tips">Learning Tips</option>
                      <option value="Practice Tests">Practice Tests</option>
                      <option value="Study Notes">Study Notes</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Proficiency Level</label>
                    <select
                      value={newMaterial.level}
                      onChange={(e) => setNewMaterial({ ...newMaterial, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50 High-Frequency Daily Conversation Words.pdf"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 font-medium"
                  />
                </div>

                {/* Public Website Visibility */}
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-950 block text-xs">
                      Display on Public Website (Learning Resources Section)
                    </span>
                    <span className="text-[11px] text-purple-700">
                      Visible in the website's PDF Study Guides & Knowledge Bank
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newMaterial.isVisibleOnWebsite}
                    onChange={(e) => setNewMaterial({ ...newMaterial, isVisibleOnWebsite: e.target.checked })}
                    className="w-4 h-4 text-[#4A1D96] rounded cursor-pointer accent-[#4A1D96]"
                  />
                </div>

                {/* PDF Upload / Cloud Link Engine */}
                <PdfUploadInput
                  pdfUrl={newMaterial.pdfUrl}
                  onPdfUrlChange={(url) => setNewMaterial({ ...newMaterial, pdfUrl: url })}
                  token={token}
                  titleValue={newMaterial.title}
                  onTitleSuggest={(suggestedTitle) => {
                    if (!newMaterial.title || newMaterial.title.trim() === '') {
                      setNewMaterial(prev => ({ ...prev, title: suggestedTitle }));
                    }
                  }}
                  onFileUploaded={({ fileSize }) => {
                    setNewMaterial(prev => ({
                      ...prev,
                      fileSize: fileSize || prev.fileSize,
                      fileType: 'pdf'
                    }));
                  }}
                  onPreviewTest={(url) => setPreviewingPdfMaterial({
                    title: newMaterial.title || 'PDF Preview',
                    pdfUrl: url,
                    description: newMaterial.description,
                    category: 'Study Resource Preview'
                  })}
                />

                {/* View-Only Protection Setting */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#4A1D96]" />
                      <span>View-Only Protection (Strict Anti-Download)</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Blocks Ctrl+S save, Ctrl+P print, right-click menu, and download buttons
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newMaterial.isViewOnly}
                    onChange={(e) => setNewMaterial({ ...newMaterial, isViewOnly: e.target.checked })}
                    className="w-4 h-4 text-[#4A1D96] rounded cursor-pointer accent-[#4A1D96]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">File Type</label>
                    <select
                      value={newMaterial.fileType}
                      onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="doc">Word / Notes</option>
                      <option value="audio">Audio Drills</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">File Size</label>
                    <input
                      type="text"
                      value={newMaterial.fileSize}
                      onChange={(e) => setNewMaterial({ ...newMaterial, fileSize: e.target.value })}
                      placeholder="1.5 MB"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Summary</label>
                  <textarea
                    rows={2}
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#4A1D96]"
                    placeholder="Brief summary of the document for students..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddMaterialModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold cursor-pointer shadow-xs"
                  >
                    Upload Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD TESTIMONIAL */}
        {/* ==================================================================== */}
        {showAddTestimonialModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Add Student Testimonial
                </h3>
                <button onClick={() => setShowAddTestimonialModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTestimonial} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohd Tariq"
                    value={newTestimonial.studentName || ''}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, studentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Course / Batch</label>
                    <input
                      type="text"
                      value={newTestimonial.courseBatch || ''}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, courseBatch: e.target.value })}
                      placeholder="e.g. Spoken English • Batch 01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Location / City</label>
                    <input
                      type="text"
                      value={newTestimonial.city || ''}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, city: e.target.value })}
                      placeholder="e.g. Sambhal, UP"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Review Statement *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Write the student's review..."
                    value={newTestimonial.testimonial || ''}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddTestimonialModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: EDIT TESTIMONIAL */}
        {/* ==================================================================== */}
        {editingTestimonial && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                  Edit Student Testimonial
                </h3>
                <button onClick={() => setEditingTestimonial(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditTestimonial} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={editingTestimonial.studentName}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, studentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Course / Batch</label>
                    <input
                      type="text"
                      value={editingTestimonial.courseBatch}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, courseBatch: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Location</label>
                    <input
                      type="text"
                      value={editingTestimonial.city || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Review</label>
                  <textarea
                    rows={4}
                    value={editingTestimonial.testimonial}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADD NEW ANNOUNCEMENT / HOLIDAY / CLASS NOTICE */}
        {/* ==================================================================== */}
        {showAddAnnouncementModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4A1D96] flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                      Publish Academy Notice / Holiday
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Broadcast notices to all students or specific batches
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddAnnouncementModal(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 🏖️ Academy Holiday Notice: Gandhi Jayanti Observance"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Notice Category *</label>
                    <select
                      value={newAnnouncement.category}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                    >
                      <option value="Holiday">🏖️ Holiday Notice (Class closed)</option>
                      <option value="Class Notice">📢 Class Notice (Mock test, speaking pairs)</option>
                      <option value="Schedule Change">🕒 Schedule / Timing Change</option>
                      <option value="Urgent Alert">🚨 Urgent Alert</option>
                      <option value="Exam / Test">📝 Exam / Assessment Notice</option>
                      <option value="General">📌 General Academy Circular</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Batch / Audience *</label>
                    <select
                      value={newAnnouncement.batchId}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, batchId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                    >
                      <option value="all">All Batches (Academy-wide Notice)</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                    >
                      <option value="Normal">Normal (Standard information)</option>
                      <option value="Important">Important (High visibility)</option>
                      <option value="Urgent">Urgent (Flashing priority tag)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Effective Date / Timing</label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd October 2026 (Full Day) or Friday 7:30 PM"
                      value={newAnnouncement.effectiveDate}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, effectiveDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Circular Notice & Guidelines *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Enter detailed notice message, instructions for students, class resumption dates, homework guidelines, etc..."
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Pin to Top of Website Notice Board</span>
                    <span className="text-[11px] text-slate-500">Highlighted first when students visit the academy homepage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                    className="w-4 h-4 text-[#4A1D96] rounded cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddAnnouncementModal(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Publish Notice Now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: EDIT EXISTING ANNOUNCEMENT */}
        {/* ==================================================================== */}
        {editingAnnouncement && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4A1D96] flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                      Edit Academy Notice
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Update notice details, timings, or guidelines
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditingAnnouncement(null)} 
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateAnnouncement} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    value={editingAnnouncement.title}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Notice Category *</label>
                    <select
                      value={editingAnnouncement.category || 'General'}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                    >
                      <option value="Holiday">🏖️ Holiday Notice (Class closed)</option>
                      <option value="Class Notice">📢 Class Notice (Mock test, speaking pairs)</option>
                      <option value="Schedule Change">🕒 Schedule / Timing Change</option>
                      <option value="Urgent Alert">🚨 Urgent Alert</option>
                      <option value="Exam / Test">📝 Exam / Assessment Notice</option>
                      <option value="General">📌 General Academy Circular</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Batch / Audience *</label>
                    <select
                      value={editingAnnouncement.batchId}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, batchId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                    >
                      <option value="all">All Batches (Academy-wide Notice)</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Priority Level</label>
                    <select
                      value={editingAnnouncement.priority}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, priority: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs font-semibold"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Effective Date / Timing</label>
                    <input
                      type="text"
                      value={editingAnnouncement.effectiveDate || ''}
                      onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, effectiveDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Circular Notice & Guidelines *</label>
                  <textarea
                    required
                    rows={5}
                    value={editingAnnouncement.message}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 text-xs leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Pin to Top of Website Notice Board</span>
                    <span className="text-[11px] text-slate-500">Showcases prominently on homepage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(editingAnnouncement.isPinned)}
                    onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, isPinned: e.target.checked })}
                    className="w-4 h-4 text-[#4A1D96] rounded cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingAnnouncement(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PREVIEW NOTICE POPUP CIRCULAR MODAL */}
        {/* ==================================================================== */}
        {previewingAnnouncement && (
          <AnnouncementModal
            isOpen={Boolean(previewingAnnouncement)}
            announcement={previewingAnnouncement}
            onClose={() => setPreviewingAnnouncement(null)}
            siteSettings={siteSettings}
          />
        )}

        {/* ==================================================================== */}
        {/* MODAL: EDIT STUDY MATERIAL & PDF LINK */}
        {/* ==================================================================== */}
        {editingMaterial && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto overscroll-contain smooth-scroll-viewport">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4A1D96] flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                      Edit Study Material & PDF Link
                    </h3>
                    <p className="text-[11px] text-slate-500">Upload new PDF from device/gallery or update cloud document link</p>
                  </div>
                </div>
                <button onClick={() => setEditingMaterial(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateMaterial} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Batch *</label>
                  <select
                    value={editingMaterial.batchId}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, batchId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] bg-slate-50 text-slate-900 font-medium"
                  >
                    <option value="all">🌟 All Batches & Public Website (Knowledge Bank)</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Knowledge Bank Category *</label>
                    <select
                      value={editingMaterial.category || 'Worksheets'}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                    >
                      <option value="Worksheets">Worksheets</option>
                      <option value="English Vocabulary">English Vocabulary</option>
                      <option value="Daily Sentences">Daily Sentences</option>
                      <option value="Grammar Guides">Grammar Guides</option>
                      <option value="Speaking Practice">Speaking Practice</option>
                      <option value="E-books">E-books</option>
                      <option value="Learning Tips">Learning Tips</option>
                      <option value="Practice Tests">Practice Tests</option>
                      <option value="Study Notes">Study Notes</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Proficiency Level</label>
                    <select
                      value={editingMaterial.level || 'All Levels'}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={editingMaterial.title}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#4A1D96] text-slate-900 font-medium"
                  />
                </div>

                {/* Public Website Visibility */}
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-950 block text-xs">
                      Display on Public Website (Learning Resources Section)
                    </span>
                    <span className="text-[11px] text-purple-700">
                      Visible in the website's PDF Study Guides & Knowledge Bank
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingMaterial.isVisibleOnWebsite !== false}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, isVisibleOnWebsite: e.target.checked })}
                    className="w-4 h-4 text-[#4A1D96] rounded cursor-pointer accent-[#4A1D96]"
                  />
                </div>

                {/* PDF Upload / Cloud Link Engine */}
                <PdfUploadInput
                  pdfUrl={editingMaterial.pdfUrl || ''}
                  onPdfUrlChange={(url) => setEditingMaterial({ ...editingMaterial, pdfUrl: url })}
                  token={token}
                  titleValue={editingMaterial.title}
                  onTitleSuggest={(suggestedTitle) => {
                    if (!editingMaterial.title || editingMaterial.title.trim() === '') {
                      setEditingMaterial(prev => prev ? ({ ...prev, title: suggestedTitle }) : null);
                    }
                  }}
                  onFileUploaded={({ fileSize }) => {
                    setEditingMaterial(prev => prev ? ({
                      ...prev,
                      fileSize: fileSize || prev.fileSize,
                      fileType: 'pdf'
                    }) : null);
                  }}
                  onPreviewTest={(url) => setPreviewingPdfMaterial({
                    title: editingMaterial.title || 'PDF Preview',
                    pdfUrl: url,
                    description: editingMaterial.description,
                    category: 'Study Resource Preview'
                  })}
                />

                {/* View-Only Protection Setting */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#4A1D96]" />
                      <span>View-Only Protection (Strict Anti-Download)</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Prevents student downloads, print commands, and context menu saving
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editingMaterial.isViewOnly !== false}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, isViewOnly: e.target.checked })}
                    className="w-4 h-4 text-[#4A1D96] rounded cursor-pointer accent-[#4A1D96]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">File Type</label>
                    <select
                      value={editingMaterial.fileType}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, fileType: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="doc">Word / Notes</option>
                      <option value="audio">Audio Drills</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">File Size</label>
                    <input
                      type="text"
                      value={editingMaterial.fileSize}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, fileSize: e.target.value })}
                      placeholder="1.5 MB"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description / Summary</label>
                  <textarea
                    rows={2}
                    value={editingMaterial.description}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[#4A1D96]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingMaterial(null)}
                    className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold cursor-pointer shadow-xs"
                  >
                    Update Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL: ADMIN PROTECTED PDF VIEWER TESTER */}
        {/* ==================================================================== */}
        {previewingPdfMaterial && (
          <ProtectedPdfViewer
            isOpen={Boolean(previewingPdfMaterial)}
            onClose={() => setPreviewingPdfMaterial(null)}
            title={previewingPdfMaterial.title}
            pdfUrl={previewingPdfMaterial.pdfUrl}
            category={previewingPdfMaterial.category || 'Batch Study Material'}
            batchName={previewingPdfMaterial.batchName || 'Wits Lingo Academy'}
            studentName="Admin Test Preview"
            description={previewingPdfMaterial.description}
            allowDownload={false}
          />
        )}

        {/* ==================================================================== */}
        {/* MODAL: CUSTOM IN-APP DELETE CONFIRMATION (IFRAME SAFE) */}
        {/* ==================================================================== */}
        {deleteModal && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[999] flex items-center justify-center p-4 animate-in fade-in duration-150 overscroll-contain smooth-scroll-viewport"
            onClick={() => !isDeletingItem && setDeleteModal(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-['Outfit'] font-bold text-lg text-slate-900">
                    {deleteModal.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {deleteModal.description}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-red-50/70 rounded-xl border border-red-100 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <div className="text-xs text-red-900 truncate">
                  <span className="text-red-600 font-medium">Record: </span>
                  <strong className="font-bold">{deleteModal.itemName}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDeletingItem}
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-delete-action-btn"
                  disabled={isDeletingItem}
                  onClick={async () => {
                    setIsDeletingItem(true);
                    try {
                      await deleteModal.onConfirm();
                    } finally {
                      setIsDeletingItem(false);
                      setDeleteModal(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeletingItem ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
