import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { 
  FileText, Download, Printer, Copy, Check, X, ShieldCheck, 
  ExternalLink, Sparkles, Layers, Cpu, Database, Lock, Globe,
  CheckCircle2, BookOpen, Terminal, Smartphone
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

interface SystemReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemReportModal: React.FC<SystemReportModalProps> = ({ isOpen, onClose }) => {
  useScrollLock(isOpen);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Direct jsPDF Multi-page Vector PDF Generator
  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin - 12) {
          addFooter(doc.getNumberOfPages());
          doc.addPage();
          y = margin + 8;
          addHeader();
        }
      };

      const addHeader = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 120);
        doc.text('WITS LINGO — COMPLETE SYSTEM ARCHITECTURE & FUNCTIONAL REPORT', margin, margin);
        doc.setDrawColor(220, 220, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
      };

      const addFooter = (pageNum: number) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 145);
        const footerY = pageHeight - margin + 5;
        doc.setDrawColor(220, 220, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
        doc.text('Confidential & Official Document • WITS LINGO Platform', margin, footerY);
        doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: 'right' });
      };

      // COVER / BANNER
      doc.setFillColor(46, 16, 101); // Dark Purple #2E1065
      doc.rect(margin, y, contentWidth, 34, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('WITS LINGO', margin + 8, y + 12);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(230, 210, 255);
      doc.text('A Global Language Platform — A to Z Website Architecture & Technical Report', margin + 8, y + 20);

      doc.setFontSize(8.5);
      doc.setTextColor(190, 170, 225);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • Status: Production Active Full-Stack`, margin + 8, y + 27);

      y += 42;

      // SECTION 1: EXECUTIVE SUMMARY
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('1. Executive Overview & Brand Identity', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 50);
      const execText = 
        'WITS LINGO is a modern, full-stack educational and digital classroom platform designed for high-impact English language training, eliminating mother-tongue influence (MTI), and developing natural conversational fluency. Founded by Lead Mentor Ziyaur Rehman Zia, the academy operates global live batch classes, an automated web-based admissions and fee verification portal, protected video-on-demand playback, and cloud study materials distribution.';
      const execLines = doc.splitTextToSize(execText, contentWidth);
      doc.text(execLines, margin, y);
      y += execLines.length * 4.6 + 4;

      // METRICS TABLE BOX
      checkPageBreak(25);
      doc.setFillColor(248, 246, 253);
      doc.setDrawColor(215, 200, 245);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(74, 29, 150);
      doc.text('PLATFORM CORE ATTRIBUTES', margin + 5, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 70);
      doc.text('• Brand Name: WITS LINGO ("A Global Language Platform")', margin + 5, y + 12);
      doc.text('• Backend Server: Node.js Express 4.x (server.ts) on Port 3000', margin + 5, y + 17);
      doc.text('• Client Architecture: React 18, Vite, TypeScript, Tailwind CSS', margin + 95, y + 12);
      doc.text('• Cloud Storage: Backblaze B2 Object Storage & AWS S3 Client', margin + 95, y + 17);
      y += 28;

      // SECTION 2: ARCHITECTURE & TECH STACK
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('2. Technology Stack & Full-Stack Infrastructure', margin, y);
      y += 6;

      const techItems = [
        ['Frontend Framework', 'React 18 with TypeScript in strict mode, component-driven modular structure.'],
        ['Styling & System', 'Tailwind CSS (V4 engine) with customized palette and typography.'],
        ['Backend Engine', 'Node.js + Express with 3,000+ lines of production RESTful API logic.'],
        ['Authentication', 'HMAC-SHA256 cryptographically signed tokens with role-based access (RBAC).'],
        ['PDF Slip Engine', 'Client-side vector generation using jsPDF and html2canvas for instant downloads.'],
        ['Cloud Storage', 'Backblaze B2 Native API & S3 Client for syllabus and worksheet PDF distribution.'],
        ['Streaming Gateway', 'Expiring signed token verification gateway with anti-piracy dynamic watermark.']
      ];

      techItems.forEach(([label, desc]) => {
        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(74, 29, 150);
        doc.text(`• ${label}: `, margin, y);
        const labelWidth = doc.getTextWidth(`• ${label}: `);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 60);
        doc.text(desc, margin + labelWidth, y);
        y += 5.2;
      });
      y += 4;

      // SECTION 3: WEB ADMISSION & FEE ENGINE
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('3. Complete Web Admission & Fee Verification Workflow', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 50);
      const admText = 
        'In strict compliance with academy requirements, the admission system is 100% web-based and completely independent of third-party messaging apps. The registration workflow executes in 4 structured stages:';
      const admLines = doc.splitTextToSize(admText, contentWidth);
      doc.text(admLines, margin, y);
      y += admLines.length * 4.6 + 3;

      const stages = [
        ['Stage 1: Student Demographics', 'Student full name, father\'s name, date of birth, gender, 10-digit mobile contact, email, and hierarchical address selector (Country, State, District, Tehsil, and Pincode).'],
        ['Stage 2: Academic & Course Selection', 'Learner selects English proficiency level (Beginner/Intermediate/Advanced) and chooses target course & batch (e.g. Spoken English, English Foundation, Communication Skills).'],
        ['Stage 3: Multi-Currency Payment Gateway', 'Supports 15+ international currencies (INR, USD, GBP, EUR, AED, SAR, CAD, AUD, PKR, BDT, etc.) with real-time rate conversion. Provides Instant UPI QR Code, Net Banking / Wire transfer details, Razorpay, and PayPal options.'],
        ['Stage 4: Official Downloadable Admission Slip', 'Upon payment submission, the system issues a verified Official Admission Voucher with unique Student Roll No, dynamic QR code verification hash, course schedule, fee breakdown, and immediate PDF download.']
      ];

      stages.forEach(([title, body]) => {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(46, 16, 101);
        doc.text(title, margin + 2, y);
        y += 4.2;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 70);
        const lines = doc.splitTextToSize(body, contentWidth - 4);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4 + 2.5;
      });

      // SECTION 4: STUDENT PORTAL FEATURES
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('4. Student Learning Portal & Classroom Infrastructure', margin, y);
      y += 6;

      const portalFeatures = [
        '• Enrolled Batches Hub: Displays assigned live batches, scheduled timings, and instructor profile.',
        '• Live Class Attendance Tracker: Auto-records student check-in time and duration upon entering the classroom.',
        '• Video-on-Demand (VOD) Player: Stream past lecture recordings with expiring signed HMAC tokens (60-min TTL).',
        '• Forensic Watermarking: Real-time overlay of student name and ID over video to prevent screen capture piracy.',
        '• In-Browser PDF Reader: Built-in reader for study worksheets with View-Only mode and download controls.',
        '• Assignment Submission: Submit homework exercises directly online for teacher review and grading.',
        '• Announcements Feed: Instant broadcast of holiday notices, schedule revisions, and class materials.'
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 60);
      portalFeatures.forEach(item => {
        checkPageBreak(6);
        doc.text(item, margin, y);
        y += 4.8;
      });
      y += 4;

      // SECTION 5: ADMIN CONTROL CENTER
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('5. Enterprise Admin Control Center', margin, y);
      y += 6;

      const adminModules = [
        ['Student Database & Filter', 'Full student roster with batch-level filtering, search by roll no/name, fee transaction verification, and account moderation.'],
        ['Course CMS Engine', 'Complete CRUD control over course catalog: modify syllabus points, duration, fees, level badges, and publication status.'],
        ['Batch Lifecycle Manager', 'Create and schedule morning/evening batches, set seat capacity, assign instructors, and configure website visibility.'],
        ['Live Class & Auto-Recorder', 'Schedule sessions, initiate Live mode, and auto-convert ended sessions into structured recording catalog entries.'],
        ['Backblaze B2 Cloud Storage', 'Upload PDF worksheets directly from device storage to cloud object storage with proxy streaming and local fallback.'],
        ['Academy Notice Board', 'Publish pinned, urgent, or batch-targeted notices with priority flags.'],
        ['Site Settings & Banking CMS', 'Update bank accounts, UPI IDs, helpline numbers, and hero banner announcements with instantaneous client sync.']
      ];

      adminModules.forEach(([title, desc]) => {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(74, 29, 150);
        doc.text(`• ${title}: `, margin, y);
        const w = doc.getTextWidth(`• ${title}: `);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 60);
        const lns = doc.splitTextToSize(desc, contentWidth - w);
        doc.text(lns, margin + w, y);
        y += lns.length * 4 + 2;
      });
      y += 4;

      // SECTION 6: API DIRECTORY
      checkPageBreak(50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('6. Backend RESTful API Directory (server.ts)', margin, y);
      y += 6;

      const apiList = [
        ['POST', '/api/auth/login', 'Authenticate student, admin, or roll no credentials.'],
        ['GET', '/api/auth/me', 'Retrieve current session user profile and batch authorization.'],
        ['POST', '/api/admissions/register', 'Submit web admission form with payment confirmation.'],
        ['GET', '/api/student/admission-slip', 'Retrieve verified student admission voucher and slip.'],
        ['GET', '/api/batches', 'Fetch live course batch catalog with enrollment counts.'],
        ['GET', '/api/batches/:id/classes', 'Batch classes list (Strict enrollment authorization).'],
        ['GET', '/api/batches/:id/recordings', 'Authorized lecture recordings list.'],
        ['GET', '/api/batches/:id/recordings/:recId/stream-ticket', 'Generate signed, expiring video playback ticket.'],
        ['POST', '/api/classes/:id/join', 'Log student attendance and entry timestamp.'],
        ['POST', '/api/classes/:id/leave', 'Log student exit timestamp and session duration.'],
        ['GET', '/api/files/pdf/:id/:filename', 'Protected inline PDF streaming gateway.'],
        ['GET', '/api/proxy-pdf', 'Document proxy preventing X-Frame-Options embedding errors.'],
        ['POST', '/api/admin/upload-file', 'Upload PDF document to Backblaze B2 & disk storage.'],
        ['GET', '/api/admin/students', 'Admin student registry with batch filter query.'],
        ['POST', '/api/admin/batches', 'Create new live batch with capacity limits.'],
        ['POST', '/api/admin/schedule-class', 'Schedule live class session.'],
        ['POST', '/api/admin/classes/:id/status', 'Toggle live/completed status and trigger auto-recording.'],
        ['GET', '/api/courses', 'Public and admin courses catalog.'],
        ['POST', '/api/courses', 'Create course curriculum and fee structure.'],
        ['POST', '/api/cms/content', 'Update global site content and payment credentials.']
      ];

      apiList.forEach(([method, endpoint, desc]) => {
        checkPageBreak(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(method === 'POST' ? 180 : 30, method === 'POST' ? 70 : 120, method === 'POST' ? 20 : 180);
        doc.text(method, margin + 1, y);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 50);
        doc.text(endpoint, margin + 16, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(90, 90, 105);
        doc.text(`— ${desc}`, margin + 82, y);
        y += 4.5;
      });

      // SECTION 7: SECURITY & INTEGRITY
      checkPageBreak(30);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(46, 16, 101);
      doc.text('7. Security, Protection & Privacy Guarantees', margin, y);
      y += 6;

      const securityPoints = [
        '1. Role-Based Batch Isolation: Students can only view classrooms and recordings for batches they paid for.',
        '2. Expiring Signed Playback Tokens: Video streams cannot be stolen or hotlinked; URLs expire after 60 minutes.',
        '3. Anti-Piracy Watermarking: Visual forensic watermarks containing the student\'s name and Roll No prevent illegal leaking.',
        '4. View-Only PDF Protection: Prevents direct PDF downloading where restricted by instructors.',
        '5. Payment Reference Verification: No admission voucher is unlocked without a valid transaction reference.'
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 50, 60);
      securityPoints.forEach(p => {
        checkPageBreak(6);
        doc.text(p, margin, y);
        y += 4.6;
      });

      // SIGNATURE & SEAL BLOCK
      checkPageBreak(25);
      y += 6;
      doc.setFillColor(248, 246, 253);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(46, 16, 101);
      doc.text('OFFICIAL VERIFICATION & CERTIFICATION', margin + 6, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(70, 70, 80);
      doc.text('This document constitutes the complete architectural and operational specification of WITS LINGO.', margin + 6, y + 11);
      doc.text('Issued by: Wits Lingo Technical Architecture & Mentorship Office • www.witslingo.com', margin + 6, y + 16);

      // Add footers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i);
      }

      doc.save(`Wits_Lingo_Website_Documentation_Report.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF. Please try Print / Save as PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const markdownContent = `# WITS LINGO — Complete Website Architecture & Functional Report

## Executive Overview
- Brand Name: WITS LINGO (A Global Language Platform)
- Core Focus: Practical English language learning, overcoming hesitation, live online batch classes.
- Founder & Mentor: Ziyaur Rehman Zia
- System Status: Full-Stack Active on Node.js Express (server.ts) & React 18

## Key Capabilities
1. Web-based multi-step admission wizard without WhatsApp dependency
2. Instant downloadable and printable official Admission Voucher with verification QR Code
3. Multi-currency fee engine supporting 15+ global currencies (UPI, Net Banking, Card, PayPal)
4. Enrolled student portal with live attendance tracker and protected VOD lectures
5. Expiring signed playback tokens with forensic student watermarking
6. Admin Control Center for student records, batches, courses, Backblaze B2 PDF uploads, and announcements
7. 3,000+ line RESTful backend API with HMAC-SHA256 authentication

Generated from WITS LINGO Platform.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:shadow-none print:border-none">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#2E1065] via-[#4A1D96] to-[#3B0764] text-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-['Outfit']">Website Documentation & Full Report</h2>
              <p className="text-xs text-purple-200">A to Z Technical Architecture, Admissions & Backend Catalog</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download official PDF report"
            >
              <Download className="w-3.5 h-3.5" />
              {isGenerating ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              title="Print or Save as PDF via browser"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              title="Copy summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div ref={reportContentRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50/50 print:bg-white print:p-0">
          
          {/* Document Cover Badge */}
          <div className="p-6 bg-gradient-to-br from-[#2E1065] to-[#4A1D96] rounded-xl text-white shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-purple-100">
                  Official Architecture Document
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] mt-2">WITS LINGO</h1>
                <p className="text-sm text-purple-200 mt-1">A Global Language Platform — Comprehensive A to Z Website Report</p>
              </div>
              <div className="text-left sm:text-right text-xs text-purple-200 space-y-1">
                <div>Status: <span className="text-emerald-300 font-semibold">Active Full-Stack System</span></div>
                <div>Runtime: Node.js 20+ & React 18</div>
                <div>Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Overview */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#4A1D96]">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">1. Executive Overview & Brand Identity</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>WITS LINGO</strong> is an interactive English language learning platform designed to take learners from foundational hesitancy to natural conversational fluency. Founded by <strong>Ziyaur Rehman Zia</strong>, the platform combines live online batches, a web-based admission and payment gateway, a dedicated student learning portal with attendance tracking, anti-piracy video-on-demand playback, and cloud-backed study material distribution.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                <span className="text-xs text-slate-500">Brand Tagline</span>
                <p className="text-xs font-bold text-[#4A1D96] mt-0.5">A Global Language Platform</p>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                <span className="text-xs text-slate-500">Core Focus</span>
                <p className="text-xs font-bold text-[#4A1D96] mt-0.5">Natural Speaking & Fluency</p>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                <span className="text-xs text-slate-500">Architecture</span>
                <p className="text-xs font-bold text-[#4A1D96] mt-0.5">Node.js Express + React 18</p>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                <span className="text-xs text-slate-500">Storage</span>
                <p className="text-xs font-bold text-[#4A1D96] mt-0.5">Backblaze B2 & Disk Proxy</p>
              </div>
            </div>
          </div>

          {/* Section 2: Technology Stack */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#4A1D96]">
              <Cpu className="w-5 h-5" />
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">2. Full-Stack Technical Stack</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="py-2 px-3 font-semibold text-slate-700">Layer</th>
                    <th className="py-2 px-3 font-semibold text-slate-700">Technology</th>
                    <th className="py-2 px-3 font-semibold text-slate-700">Specification & Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Frontend Client</td>
                    <td className="py-2 px-3 font-semibold text-[#4A1D96]">React 18 + Vite</td>
                    <td className="py-2 px-3">High-speed SPA with fast module replacement and smooth client routing.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Type System</td>
                    <td className="py-2 px-3 font-semibold text-[#4A1D96]">TypeScript 5.x</td>
                    <td className="py-2 px-3">Strict interface enforcement across courses, batches, admissions, and users.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Styling & UI</td>
                    <td className="py-2 px-3 font-semibold text-[#4A1D96]">Tailwind CSS V4</td>
                    <td className="py-2 px-3">Modern mobile-responsive UI with brand purple typography and zero-pill buttons.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Backend Server</td>
                    <td className="py-2 px-3 font-semibold text-[#4A1D96]">Node.js + Express</td>
                    <td className="py-2 px-3">Over 3,000 lines in <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-900">server.ts</code> handling all admission, auth, class, and CMS logic.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">PDF Generator</td>
                    <td className="py-2 px-3 font-semibold text-[#4A1D96]">jsPDF + html2canvas</td>
                    <td className="py-2 px-3">Client-side high-resolution rendering of printable admission slips and reports.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900">Cloud Storage</td>
                    <td className="py-2 px-3 font-semibold text-[#4A1D96]">Backblaze B2 & S3 SDK</td>
                    <td className="py-2 px-3">Cloud PDF worksheet uploads and proxy streaming to bypass iframe blocks.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Web-Based Admission Engine */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#4A1D96]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">3. Web Admission & Fee Submission Workflow</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              The admission process is fully self-contained on the web without WhatsApp requirements, concluding in an instant, official downloadable PDF admission slip:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-2">
                <span className="font-bold text-xs text-[#4A1D96] uppercase">Step 1: Student Demographics</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Captures Student Name, Father\'s Name, Date of Birth, Gender, 10-digit Phone & WhatsApp, Email, Custom Password, and hierarchical Address selection (Country, State, District, Tehsil, Pincode).
                </p>
              </div>
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-2">
                <span className="font-bold text-xs text-[#4A1D96] uppercase">Step 2: Course & Batch Selection</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selects English Proficiency (Beginner to Advanced) and target batch (e.g., Spoken English, English Foundation, Communication Skills) with real-time fee computation.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-2">
                <span className="font-bold text-xs text-[#4A1D96] uppercase">Step 3: Multi-Currency Payment</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Supports 15+ international currencies with dynamic conversion. Features instant UPI QR code generation, direct bank wire instructions (SBI, IFSC, Swift), Razorpay, and PayPal options.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 space-y-2">
                <span className="font-bold text-xs text-[#4A1D96] uppercase">Step 4: Downloadable Admission Slip</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Auto-generates official Admission Voucher with Roll No (<code className="text-purple-800">WL-OCT2026-XXXX</code>), QR Code verification, schedule, fee receipt, and instant PDF download.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Student Learning Portal */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#4A1D96]">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">4. Student Learning Portal & Virtual Classroom</h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D96] mt-1.5 flex-shrink-0" />
                <span><strong>Batch Isolation:</strong> Strict authorization ensures students only see classes, materials, and recordings for batches they enrolled in.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D96] mt-1.5 flex-shrink-0" />
                <span><strong>Live Classroom & Attendance Logging:</strong> Automatically tracks student join time and duration into server attendance records upon entering.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D96] mt-1.5 flex-shrink-0" />
                <span><strong>Expiring Playback Tickets:</strong> Video lectures stream via signed HMAC tokens (60-min expiration) preventing direct link harvesting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D96] mt-1.5 flex-shrink-0" />
                <span><strong>Forensic Watermarking:</strong> Overlays student name and Roll No over video recordings to prevent unauthorized screen sharing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A1D96] mt-1.5 flex-shrink-0" />
                <span><strong>In-App Protected PDF Viewer:</strong> Clean in-browser reader for grammar sheets and vocabulary notes without external iframe blocks.</span>
              </li>
            </ul>
          </div>

          {/* Section 5: Admin Control Center */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#4A1D96]">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">5. Enterprise Admin Control Center</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Student & Admission Records</strong>
                Batch-wise filtering, search by phone or Roll No, verification of payment transaction IDs, and record management.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Course Catalog CMS</strong>
                Create and edit course descriptions, syllabus bullet points, pricing, duration, and publish/draft toggles.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Batch Management & Timing</strong>
                Add upcoming batches, set enrollment caps, designate instructors, and control website listing visibility.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Live Class & Auto-Recording</strong>
                Trigger Live class status and automatically convert completed sessions into archived video recordings.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Backblaze B2 File Uploader</strong>
                Upload syllabus PDFs from device storage to cloud object storage with proxy streaming support.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <strong className="text-slate-900 block mb-1">Academy Announcements & Notice Board</strong>
                Publish pinned notices, holiday advisories, and urgent schedule changes across batches.
              </div>
            </div>
          </div>

          {/* Section 6: API Directory */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-[#4A1D96]">
              <Terminal className="w-5 h-5" />
              <h3 className="text-lg font-bold font-['Outfit'] text-slate-900">6. RESTful API Directory Reference</h3>
            </div>
            <p className="text-xs text-slate-600">Key endpoints implemented in <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-900">server.ts</code>:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-emerald-700 font-bold">POST</span> /api/auth/login
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/auth/me
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-emerald-700 font-bold">POST</span> /api/admissions/register
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/student/admission-slip
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/batches/:id/classes
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/batches/:id/recordings/:id/stream-ticket
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-emerald-700 font-bold">POST</span> /api/classes/:id/join
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/files/pdf/:id/:filename
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/proxy-pdf
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-emerald-700 font-bold">POST</span> /api/admin/upload-file
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-blue-700 font-bold">GET</span> /api/admin/students
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-emerald-700 font-bold">POST</span> /api/cms/content
              </div>
            </div>
          </div>

          {/* Document Verification Seal */}
          <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200 text-center space-y-1">
            <p className="text-xs font-bold text-[#4A1D96]">WITS LINGO — Official Technical & Operational Specification</p>
            <p className="text-[11px] text-slate-500">All rights reserved. Verified by Wits Lingo Administration & Mentorship Desk.</p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500">
            Click <strong>Download PDF</strong> for an official printable vector document.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold shadow-md shadow-purple-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isGenerating ? 'Building PDF...' : 'Download Official Report (PDF)'}
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
