import React from 'react';
import { Award, Users, TrendingUp, Laptop, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';

interface StatsSectionProps {
  siteSettings?: SiteSettings;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ siteSettings }) => {
  const stats = [
    {
      metric: siteSettings?.batchesCompletedCount || '15+',
      label: 'Completed Offline & Online Batches',
      subtext: 'Proven batch-based track record',
      icon: Award,
    },
    {
      metric: siteSettings?.activeStudentsCount || '100+',
      label: 'Students Improved Their English',
      subtext: 'From small towns, villages & cities',
      icon: Users,
    },
    {
      metric: 'Beginner → Advanced',
      label: 'Learner Progress',
      subtext: 'Structured step-by-step curriculum',
      icon: TrendingUp,
    },
    {
      metric: 'Offline + Online',
      label: 'Flexible Learning',
      subtext: 'Live digital batches + class recordings',
      icon: Laptop,
    },
  ];

  return (
    <section className="py-16 bg-[#F8F6FC] border-b border-purple-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#581C87]">
            Our Journey & Accomplishments
          </span>
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1E1B26]">
            Real Milestones, Genuine Impact
          </h2>
        </div>

        {/* 4 Clean Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 border border-purple-100/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4A1D96] flex items-center justify-center border border-purple-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-['Outfit'] font-extrabold text-3xl sm:text-4xl text-[#3B0764] tracking-tight block">
                      {stat.metric}
                    </span>
                    <h3 className="font-bold text-sm text-slate-800 mt-1">
                      {stat.label}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{stat.subtext}</span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Short Statement with clean styling */}
        <div className="mt-12 max-w-3xl mx-auto text-center bg-white/80 border border-purple-200/70 rounded-2xl p-6 sm:p-8 shadow-xs">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            “Our journey has already helped learners improve their English from the beginning level towards advanced communication. Now, Wits Lingo is returning with renewed energy, fresh ideas and new opportunities.”
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-[#4A1D96]">
            <span>Wits Lingo Academy</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Dhakka, Amroha, Uttar Pradesh</span>
          </div>
        </div>

      </div>
    </section>
  );
};
