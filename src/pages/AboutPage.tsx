import React from 'react';
import { Check, ArrowRight, Shield, Award, Users, Anchor } from 'lucide-react';
import { PageId } from '../components/Header.tsx';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';
import { useStore, DEFAULT_PAGE_CONTENT } from '../context/StoreContext.tsx';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { pagesContent } = useStore();
  const aboutData = pagesContent?.about || DEFAULT_PAGE_CONTENT.about;

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: Text and features */}
          <div className="lg:col-span-6 flex flex-col items-start">
            {/* Small blue label */}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#0088FF] mb-3 block font-['Cabinet_Grotesk']">
              {aboutData.badge || 'ABOUT BLUEWAVE'}
            </span>

            {/* Large heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-6 font-['Cabinet_Grotesk']">
              {aboutData.title || 'Built around'}{' '}
              <span className="text-[#0099FF] bg-gradient-to-r from-[#0099FF] to-[#38BDF8] bg-clip-text text-transparent">
                {aboutData.titleHighlight || 'life on the water.'}
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8">
              {aboutData.subtitle || 'BlueWave Outboard Motors is a marine-focused business designed to make finding the right outboard motor simple and straightforward.'}
            </p>

            {/* Bullet-style feature list */}
            <div className="w-full space-y-3.5 mb-9">
              {(aboutData.bullets || []).map((bullet: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-lg bg-[#0B1826]/70 border border-white/[0.06] hover:border-[#0088FF]/30 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-[#0088FF]/20 flex items-center justify-center text-[#0088FF] shrink-0">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-sm sm:text-base text-slate-200 font-medium">
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            {/* Blue CTA button: Talk to BlueWave */}
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-3.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-[#0088FF]/25 hover:shadow-xl hover:shadow-[#0088FF]/35 flex items-center gap-2.5 cursor-pointer"
            >
              <span>{aboutData.ctaText || 'Talk to BlueWave'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* RIGHT: Large outboard motor photograph */}
          <div className="lg:col-span-6 mt-6 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1826] group">
              <div className="aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                <img
                  src={aboutData.image || '/src/assets/images/about_outboard_motor_1791036540139.jpg'}
                  alt="High-grade outboard motor on service stand"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/about_outboard_motor_1791036540139.jpg';
                  }}
                />
              </div>

              {/* Quiet overlay badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#07111D]/90 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm font-['Cabinet_Grotesk']">
                    {aboutData.badgeOverlayTitle || 'Dealership Verified Quality'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {aboutData.badgeOverlayDesc || 'Inspected, compression-tested, and ready for water.'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#0088FF] bg-[#0088FF]/15 px-2.5 py-1 rounded-md">
                  {aboutData.badgeOverlayTag || 'BLUEWAVE SPEC'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Extended Dealership Values */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-['Cabinet_Grotesk']">
              Why Boaters Trust BlueWave
            </h2>
            <p className="text-sm text-slate-400">
              We eliminate the stress of buying outboard motors by providing transparent specifications, dependable delivery, and ongoing technical guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#0B1826] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 flex items-center justify-center text-[#0088FF] mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-['Cabinet_Grotesk']">Honest Consultation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We assess your boat hull weight, transom draft, usage style, and fuel economy goals to recommend the exact right motor—never upselling unnecessary horsepower.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0B1826] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 flex items-center justify-center text-[#0088FF] mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-['Cabinet_Grotesk']">Rigorous Standards</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every pre-owned motor undergoes multipoint compression checks, gearcase fluid analysis, lower unit seal inspections, and computer diagnostic log reviews.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0B1826] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 flex items-center justify-center text-[#0088FF] mb-4">
                <Anchor className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-['Cabinet_Grotesk']">Complete Rigging Support</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                From hydraulic steering conversions and electronic binnacle controls to harness adapters and stainless props, we ensure a seamless install on your boat.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Brands Bar */}
      <div className="mt-16">
        <DealerBrandsBar />
      </div>
    </div>
  );
};
