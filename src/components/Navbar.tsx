import React, { useState } from 'react';
import { Logo } from './Logo';
import { User, SiteSettings } from '../types';
import { useScrollLock } from '../hooks/useScrollLock';
import { Menu, X, BookOpen, ChevronRight, FileText, Download } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  siteSettings?: SiteSettings;
  onOpenAdmission: (courseId?: string, batchId?: string) => void;
  onOpenAuth: (role?: 'student' | 'admin') => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  onOpenSystemReport?: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  siteSettings,
  onOpenAdmission,
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  onLogout,
  onOpenSystemReport,
  activeSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useScrollLock(mobileMenuOpen);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Courses', href: '#courses' },
    ...(siteSettings?.showBatchesSection !== false ? [{ label: 'Batches', href: '#batches' }] : []),
    { label: 'About', href: '#about' },
    { label: 'Learning Resources', href: '#learning-resources' },
    { label: 'Community', href: '#community' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100/80 shadow-xs transition-all">
      {/* Top micro-announcement banner */}
      {(siteSettings?.showAnnouncement ?? true) && (
        <div className="bg-gradient-to-r from-[#2E1065] via-[#4A1D96] to-[#3B0764] text-white text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex items-center justify-between gap-2 transition-all w-full overflow-hidden">
          <div className="flex items-center gap-2 mx-auto">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="truncate max-w-[70vw] sm:max-w-none text-[11px] sm:text-xs">
              {siteSettings?.announcementText || 'New Batch Starts from 1st of each month • Admissions Open for October & November 2026'}
            </span>
          </div>
          {onOpenSystemReport && (
            <button
              onClick={onOpenSystemReport}
              className="hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold border border-white/20 transition-all cursor-pointer flex-shrink-0"
              title="Download Full Website Report & Documentation (PDF)"
            >
              <FileText className="w-3 h-3 text-purple-200" />
              <span>Report PDF</span>
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <a href="#home" className="min-w-0 cursor-pointer py-1 flex items-center pr-1 sm:pr-0">
            {/* Desktop & Tablet: Full logo with tagline */}
            <div className="hidden sm:block">
              <Logo size="md" showTagline={true} />
            </div>
            {/* Mobile: Clean, compact logo with tagline */}
            <div className="sm:hidden">
              <Logo size="sm" showTagline={true} />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-semibold text-slate-700 hover:text-[#4A1D96] transition-colors relative py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {onOpenSystemReport && (
              <button
                onClick={onOpenSystemReport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#4A1D96] border border-slate-200 hover:border-purple-200 transition-all cursor-pointer"
                title="Download full report of the website as PDF"
              >
                <FileText className="w-3.5 h-3.5 text-purple-700" />
                <span>Website Report (PDF)</span>
              </button>
            )}

            {currentUser && currentUser.role !== 'admin' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenDashboard}
                  id="nav-student-dashboard-btn"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-50 text-[#4A1D96] hover:bg-purple-100 border border-purple-200 transition-all shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  My Batch Dashboard
                </button>
              </div>
            )}

            {/* Primary CTA */}
            <button
              onClick={() => onOpenAdmission()}
              id="nav-register-cta-btn"
              className="px-5 py-2.5 rounded-full bg-[#4A1D96] hover:bg-[#3B0764] text-white text-xs font-bold tracking-wide shadow-md shadow-purple-900/15 hover:shadow-purple-900/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Register Now
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {onOpenSystemReport && (
              <button
                onClick={onOpenSystemReport}
                className="p-1.5 text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-medium flex items-center gap-1 border border-purple-200"
                title="Download PDF Report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Report</span>
              </button>
            )}
            <button
              onClick={() => onOpenAdmission()}
              className="sm:hidden px-3 py-1.5 rounded-full bg-[#4A1D96] text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              Register
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-slate-700 hover:text-[#4A1D96] hover:bg-purple-50 rounded-lg active:scale-95 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-purple-100 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain smooth-scroll-viewport">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-purple-50 hover:text-[#4A1D96]"
              >
                {link.label}
              </a>
            ))}
            {onOpenSystemReport && (
              <button
                onClick={() => {
                  onOpenSystemReport();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-semibold text-purple-900 bg-purple-50/70 hover:bg-purple-100 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-700" />
                  Website Report & Architecture (PDF)
                </span>
                <Download className="w-4 h-4 text-purple-700" />
              </button>
            )}
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => {
                onOpenAdmission();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-[#4A1D96] text-white text-sm font-bold shadow-md shadow-purple-900/20 flex items-center justify-center gap-2"
            >
              Register Now — Admission Form
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
