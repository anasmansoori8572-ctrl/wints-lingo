import React, { useRef, useEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SiteSettings, Announcement } from '../types';

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
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8;
    }
  }, [siteSettings?.heroVideoUrl]);

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
          ref={videoRef}
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
          onLoadedMetadata={(e) => {
            e.currentTarget.playbackRate = 0.8;
          }}
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
          
          {/* Left Column: Focused Text & Action Cluster */}
          <div className="lg:col-span-8 xl:col-span-7 space-y-6 sm:space-y-7 text-left max-w-2xl">
            
            {/* Brand Context */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2E1065]/70 backdrop-blur-md border border-purple-400/25 text-xs shadow-sm">
              <span className="font-extrabold tracking-wider font-['Outfit'] text-purple-300 uppercase">
                {siteSettings?.academyName || 'WITS LINGO'}
              </span>
              <span className="text-purple-300/40">•</span>
              <span className="font-semibold text-purple-100 text-[11px] sm:text-xs">
                {siteSettings?.tagline || 'A Global Language Platform'}
              </span>
            </div>

            {/* Main Large Hero Headline */}
            <div>
              <h1 className="font-['Outfit'] font-black text-3.5xl sm:text-5xl lg:text-[3.85rem] text-white tracking-tight leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                Speak with Confidence.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-100">
                  Learn Without Limits.
                </span>
              </h1>
            </div>

            {/* The Two Existing Action Buttons */}
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
    </section>
  );
};


