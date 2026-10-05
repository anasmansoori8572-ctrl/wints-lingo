import React, { useState, useEffect, useRef } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, 
  ShieldCheck, Lock, AlertCircle, BookOpen, FileText, 
  ChevronLeft, ChevronRight, Moon, Sun, Sparkles, CheckCircle2,
  ExternalLink, AlertTriangle, RefreshCw, Download, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { optimizePdfUrl } from '../utils/pdfOptimizer';
import { getCurriculumForDocument, CurriculumContent } from '../data/resourceCurriculumContent';

interface ProtectedPdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl?: string;
  category?: string;
  batchName?: string;
  studentName?: string;
  description?: string;
  allowDownload?: boolean;
}

export const ProtectedPdfViewer: React.FC<ProtectedPdfViewerProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  category = 'Study Material',
  batchName,
  studentName = 'Authorized Student',
  description,
  allowDownload = true
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'reader' | 'embed'>('reader');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [securityToast, setSecurityToast] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // In-frame iframe loading and security error recovery
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [iframeRetryCount, setIframeRetryCount] = useState<number>(0);
  const [showLoadNotice, setShowLoadNotice] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const optimization = optimizePdfUrl(pdfUrl || '');
  const curriculum = getCurriculumForDocument(title, category, description);

  // Client-side structured PDF Generator for curriculum materials & digital guides
  const generateClientPdf = (docTitle: string, docCategory: string, curr: CurriculumContent, sName: string, saveFilename: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    const addFooter = (pageNum: number) => {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Author: Ziyaur Rehman Zia  •  Wits Lingo Academy (www.witslingo.com)', margin, pageHeight - 7);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 12, pageHeight - 7);
    };

    const addPageHeader = () => {
      doc.setFillColor(74, 29, 150); // #4A1D96
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('WITS LINGO ACADEMY • OFFICIAL STUDY MATERIAL', margin + 4, y + 4.8);
      y += 11;
    };

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin - 14) {
        doc.addPage();
        y = margin;
        addPageHeader();
      }
    };

    // First page top branding banner
    doc.setFillColor(74, 29, 150);
    doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('WITS LINGO ACADEMY', margin + 6, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(233, 213, 255);
    doc.text('A Global Language Platform  |  Master Spoken English Fluency', margin + 6, y + 14);
    y += 24;

    // Document Title Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    const titleLines = doc.splitTextToSize(docTitle, contentWidth - 12);
    const titleBoxHeight = Math.max(18, (titleLines.length * 5.5) + 10);
    doc.roundedRect(margin, y, contentWidth, titleBoxHeight, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(titleLines, margin + 6, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Category: ${docCategory}   |   Instructor: Ziyaur Rehman Zia   |   Authorized For: ${sName}`, margin + 6, y + titleBoxHeight - 3.5);
    y += titleBoxHeight + 5;

    // Render each curriculum page
    curr.pages.forEach((page, pIdx) => {
      if (pIdx > 0) {
        checkPageBreak(25);
      }

      // Page / Module Heading
      checkPageBreak(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(74, 29, 150);
      doc.text(page.heading, margin, y);
      y += 4.5;

      if (page.subheading) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const subLines = doc.splitTextToSize(page.subheading, contentWidth);
        doc.text(subLines, margin, y);
        y += (subLines.length * 4) + 1.5;
      }
      y += 1.5;

      // Sections
      page.sections.forEach(sec => {
        if (sec.type === 'text' && sec.content) {
          checkPageBreak(14);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const lines = doc.splitTextToSize(sec.content, contentWidth);
          doc.text(lines, margin, y);
          y += (lines.length * 4) + 3;
        } else if (sec.type === 'rule') {
          const ruleLines = doc.splitTextToSize(sec.content || '', contentWidth - 12);
          const boxHeight = 10 + (ruleLines.length * 4);
          checkPageBreak(boxHeight + 4);
          doc.setFillColor(255, 251, 235);
          doc.setDrawColor(253, 230, 138);
          doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(146, 64, 14);
          doc.text(sec.title || 'Key Principle:', margin + 5, y + 5);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(120, 53, 15);
          doc.text(ruleLines, margin + 5, y + 9.5);
          y += boxHeight + 3.5;
        } else if (sec.type === 'vocabulary' && sec.items) {
          sec.items.forEach(item => {
            const hasSentence = Boolean(item.sentence);
            const boxH = hasSentence ? 14 : 9;
            checkPageBreak(boxH + 3);
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, y, contentWidth, boxH, 1.2, 1.2, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(74, 29, 150);
            doc.text(`• ${item.word || ''}`, margin + 4, y + 5);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            const meaningClean = (item.meaning || '').replace(/[^\x00-\x7F]/g, ' ').replace(/\s+/g, ' ').trim();
            if (meaningClean) {
              const mLines = doc.splitTextToSize(`— ${meaningClean}`, contentWidth - 45);
              doc.text(mLines, margin + 35, y + 5);
            }

            if (item.sentence) {
              doc.setFont('helvetica', 'italic');
              doc.setFontSize(7.5);
              doc.setTextColor(100, 116, 139);
              const sentenceText = `Example: "${item.sentence}"`;
              const sLines = doc.splitTextToSize(sentenceText, contentWidth - 10);
              doc.text(sLines, margin + 6, y + 10);
            }
            y += boxH + 2.5;
          });
        } else if (sec.type === 'dialogue' && sec.items) {
          checkPageBreak(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(74, 29, 150);
          doc.text(sec.title || 'Practical Dialogue:', margin, y);
          y += 4.5;

          sec.items.forEach(item => {
            const speechLines = doc.splitTextToSize(`"${item.text || ''}"`, contentWidth - 28);
            const dH = (speechLines.length * 4) + 2;
            checkPageBreak(dH + 2);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(30, 41, 59);
            doc.text(`${item.speaker || 'Speaker'}:`, margin + 3, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text(speechLines, margin + 25, y);
            y += dH;
          });
          y += 2.5;
        } else if (sec.type === 'practice' && sec.items) {
          checkPageBreak(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(16, 185, 129);
          doc.text(sec.title || 'Daily Practice Drill:', margin, y);
          y += 4.5;

          sec.items.forEach((item, idx) => {
            const pLines = doc.splitTextToSize(`${idx + 1}. ${item.text || item.sentence || ''}`, contentWidth - 6);
            checkPageBreak((pLines.length * 4) + 2);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(51, 65, 85);
            doc.text(pLines, margin + 3, y);
            y += (pLines.length * 4) + 1.5;
          });
          y += 2.5;
        } else if (sec.type === 'table' && sec.tableData) {
          const headers = sec.tableData.headers;
          const colWidth = contentWidth / headers.length;
          checkPageBreak(20);

          doc.setFillColor(237, 233, 254);
          doc.rect(margin, y, contentWidth, 6, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(74, 29, 150);
          headers.forEach((h, hIdx) => {
            doc.text(h, margin + (hIdx * colWidth) + 2, y + 4.2);
          });
          y += 6;

          sec.tableData.rows.forEach((row, rIdx) => {
            checkPageBreak(6);
            if (rIdx % 2 === 1) {
              doc.setFillColor(248, 250, 252);
              doc.rect(margin, y, contentWidth, 5.5, 'F');
            }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(51, 65, 85);
            row.forEach((cell, cIdx) => {
              doc.text(cell, margin + (cIdx * colWidth) + 2, y + 3.8);
            });
            y += 5.5;
          });
          y += 3;
        }
      });
    });

    // Add page numbering footer to all pages
    const totalPagesCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPagesCount; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    doc.save(saveFilename);
  };

  // Comprehensive Real PDF Downloader
  const handleDownloadPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const safeDocName = (title || 'Study_Material')
      .replace(/[/\\?%*:|"<>]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const finalFilename = safeDocName.toLowerCase().endsWith('.pdf') ? safeDocName : `${safeDocName}.pdf`;

    try {
      const orig = (optimization.originalUrl || pdfUrl || '').trim();

      // 1. Data URI or Blob URL directly available
      if (orig.startsWith('data:application/pdf') || orig.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = orig;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        triggerToast('📥 PDF downloaded successfully!');
        setIsDownloading(false);
        return;
      }

      // 2. Server or External URL
      let targetUrl = orig;
      if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('sample:')) {
        if (targetUrl.includes('/api/files/pdf/')) {
          targetUrl = targetUrl.replace('/api/files/pdf/', '/api/files/download/').split('#')[0];
        } else if (targetUrl.startsWith('/api/proxy-pdf?url=')) {
          try {
            const decoded = decodeURIComponent(targetUrl.replace('/api/proxy-pdf?url=', '').split('&')[0].split('#')[0]);
            targetUrl = decoded;
          } catch {}
        }

        // Google Drive export conversion
        const gDriveMatch = targetUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
                            targetUrl.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i) ||
                            targetUrl.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/i);

        let fetchEndpoint = targetUrl;
        if (gDriveMatch && gDriveMatch[1]) {
          fetchEndpoint = `/api/proxy-pdf?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`)}`;
        } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
          fetchEndpoint = `/api/proxy-pdf?url=${encodeURIComponent(targetUrl.split('#')[0])}`;
        }

        try {
          const res = await fetch(fetchEndpoint);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            const blob = await res.blob();
            // Validate blob contains real binary content and is not empty/error
            if (blob && blob.size > 200 && !contentType.includes('text/html')) {
              const blobUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = finalFilename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
              triggerToast('📥 PDF downloaded successfully!');
              setIsDownloading(false);
              return;
            }
          }
        } catch (fetchErr) {
          console.warn('Network file download failed, falling back to digital generator:', fetchErr);
        }
      }

      // 3. Fallback / Built-in Digital Curriculum Guide
      generateClientPdf(title, category, curriculum, studentName, finalFilename);
      triggerToast('📥 PDF generated and downloaded successfully!');
    } catch (err: any) {
      console.error('PDF download error:', err);
      triggerToast('❌ Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Auto-switch to embed tab if a real external embed link is provided
  useEffect(() => {
    setIframeLoading(true);
    setIframeError(false);
    setShowLoadNotice(false);

    if (optimization.embedUrl && optimization.embedUrl.length > 5) {
      setActiveTab('embed');
      // Show graceful helper notice if Chrome/browser is blocking or taking long to render
      const timer = setTimeout(() => {
        setShowLoadNotice(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setActiveTab('reader');
    }
  }, [pdfUrl, optimization.embedUrl, iframeRetryCount]);

  // Safe external document opener in a new browser tab
  const handleOpenInNewTab = () => {
    let target = optimization.originalUrl || optimization.embedUrl;
    if (!target) return;
    if (target.startsWith('/api/proxy-pdf?url=')) {
      try {
        const decoded = decodeURIComponent(target.replace('/api/proxy-pdf?url=', '').split('&')[0].split('#')[0]);
        target = decoded;
      } catch {}
    }
    const safeUrl = target.startsWith('http') || target.startsWith('/') ? target : `https://${target}`;
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle keyboard security shortcuts & close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
        return;
      }

      // Trigger download on Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleDownloadPdf();
      }

      // Block Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerToast('🔒 Printing is restricted to protect Wits Lingo proprietary copyright.');
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  const triggerToast = (msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => {
      setSecurityToast(null);
    }, 3200);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 180));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const activePage = curriculum.pages[currentPage - 1] || curriculum.pages[0];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in-50 duration-150 overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      
      {/* Toast Alert */}
      {securityToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-5 py-3 rounded-2xl bg-slate-900/95 text-white border border-purple-500/40 shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{securityToast}</span>
        </div>
      )}

      {/* Main Reader Canvas */}
      <div 
        ref={containerRef}
        onContextMenu={(e) => {
          e.preventDefault();
          triggerToast('🔒 Right-click menu disabled on protected academy material.');
        }}
        className={`w-full h-full max-w-6xl max-h-[95vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden select-none transition-colors border border-purple-900/20 ${
          readerTheme === 'dark' 
            ? 'bg-[#12111A] text-slate-100' 
            : readerTheme === 'sepia' 
            ? 'bg-[#FBF8EF] text-[#3E3427]' 
            : 'bg-[#F8F7FC] text-slate-800'
        }`}
      >
        {/* Top Control Bar */}
        <header className="px-4 sm:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 border-b border-purple-100 dark:border-purple-900/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          {/* Left: Branding & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4A1D96] to-[#7E22CE] text-white flex items-center justify-center font-extrabold text-sm shadow-xs flex-shrink-0">
              WL
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#4A1D96] dark:bg-purple-950 dark:text-purple-300">
                  {category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Strictly View-Only</span>
                </span>
                {batchName && (
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    • {batchName}
                  </span>
                )}
              </div>
              <h3 className="font-['Outfit'] font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-md">
                {title}
              </h3>
            </div>
          </div>

          {/* Center / Right: Tabs & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* View Mode Toggle (If embed url exists) */}
            {optimization.embedUrl && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('embed')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeTab === 'embed'
                      ? 'bg-white dark:bg-slate-900 text-[#4A1D96] dark:text-purple-300 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Document PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reader')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeTab === 'reader'
                      ? 'bg-white dark:bg-slate-900 text-[#4A1D96] dark:text-purple-300 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Digital Guide
                </button>
              </div>
            )}

            {/* Zoom Controls (Active in reader view) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 70}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 180}
                className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 disabled:opacity-40 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 text-slate-400 hover:text-purple-600 rounded"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Reading Theme Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setReaderTheme('light')}
                className={`p-1.5 rounded-lg ${readerTheme === 'light' ? 'bg-white text-[#4A1D96] shadow-2xs' : 'text-slate-400'}`}
                title="Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme('sepia')}
                className={`p-1.5 rounded-lg ${readerTheme === 'sepia' ? 'bg-[#FBF8EF] text-[#8C6D37] shadow-2xs font-bold' : 'text-slate-400'}`}
                title="Warm Sepia (Easy on Eyes)"
              >
                <span className="text-[11px] font-bold">Aa</span>
              </button>
              <button
                type="button"
                onClick={() => setReaderTheme('dark')}
                className={`p-1.5 rounded-lg ${readerTheme === 'dark' ? 'bg-slate-900 text-purple-400 shadow-2xs' : 'text-slate-400'}`}
                title="Night Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Button */}
            {allowDownload !== false && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-emerald-700 hover:text-white hover:bg-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold disabled:opacity-60 shadow-2xs"
                title="Download PDF to Device"
              >
                {isDownloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
            )}

            {/* Open in Tab Button */}
            {optimization.originalUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="p-2 rounded-xl text-slate-500 hover:text-[#4A1D96] hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-300 dark:hover:bg-purple-950/40 bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                title="Open Document in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-slate-500 hover:text-white hover:bg-rose-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-2xs group ml-0.5"
              title="Close Reader (Esc)"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </header>

        {/* Security Watermark & Warning Bar */}
        <div className="bg-[#4A1D96] text-white px-4 py-1.5 text-[11px] font-medium flex items-center justify-between flex-shrink-0 shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
            <span>Wits Lingo Protected Reader • Licensed for: <strong>{studentName}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-purple-200">
            <span>Anti-Download Security Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-y-auto relative p-3 sm:p-8 flex justify-center">
          
          {/* Transparent Watermark Overlay sitting over entire canvas */}
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-around items-center opacity-[0.045] dark:opacity-[0.06] rotate-[-18deg] overflow-hidden leading-none select-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white whitespace-nowrap">
                WITS LINGO ACADEMY • STRICTLY VIEW-ONLY • {studentName.toUpperCase()} • DO NOT COPY
              </div>
            ))}
          </div>

          {/* TAB 1: EMBEDDED PDF (Google Drive preview or Direct PDF) */}
          {activeTab === 'embed' && optimization.embedUrl ? (
            <div className="w-full h-full relative rounded-2xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col">
              
              {/* Google Drive / PDF Top-Right Pop-out Click Shield: 
                  Prevents users from clicking the Google Drive preview popout icon that opens external tab */}
              {!iframeError && (
                <div 
                  className="absolute top-0 right-0 w-16 h-14 z-20 cursor-default" 
                  title="External download & pop-out restricted"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerToast('🔒 External download and window pop-out are disabled.');
                  }}
                />
              )}

              {/* Graceful notice if Chrome is slow or blocking in-frame view */}
              {showLoadNotice && !iframeError && (
                <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 z-30 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md border border-purple-500/40 shadow-xl flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-slate-200">
                      If your browser restricts in-frame preview, you can read the digital guide or open in a new tab:
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reader')}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] transition-all cursor-pointer shadow-xs"
                    >
                      Read Digital Guide
                    </button>
                    {optimization.originalUrl && (
                      <button
                        type="button"
                        onClick={handleOpenInNewTab}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open in Tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Loading Spinner */}
              {iframeLoading && !iframeError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs transition-opacity">
                  <div className="w-10 h-10 border-3 border-purple-200 border-t-[#4A1D96] rounded-full animate-spin mb-3"></div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Securing & loading document view...
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Powered by Wits Lingo Protected Reader
                  </p>
                </div>
              )}

              {/* Error / Blocked State Fallback Screen */}
              {iframeError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-slate-50 dark:bg-slate-900 overflow-y-auto">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-full mb-2">
                    Browser In-Frame Protection
                  </span>
                  <h3 className="font-['Outfit'] font-black text-lg sm:text-xl text-slate-900 dark:text-white mb-2">
                    Direct Embedded Preview Restricted
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
                    Chrome or the remote document host restricts embedding this file inside an iframe. You can read the complete, verified <strong>Interactive Digital Study Guide</strong> right here, or open the document in a secure new browser tab.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reader')}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-[#4A1D96] to-[#7E22CE] hover:from-[#3B1578] hover:to-[#6B21A8] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Switch to Interactive Digital Guide</span>
                    </button>
                    {optimization.originalUrl && (
                      <button
                        type="button"
                        onClick={handleOpenInNewTab}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <ExternalLink className="w-4 h-4 text-purple-600" />
                        <span>Open Document in New Tab</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIframeError(false);
                      setIframeLoading(true);
                      setIframeRetryCount(c => c + 1);
                    }}
                    className="mt-6 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry loading in-frame</span>
                  </button>
                </div>
              ) : (
                <iframe
                  key={`${optimization.embedUrl}-${iframeRetryCount}`}
                  src={optimization.embedUrl}
                  title={title}
                  className="w-full h-full border-0"
                  allow="autoplay"
                  onLoad={() => {
                    setIframeLoading(false);
                    setShowLoadNotice(false);
                  }}
                  onError={() => {
                    setIframeLoading(false);
                    setIframeError(true);
                  }}
                />
              )}

              {/* Bottom bar */}
              <div className="p-2 sm:px-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <span className="truncate">Rendering optimized view: <strong>{optimization.provider}</strong></span>
                <div className="flex items-center gap-3">
                  {optimization.originalUrl && (
                    <button
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="text-slate-600 dark:text-slate-300 hover:text-[#4A1D96] dark:hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                      title="Open external document in a new browser tab"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3 h-3 text-purple-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('reader')}
                    className="text-[#4A1D96] dark:text-purple-400 font-bold hover:underline cursor-pointer"
                  >
                    Switch to Digital Booklet View →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            
            /* TAB 2: INTERACTIVE DIGITAL STUDY GUIDE */
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`w-full max-w-3xl transition-transform duration-150 rounded-3xl p-6 sm:p-10 shadow-lg border relative z-10 ${
                readerTheme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : readerTheme === 'sepia'
                  ? 'bg-[#F6F1E3] border-[#EADFC7] text-[#2F2618]'
                  : 'bg-white border-purple-100 text-slate-800'
              }`}
            >
              {/* Document Header Page */}
              <div className="border-b border-dashed pb-6 mb-6 border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Wits Lingo Spoken English Academy</span>
                  <span>Page {currentPage} of {curriculum.totalPages}</span>
                </div>
                <h1 className="font-['Outfit'] font-black text-xl sm:text-2xl text-slate-900 dark:text-white">
                  {activePage.heading}
                </h1>
                {activePage.subheading && (
                  <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-300 font-medium">
                    {activePage.subheading}
                  </p>
                )}
              </div>

              {/* Document Sections */}
              <div className="space-y-6">
                {activePage.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    
                    {sec.title && (
                      <h4 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4A1D96]"></span>
                        <span>{sec.title}</span>
                      </h4>
                    )}

                    {sec.content && (
                      <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {sec.content}
                      </p>
                    )}

                    {/* Vocabulary Items */}
                    {sec.type === 'vocabulary' && sec.items && (
                      <div className="grid grid-cols-1 gap-2.5">
                        {sec.items.map((item, i) => (
                          <div 
                            key={i} 
                            className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs sm:text-sm text-[#4A1D96] dark:text-purple-300">
                                {item.word}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {item.meaning}
                              </span>
                            </div>
                            <p className="text-xs italic text-slate-700 dark:text-slate-300 border-l-2 border-purple-400 pl-2 mt-1">
                              "{item.sentence}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dialogue Items */}
                    {sec.type === 'dialogue' && sec.items && (
                      <div className="space-y-2">
                        {sec.items.map((dial, i) => (
                          <div 
                            key={i} 
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5"
                          >
                            <span className="px-2 py-0.5 rounded-md bg-[#4A1D96] text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {dial.speaker}
                            </span>
                            <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                              {dial.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rules & Warnings */}
                    {sec.type === 'rule' && (
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 space-y-1 text-xs sm:text-sm">
                        <div className="font-bold">{sec.title || 'Important Spoken Rule'}</div>
                        <p className="leading-relaxed opacity-90">{sec.content}</p>
                      </div>
                    )}

                    {/* Table Data */}
                    {sec.type === 'table' && sec.tableData && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-purple-100/70 dark:bg-purple-950 text-slate-900 dark:text-white font-bold border-b border-purple-200 dark:border-purple-900">
                            <tr>
                              {sec.tableData.headers.map((h, i) => (
                                <th key={i} className="p-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sec.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Document Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span>Author: Ziyaur Rehman Zia • Wits Lingo Academy</span>
                <span>Official Study Material • All Rights Reserved</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Page Navigation (Reader Mode) */}
        {activeTab === 'reader' && curriculum.totalPages > 1 && (
          <footer className="px-6 py-2.5 bg-white dark:bg-slate-900 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs flex-shrink-0">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Page</span>
            </button>

            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Page {currentPage} of {curriculum.totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, curriculum.totalPages))}
              disabled={currentPage === curriculum.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Next Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </footer>
        )}

      </div>
    </div>
  );
};
