import React from 'react';
import { Logo } from './Logo';
import { MessageCircle, Instagram, Facebook, Youtube, Mail, Phone, MapPin, ArrowUp, Shield, FileText } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenSystemReport?: () => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenSystemReport, siteSettings }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#191522] text-white pt-16 pb-12 border-t border-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" variant="light" showTagline={true} />
            <p className="text-xs text-purple-200/80 max-w-sm leading-relaxed font-['Outfit'] font-semibold">
              {siteSettings?.tagline || 'A Global Language Platform'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Operating under <strong className="text-white font-medium">{siteSettings?.academyName || 'WITS LINGO'}</strong>. Practical spoken English and communication skills for ambitious learners across India.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={siteSettings?.whatsappChannelUrl || "https://whatsapp.com/channel/0029Vb8dJ6C0rGiTXEMDB93k"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp Channel"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={siteSettings?.instagramUrl || "https://www.instagram.com/witslingo?stkn=MWc0OTc5ZHU5OTVrNA=="}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={siteSettings?.facebookUrl || "https://www.facebook.com/share/1BP5jTfk9B/"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={siteSettings?.youtubeUrl || "https://www.youtube.com/@witslingo"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-300 font-['Outfit']">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#courses" className="hover:text-white transition-colors">Courses</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="#philosophy" className="hover:text-white transition-colors">Learning Philosophy</a>
              </li>
              <li>
                <a href="#learning-resources" className="hover:text-white transition-colors">Learning Resources</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              </li>
              {onOpenSystemReport && (
                <li className="pt-1">
                  <button
                    onClick={onOpenSystemReport}
                    className="text-purple-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Website Report (PDF)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Community & Social */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-300 font-['Outfit']">
              Community
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://whatsapp.com/channel/0029Vb8dJ6C0rGiTXEMDB93k"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Channel
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/witslingo?stkn=MWc0OTc5ZHU5OTVrNA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/share/1BP5jTfk9B/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Institutional Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-purple-300 font-['Outfit']">
              {siteSettings?.academyName || 'Wits Lingo Academy'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>{siteSettings?.address || 'Dhakka, Amroha, Uttar Pradesh, India'}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <a href={`mailto:${siteSettings?.email || 'Witslingo@gmail.com'}`} className="hover:text-white">
                  {siteSettings?.email || 'Witslingo@gmail.com'}
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>
                  {siteSettings?.phone1 || '+91 7310952271'} {siteSettings?.phone2 ? `/ ${siteSettings.phone2}` : '/ 8791287575'}
                </span>
              </p>
            </div>

            {onOpenAdmin && (
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  id="footer-admin-link-btn"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/80 border border-purple-800/60"
                >
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span>Admin Admission & Portal</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar with Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {siteSettings?.academyName || 'WITS LINGO'}. All Rights Reserved.</p>
          
          <div className="flex items-center flex-wrap gap-4 sm:gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms & Conditions</a>
            
            {onOpenSystemReport && (
              <button
                onClick={onOpenSystemReport}
                className="flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors bg-purple-900/40 hover:bg-purple-900/80 px-2.5 py-1 rounded-md border border-purple-800/40 font-medium cursor-pointer"
                title="Download Website Report (PDF)"
              >
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Website Report (PDF)</span>
              </button>
            )}

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                id="footer-admin-btn"
                className="flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors bg-purple-950/60 hover:bg-purple-900/80 px-2.5 py-1 rounded-md border border-purple-800/40 font-medium"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Dashboard</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-purple-300 hover:text-white transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
