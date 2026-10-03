import React from 'react';
import { TestimonialData } from '../types';
import { Quote, Star, CheckCircle, MapPin, Sparkles } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: TestimonialData[];
  onOpenAdmission: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials, onOpenAdmission }) => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#581C87]">
            Student Stories
          </span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-[#1E1B26]">
            Real Experiences, Real Confidence
          </h2>
          <p className="text-base text-slate-600">
            Hear from students who overcame their fear of English and developed fluent communication through Wits Lingo Academy.
          </p>
        </div>

        {/* Testimonials List */}
        {testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF9FC] rounded-2xl p-7 border border-purple-100/90 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#4A1D96] flex items-center justify-center">
                      <Quote className="w-4 h-4" />
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    “{item.testimonial}”
                  </p>
                </div>

                <div className="pt-5 mt-6 border-t border-slate-200/60 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#4A1D96] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {item.studentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-sm text-[#1E1B26] truncate">
                      {item.studentName}
                    </h4>
                    <p className="text-[11px] text-purple-800 font-semibold truncate">
                      {item.courseBatch}
                    </p>
                    {item.city && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>{item.city}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center p-8 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
            <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">New Testimonials Updating Soon</h3>
            <p className="text-xs text-slate-500">
              Verified reviews from our upcoming batch graduates will appear here shortly.
            </p>
          </div>
        )}

        {/* Community Proof */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Join 100+ motivated learners in our upcoming batches. Limited seats per batch for personal speaking attention.
          </p>
        </div>

      </div>
    </section>
  );
};
