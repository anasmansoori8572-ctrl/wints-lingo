import React from 'react';
import { ArrowRight, CheckCircle, BookOpen, Brain, Sparkles, Smile, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const learningSteps = [
    {
      step: '01',
      title: 'Learn',
      desc: 'Acquire real-life words and useful expressions in meaningful contexts.',
      icon: BookOpen,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      step: '02',
      title: 'Understand',
      desc: 'Grasp the underlying concept and natural structure without robotic memorisation.',
      icon: Brain,
      color: 'bg-indigo-100 text-indigo-800',
    },
    {
      step: '03',
      title: 'Practise',
      desc: 'Participate in guided drills, audio roleplays, and interactive conversational scenarios.',
      icon: Compass,
      color: 'bg-violet-100 text-violet-800',
    },
    {
      step: '04',
      title: 'Speak',
      desc: 'Shed hesitation and articulate thoughts out loud in batch sessions.',
      icon: Smile,
      color: 'bg-emerald-100 text-emerald-800',
    },
    {
      step: '05',
      title: 'Grow',
      desc: 'Transform into a spontaneous, self-assured, and confident English communicator.',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-900',
    },
  ];

  return (
    <section id="about" className="py-20 bg-white border-b border-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-xs font-bold text-[#4A1D96] uppercase tracking-wider">
            About Wits Lingo
          </div>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-[#1E1B26] tracking-tight">
            Language Education Made Practical, Accessible and Engaging
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Wits Lingo is a language-learning platform created to make language education practical, accessible and engaging. We believe that learning a language is not simply about memorising grammar rules or vocabulary. It is about understanding, practising, communicating and developing the confidence to use the language in real life.
          </p>
        </div>

        {/* 5-Step Emphasized Flow: Learn → Understand → Practise → Speak → Grow */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#581C87]">
              Our Core Learning Framework
            </span>
            <div className="flex items-center justify-center gap-2 mt-2 font-['Outfit'] text-lg sm:text-2xl font-bold text-slate-900 flex-wrap">
              <span className="text-[#4A1D96]">Learn</span>
              <span className="text-purple-300">→</span>
              <span className="text-[#581C87]">Understand</span>
              <span className="text-purple-300">→</span>
              <span className="text-[#6D28D9]">Practise</span>
              <span className="text-purple-300">→</span>
              <span className="text-emerald-700">Speak</span>
              <span className="text-purple-300">→</span>
              <span className="text-[#3B0764]">Grow</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {learningSteps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-slate-50/70 hover:bg-purple-50/50 border border-slate-200/70 hover:border-purple-200 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-widest text-purple-400 font-mono">
                        {item.step}
                      </span>
                      <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-['Outfit'] text-lg font-bold text-[#1E1B26] group-hover:text-[#4A1D96] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-200/50 flex items-center text-[11px] font-semibold text-[#4A1D96] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore Step</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
