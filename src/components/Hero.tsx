import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
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
  siteSettings,
  announcements = [],
  onOpenAnnouncementModal
}) => {
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  const showAnnouncement = siteSettings?.showAnnouncement ?? true;
  const announcementText = siteSettings?.announcementText || 'New Batch Starts from 1st of each month';

  const handleNoticeClick = (ann: Announcement) => {
    setSelectedNotice(ann);
    if (onOpenAnnouncementModal) {
      onOpenAnnouncementModal(ann);
    }
  };

  return (
    <section 
      id="home" 
      className="relative w-full flex items-center overflow-hidden bg-[#120624] text-white"
      style={{
        height: 'calc(100svh - var(--header-height, 6.5rem))',
        minHeight: 'calc(100svh - var(--header-height, 6.5rem))'
      }}
    >
      {/* 1. Full-Bleed Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          key={siteSettings?.heroVideoUrl || '/video/wits-lingo-intro.mp4'}
          className="w-full h-full object-cover object-center pointer-events-none select-none"
          src={siteSettings?.heroVideoUrl || '/video/wits-lingo-intro.mp4'}
          poster={siteSettings?.heroVideoPosterUrl || '/video/wits-lingo-poster.jpg'}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* 2. Full-Screen Uniform Dark Purple/Blue Cinematic Overlay */}
      <div 
        className="absolute inset-0 z-10 w-full h-full pointer-events-none"
        style={{
          backgroundColor: 'rgba(26, 10, 52, 0.45)'
        }}
        aria-hidden="true"
      />

      {/* 3. Hero Content: Positioned Slightly Left of Center */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Focused Text & Action Cluster (Occupies left ~45% on desktop) */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-5 sm:space-y-6 text-left max-w-xl">
            
            {/* Brand Kicker & Dynamic Live Notice Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2E1065]/75 backdrop-blur-md border border-purple-400/30 text-xs shadow-md">
                <span className="font-extrabold tracking-tight font-['Outfit'] text-purple-300 uppercase">
                  {siteSettings?.academyName || 'WITS LINGO'}
                </span>
                <span className="text-purple-300/40">•</span>
                <span className="font-semibold text-purple-100 text-[11px] sm:text-xs tracking-tight">
                  {siteSettings?.tagline || 'A Global Language Platform'}
                </span>
              </div>

              {showAnnouncement && (
                <div 
                  onClick={() => announcements[0] && handleNoticeClick(announcements[0])}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B0764]/70 hover:bg-[#3B0764]/90 backdrop-blur-md border border-purple-400/30 text-purple-200 text-[11px] sm:text-xs font-semibold shadow-md max-w-full transition-colors cursor-pointer"
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{announcementText}</span>
                </div>
              )}
            </div>

            {/* Primary Heading with Maximum Contrast */}
            <div className="space-y-3">
              <h1 className="font-['Outfit'] font-black text-3.5xl sm:text-5xl lg:text-[3.65rem] text-white tracking-tight leading-[1.12] drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
                Speak with Confidence.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-100">
                  Learn Without Limits.
                </span>
              </h1>
              
              {/* Supporting Description */}
              <p className="text-base sm:text-lg text-purple-100 font-normal leading-relaxed max-w-lg drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                Practical English learning designed to help you communicate naturally, confidently, and clearly.
              </p>
            </div>

            {/* Value Highlights */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E1065]/60 backdrop-blur-md text-purple-200 text-xs font-semibold border border-purple-400/25 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-purple-300" />
                <span>Step-by-Step Practical Learning</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E1065]/60 backdrop-blur-md text-slate-100 text-xs font-semibold border border-purple-400/25 shadow-2xs">
                Daily Conversation & Drills
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 backdrop-blur-md text-emerald-300 text-xs font-semibold border border-emerald-400/30 shadow-2xs">
                100% Hesitation Removal
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 w-full">
              <button
                type="button"
                onClick={() => onOpenAdmission()}
                id="hero-enroll-cta-btn"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#6D28D9] to-[#4A1D96] hover:from-[#6D28D9] hover:to-[#3B0764] text-white font-bold text-sm tracking-wide shadow-xl shadow-purple-950/60 hover:shadow-purple-900/80 transition-all active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer border border-purple-400/40"
              >
                <span>Enroll in Next Batch</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </button>

              <button
                type="button"
                onClick={onExploreCourses}
                id="hero-explore-courses-btn"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/30 hover:border-white/50 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.99]"
              >
                <span>Explore All Courses</span>
              </button>
            </div>

            {/* Admission & Live Sync Assurance */}
            <div className="pt-1 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-purple-200/80 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant Admission Confirmation</span>
              </div>
              <div className="text-xs text-purple-200/80">
                <strong className="text-white font-semibold">{siteSettings?.activeStudentsCount || '100+'} Students</strong> enrolled across live batches
              </div>
            </div>

          </div>

          {/* Right Column: Kept completely open for clear view of video subjects */}
          <div className="lg:col-span-5 xl:col-span-6 hidden lg:block pointer-events-none" />

        </div>

      </div>

      {/* 4. Minimal Scroll Indicator */}
      <div 
        onClick={onExploreCourses}
        className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-purple-200/75 hover:text-white transition-colors cursor-pointer text-xs font-semibold select-none group"
      >
        <span className="text-[10px] sm:text-[11px] tracking-wider uppercase opacity-80 group-hover:opacity-100">
          Scroll to explore
        </span>
        <ChevronDown className="w-4 h-4 animate-bounce text-purple-300" />
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


