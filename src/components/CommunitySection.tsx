import React from 'react';
import { MessageCircle, Instagram, Facebook, ArrowRight, Sparkles, Bell, CheckCircle2 } from 'lucide-react';

interface CommunitySectionProps {
  onJoinNewJourney: () => void;
  siteSettings?: import('../types').SiteSettings;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ onJoinNewJourney, siteSettings }) => {
  const whatsappUrl = siteSettings?.whatsappChannelUrl || "https://whatsapp.com/channel/0029Vb8dJ6C0rGiTXEMDB93k";
  const instagramUrl = siteSettings?.instagramUrl || "https://www.instagram.com/witslingo?stkn=MWc0OTc5ZHU5OTVrNA==";
  const facebookUrl = siteSettings?.facebookUrl || "https://www.facebook.com/share/1BP5jTfk9B/";
  return (
    <section id="community" className="py-20 bg-gradient-to-b from-[#FAF8FD] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-[#3B0764] via-[#4A1D96] to-[#2E1065] rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-xl shadow-purple-950/15 relative overflow-hidden">
          
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-purple-300" />
              <span>Official Community</span>
            </div>

            <h2 className="font-['Outfit'] text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Learn English Every Day
            </h2>

            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed max-w-2xl mx-auto">
              Join the Wits Lingo community and receive useful English words, sentences, learning tips and updates to keep your learning journey active.
            </p>

            {/* 3 Prominent Community Social Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              
              {/* WhatsApp Channel */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join WhatsApp Channel</span>
              </a>

              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow on Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
                <span>Follow on Facebook</span>
              </a>

            </div>

            {/* Primary Community CTA */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onJoinNewJourney}
                id="community-join-journey-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-purple-50 text-[#3B0764] text-sm font-extrabold shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Join the New Journey</span>
                <ArrowRight className="w-4 h-4 text-[#3B0764]" />
              </button>

              <span className="text-xs text-purple-200/80 font-medium">
                Admissions open for Batch October & November 2026
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
