import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Sparkles, MessageCircle, Volume2, VolumeX } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

// Gentle, modern messenger chime using Web Audio API
const playSubtleNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master volume - subtle & pleasant (around 9% max gain)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, now);

    // Warm low-pass filter to soften high harmonic harshness
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Tone 1: Warm initial ping (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.85, now + 0.012);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tone 2: Uplifting, resonant second note (A5 - 880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.075);
    gain2.gain.setValueAtTime(0.0001, now + 0.075);
    gain2.gain.exponentialRampToValueAtTime(0.95, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.075);
    osc2.stop(now + 0.42);

    // Auto-close context after sound finishes to free resources
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 500);
  } catch (err) {
    // Browsers that block autoplay or lack Web Audio API fail silently
  }
};

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '8791287575',
  defaultMessage = "Hello! I'm visiting the Wits Lingo website and would like to know more about the English speaking courses and upcoming batches."
}) => {
  // Clean phone number: remove spaces, dashes, plus signs
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const internationalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const [isOpen, setIsOpen] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const handleOpenPopup = () => {
    setIsOpen(true);
    if (soundEnabledRef.current) {
      playSubtleNotificationSound();
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('wits_lingo_sound_enabled', String(nextState));
    } catch {}
    if (nextState) {
      playSubtleNotificationSound();
    }
  };

  // Auto-popup after 3.5 seconds to appeal to new visitors
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasDismissed) {
        setIsOpen(true);
        if (soundEnabledRef.current) {
          playSubtleNotificationSound();
        }
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [hasDismissed]);

  const handleOpenWhatsApp = (text?: string) => {
    const msgToSend = encodeURIComponent(text || customMsg || defaultMessage);
    const url = `https://wa.me/${internationalNumber}?text=${msgToSend}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setHasDismissed(true);
  };

  const quickOptions = [
    { label: '📅 When does the next batch start?', msg: "Hi! When does the next batch start at WITS LINGO?" },
    { label: '💰 Course fees & syllabus details', msg: "Hi! Could you please share the course fees and syllabus details?" },
    { label: '🗣️ How can I join a trial session?', msg: "Hi! I want to join a trial session for spoken English practice." },
  ];

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      
      {/* Animated Chat Popup Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="pointer-events-auto w-[calc(100vw-2.5rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden mb-3.5 flex flex-col origin-bottom-right"
          >
            {/* Header with WhatsApp Dark Green Gradient */}
            <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] px-4 py-3.5 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center p-0.5 shadow-sm">
                    <img
                      src="/logo.svg"
                      alt="Wits Lingo"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Pulsing online status indicator */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm leading-tight font-['Outfit'] tracking-wide">
                      WITS LINGO Support
                    </h3>
                    <span className="bg-white/20 text-[9px] font-bold px-1.5 py-0.5 rounded text-white tracking-wider uppercase">
                      Official
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                    Online • A Global Language Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Subtle Sound Mute/Unmute Control */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                  title={soundEnabled ? "Notification sound enabled (click to mute)" : "Notification sound muted (click to unmute)"}
                  aria-label={soundEnabled ? "Mute notification sound" : "Unmute notification sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-100 hover:text-white transition-colors" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-emerald-200/70 hover:text-white transition-colors" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
                  aria-label="Close chat popup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* WhatsApp Chat Body */}
            <div className="p-4 bg-[#EFEAE2] bg-opacity-70 space-y-3 max-h-[360px] overflow-y-auto">
              {/* Date / Security Notice Pill */}
              <div className="text-center">
                <span className="inline-block px-2.5 py-1 rounded-md bg-white/80 backdrop-blur-xs text-[10px] font-semibold text-slate-500 shadow-xs">
                  Direct WhatsApp Support • +91 8791287575
                </span>
              </div>

              {/* Incoming Message Bubble */}
              <div className="flex items-start gap-2 max-w-[90%]">
                <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-slate-100 text-slate-800 space-y-1.5 text-xs sm:text-[13px] leading-relaxed relative">
                  <p className="font-semibold text-[#075E54] text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    WITS LINGO
                  </p>
                  <p>
                    Hello! 👋 Welcome to WITS LINGO — A Global Language Platform.
                  </p>
                  <p className="text-slate-600">
                    Have any questions about spoken English batches, class timings, or admissions? Click below to chat directly with our mentor on WhatsApp!
                  </p>
                  <span className="block text-[9.5px] text-slate-400 text-right pt-0.5">
                    Just now • ✓✓
                  </span>
                </div>
              </div>

              {/* Quick Inquiry Chips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pl-1">
                  Quick Inquiries:
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOpenWhatsApp(opt.msg)}
                      className="text-left text-xs bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-[#075E54] px-3 py-2 rounded-xl border border-slate-200/90 shadow-2xs transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-medium">{opt.label}</span>
                      <Send className="w-3 h-3 text-slate-400 group-hover:text-[#25D366] transition-colors shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Input / Action Area */}
            <div className="p-3 bg-white border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a question here..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleOpenWhatsApp();
                  }}
                  className="flex-1 bg-slate-100 text-xs text-slate-800 placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp()}
                  className="bg-[#25D366] hover:bg-[#1EBE5D] text-white p-2.5 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Send via WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Direct WhatsApp CTA Button */}
              <button
                type="button"
                onClick={() => handleOpenWhatsApp()}
                className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1EBE5D] hover:to-[#0E7064] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-lg"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Chat on WhatsApp (+91 8791287575)</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Action Button */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        
        {/* Helper Badge / Callout when chat is closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleOpenPopup}
            className="hidden sm:flex items-center gap-2 bg-white text-slate-800 px-3.5 py-2 rounded-full shadow-lg border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors group"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#075E54]">
              Chat with us on WhatsApp
            </span>
          </motion.div>
        )}

        {/* Circular Pulse Button */}
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : handleOpenPopup())}
          className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all duration-300 transform hover:scale-108 active:scale-95 focus:outline-none cursor-pointer group"
          aria-label="Open WhatsApp chat support"
        >
          {/* Subtle radar pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-50 animate-ping pointer-events-none" />

          {/* Unread Message Notification Badge */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
              1
            </span>
          )}

          {/* Icon Switch */}
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform duration-200 rotate-0 group-hover:rotate-90" />
          ) : (
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white transition-transform duration-200 group-hover:scale-110"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </button>
      </div>

    </div>
  );
};
