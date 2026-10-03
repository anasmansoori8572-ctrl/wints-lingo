import React, { useState } from 'react';
import { Sparkles, ArrowRight, Calendar, ShieldCheck, Megaphone, Clock, AlertTriangle, Pin, ChevronRight, Bell, Tag } from 'lucide-react';
import { SiteSettings, Announcement } from '../types';
import { AnnouncementModal } from './AnnouncementModal';

interface HeroProps {
  onOpenAdmission: (courseId?: string, batchId?: string) => void;
  onExploreCourses: () => void;
  onWatchVideo?: () => void;
  siteSettings?: SiteSettings;
  announcements?: Announcement[];
  onOpenAnnouncementModal?: (announcement: Announcement) => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onOpenAdmission, 
  onExploreCourses, 
  onWatchVideo, 
  siteSettings,
  announcements = [],
  onOpenAnnouncementModal
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'Holiday' | 'Class Notice' | 'Urgent'>('all');
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  const showAnnouncement = siteSettings?.showAnnouncement ?? true;
  const announcementText = siteSettings?.announcementText || 'New Batch Starts from 1st of each month';

  // Filter announcements
  const filteredAnnouncements = announcements.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Holiday') return a.category === 'Holiday';
    if (activeFilter === 'Class Notice') return a.category === 'Class Notice' || a.category === 'Schedule Change';
    if (activeFilter === 'Urgent') return a.priority === 'Urgent' || a.priority === 'Important';
    return true;
  });

  const handleNoticeClick = (ann: Announcement) => {
    setSelectedNotice(ann);
    if (onOpenAnnouncementModal) {
      onOpenAnnouncementModal(ann);
    }
  };

  const latestHolidayNotice = announcements.find(a => a.category === 'Holiday');

  const getCategoryTheme = (cat?: string) => {
    switch (cat) {
      case 'Holiday':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          label: '🏖️ Holiday Notice'
        };
      case 'Class Notice':
        return {
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          label: '📢 Class Notice'
        };
      case 'Schedule Change':
        return {
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
          label: '🕒 Timing Update'
        };
      case 'Urgent Alert':
        return {
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
          label: '🚨 Urgent Notice'
        };
      default:
        return {
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
          label: '📌 Academy Notice'
        };
    }
  };

  return (
    <section id="home" className="relative overflow-hidden w-full pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-[#FAF8FD] via-white to-[#F6F3FA]">
      {/* Subtle geometric background accents */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headings & Call to Action */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left min-w-0">
            {/* Brand Kicker & Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50/90 border border-purple-200/80 text-xs shadow-2xs">
              <span className="font-extrabold tracking-tight font-['Outfit'] text-[#4A1D96] uppercase">
                {siteSettings?.academyName || 'WITS LINGO'}
              </span>
              <span className="text-purple-300">•</span>
              <span className="font-semibold text-slate-600 text-[11px] sm:text-xs tracking-tight">
                {siteSettings?.tagline || 'A Global Language Platform'}
              </span>
            </div>

            {/* Pill announcement */}
            {showAnnouncement && (
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-purple-100/90 border border-purple-200/90 text-[#4A1D96] text-[11px] sm:text-xs font-semibold shadow-xs max-w-full">
                <span className="flex h-2 w-2 rounded-full bg-[#6D28D9] animate-ping flex-shrink-0" />
                <span className="break-words leading-tight">{announcementText}</span>
              </div>
            )}

            {/* Main Headings */}
            <div className="space-y-2">
              <h1 className="font-['Outfit'] font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1E1B26] tracking-tight leading-[1.18] sm:leading-tight break-words">
                Learn Easily.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A1D96] via-[#6B21A8] to-[#9333EA]">
                  Speak Naturally.
                </span>{' '}
                <br className="hidden sm:inline" />
                Think Clearly.
              </h1>
              <p className="text-sm sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed pt-1 sm:pt-2">
                A supportive, practical spoken English and communication academy founded by{' '}
                <strong className="text-slate-900 font-semibold">{siteSettings?.founderName || 'Ziyaur Rehman Zia'}</strong>. We guide you from zero hesitation to effortless natural fluency without translation.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-purple-50 text-[#4A1D96] text-[11px] sm:text-xs font-semibold border border-purple-100">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Step-by-Step Practical Learning</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] sm:text-xs font-semibold">
                Daily Conversation & Drills
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-semibold border border-emerald-100">
                100% Hesitation Removal
              </span>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
              <button
                onClick={() => onOpenAdmission()}
                id="hero-enroll-cta-btn"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#4A1D96] hover:bg-[#3B0764] text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-900/20 hover:shadow-purple-900/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enroll in Next Batch</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </button>

              <button
                onClick={onExploreCourses}
                id="hero-explore-courses-btn"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span>Explore All Courses</span>
              </button>
            </div>

            {/* Payment & Admission Assurance */}
            <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Instant Admission Confirmation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Official Notices Updated Live</span>
              </div>
            </div>

            {/* Trust Proof Micro-Bar */}
            <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-purple-700 text-white text-xs font-bold flex items-center justify-center">
                  MF
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  SP
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-purple-900 text-white text-xs font-bold flex items-center justify-center">
                  AS
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
                  MD
                </div>
              </div>
              <div className="text-xs text-slate-600 flex-1 min-w-[200px]">
                <span className="font-bold text-slate-900">{siteSettings?.activeStudentsCount || '100+'} Students</span> across towns & cities enrolled in live batches
              </div>
            </div>
          </div>

          {/* Right Column: LIVE ANNOUNCEMENTS & NOTICE BOARD (Replaced Practical Phrases Card) */}
          <div className="lg:col-span-5 relative w-full min-w-0">
            {/* Notice Board Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-purple-950/5 border border-purple-100 p-4 sm:p-6 relative z-10 space-y-4">
              
              {/* Notice Board Header with Live Pulse */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4A1D96] flex items-center justify-center shadow-2xs flex-shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-['Outfit'] uppercase tracking-wide truncate">
                        Notice & Announcement Board
                      </h3>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" title="Live Board" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                      Official holidays, batch class timings & updates
                    </p>
                  </div>
                </div>

                <span className="text-[10px] sm:text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100 flex-shrink-0">
                  {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'Notice' : 'Notices'}
                </span>
              </div>

              {/* Notice Filter Tabs */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] sm:text-[11px] font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeFilter === 'all'
                      ? 'bg-white text-[#4A1D96] font-bold shadow-2xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('Holiday')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeFilter === 'Holiday'
                      ? 'bg-white text-amber-900 font-bold shadow-2xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  🏖️ Holidays
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('Class Notice')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeFilter === 'Class Notice'
                      ? 'bg-white text-indigo-900 font-bold shadow-2xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  📢 Classes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('Urgent')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                    activeFilter === 'Urgent'
                      ? 'bg-white text-rose-900 font-bold shadow-2xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  🚨 Urgent
                </button>
              </div>

              {/* Announcements Feed (Optimized, scrollable list with click-to-popup) */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredAnnouncements.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No notices in this category</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Switch to "All" to view general academy updates.</p>
                  </div>
                ) : (
                  filteredAnnouncements.map((ann) => {
                    const theme = getCategoryTheme(ann.category);
                    return (
                      <div
                        key={ann.id}
                        onClick={() => handleNoticeClick(ann)}
                        className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-purple-50/40 border border-slate-200/90 hover:border-purple-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs group relative text-left"
                      >
                        {/* Notice Tag Row */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${theme.badgeBg}`}>
                              {theme.label}
                            </span>
                            {ann.isPinned && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5 text-amber-700" />
                                Pinned
                              </span>
                            )}
                            {ann.priority === 'Urgent' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                Urgent
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {ann.date}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#4A1D96] transition-colors leading-snug font-['Outfit']">
                          {ann.title}
                        </h4>

                        {/* Short Excerpt */}
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {ann.message}
                        </p>

                        {/* Card Footer: Target Batch & Popup Trigger Link */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100/90 text-[11px] gap-2">
                          <span className="text-slate-500 font-medium truncate max-w-[140px] sm:max-w-[200px] flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{ann.batchName}</span>
                          </span>
                          <span className="text-[#4A1D96] font-bold flex items-center gap-1 group-hover:underline flex-shrink-0">
                            Read Circular <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick-Action Notice Banner */}
              <div className="p-3 bg-gradient-to-r from-purple-900 to-[#3B0764] rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0">
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    Verified Academy Circulars
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-purple-200">
                    Click any notice above for full official circular popup
                  </p>
                </div>
                {announcements.length > 0 && (
                  <button
                    onClick={() => handleNoticeClick(announcements[0])}
                    className="w-full sm:w-auto px-3 py-1.5 bg-white text-[#4A1D96] text-xs font-bold rounded-xl hover:bg-purple-50 transition-colors shadow-2xs cursor-pointer text-center"
                  >
                    View Latest
                  </button>
                )}
              </div>

            </div>

            {/* Floating Upcoming Holiday Badge */}
            {latestHolidayNotice && (
              <div 
                onClick={() => handleNoticeClick(latestHolidayNotice)}
                className="absolute -bottom-5 -left-4 bg-white rounded-2xl shadow-lg border border-amber-200 p-3 hidden sm:flex items-center gap-3 z-20 cursor-pointer hover:shadow-xl hover:scale-102 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  🏖️
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>Upcoming Holiday</span>
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                      {latestHolidayNotice.effectiveDate || latestHolidayNotice.date}
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[190px]">
                    {latestHolidayNotice.title} • Tap to view
                  </p>
                </div>
              </div>
            )}

            {/* Floating Live Dispatch Badge */}
            <div className="absolute -top-4 -right-3 bg-white rounded-xl shadow-lg border border-purple-100 px-3.5 py-2 hidden sm:flex items-center gap-2 z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-purple-950">
                Real-Time Updates by Director
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* Announcement Detail Circular Popup */}
      <AnnouncementModal
        isOpen={Boolean(selectedNotice)}
        announcement={selectedNotice}
        onClose={() => setSelectedNotice(null)}
        siteSettings={siteSettings}
      />
    </section>
  );
};
