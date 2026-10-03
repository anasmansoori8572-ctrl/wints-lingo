import React from 'react';
import { MessageSquare, BookOpen, MessagesSquare, PenTool, Headphones, Target } from 'lucide-react';

interface WhatWeTeachProps {
  onSelectSubject?: (subject: string) => void;
  onOpenAdmission?: () => void;
}

export const WhatWeTeach: React.FC<WhatWeTeachProps> = () => {
  const learningPillars = [
    {
      title: 'Spoken English',
      description: 'Develop practical speaking skills for everyday communication.',
      icon: MessageSquare,
      emoji: '🗣️',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      tag: 'Core Focus',
      examples: ['Overcoming Hesitation', 'Fluency Drills', 'Spontaneous Speaking']
    },
    {
      title: 'Vocabulary',
      description: 'Learn useful words and understand how to use them naturally.',
      icon: BookOpen,
      emoji: '📖',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      tag: 'Practical Usage',
      examples: ['High-Frequency Words', 'Everyday Collocations', 'Idiomatic Expressions']
    },
    {
      title: 'Conversation',
      description: 'Practise real-life conversations and everyday situations.',
      icon: MessagesSquare,
      emoji: '💬',
      color: 'bg-violet-100 text-violet-800 border-violet-200',
      tag: 'Interactive',
      examples: ['Small Talk', 'Situational Dialogues', 'Peer Practice']
    },
    {
      title: 'Grammar',
      description: 'Understand grammar through simple, practical examples.',
      icon: PenTool,
      emoji: '✍️',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      tag: 'Rule-Free Context',
      examples: ['Sentence Patterns', 'Tenses in Daily Life', 'Error Elimination']
    },
    {
      title: 'Listening & Pronunciation',
      description: 'Improve understanding, pronunciation and natural speech.',
      icon: Headphones,
      emoji: '🎧',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tag: 'Audio Clarity',
      examples: ['MTI Reduction', 'Phonetics & Intonation', 'Clear Sound Articulation']
    },
    {
      title: 'Communication Skills',
      description: 'Build confidence and express thoughts clearly.',
      icon: Target,
      emoji: '🎯',
      color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      tag: 'Confidence',
      examples: ['Self-Expression', 'Public Speaking', 'Interview Preparedness']
    },
  ];

  return (
    <section id="what-we-teach" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#581C87]">
            Comprehensive Curriculum
          </span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-[#1E1B26]">
            What We Teach
          </h2>
          <p className="text-base text-slate-600">
            A practical, multi-dimensional curriculum focused on real-world English communication rather than passive classroom theory.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPillars.map((pillar) => {
            return (
              <div
                key={pillar.title}
                className="bg-[#FAF9FC] hover:bg-white rounded-2xl p-6 border border-purple-100/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-white border border-purple-100 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                      <span>{pillar.emoji}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#4A1D96] border border-purple-100">
                      {pillar.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Outfit'] text-xl font-bold text-[#1E1B26] group-hover:text-[#4A1D96] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="pt-3 border-t border-slate-200/60 space-y-2">
                    {pillar.examples.map((ex) => (
                      <div key={ex} className="flex items-center text-xs text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#581C87] mr-2 flex-shrink-0" />
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
