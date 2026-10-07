import React from 'react';
import { ArrowRight, ShieldCheck, Wrench, Package, Truck, Compass, CheckCircle2, ChevronRight } from 'lucide-react';
import { PageId } from '../components/Header.tsx';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* HERO SECTION */}
      <section className="relative w-full min-h-[580px] lg:min-h-[680px] flex items-center justify-center overflow-hidden bg-[#050B14]">
        {/* Background Image with Dark Navy/Black Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_outboard_boat_1791036528701.jpg"
            alt="High-performance outboard motors mounted on boat transom"
            className="w-full h-full object-cover object-center transform scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Measured multi-stop gradient scrim to ensure high contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/85 to-[#050B14]/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050B14] via-[#050B14]/75 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0088FF]/15 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Hero Content Box */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="max-w-2xl text-left">
            {/* Small blue uppercase label */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#0088FF] animate-pulse"></span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#0088FF] font-['Cabinet_Grotesk']">
                MARINE POWER SPECIALISTS
              </span>
            </div>

            {/* Large headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6 font-['Cabinet_Grotesk']">
              POWER YOUR{' '}
              <span className="text-[#0099FF] bg-gradient-to-r from-[#0099FF] via-[#38BDF8] to-[#00D2FF] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(0,153,255,0.4)]">
                NEXT ADVENTURE.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-xl">
              New and used outboard motors for boat owners, anglers, and commercial operators.
              Sales, service, parts and delivery — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="px-7 py-3.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-[#0088FF]/30 hover:shadow-xl hover:shadow-[#0088FF]/40 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span>SHOP OUTBOARDS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('order')}
                className="px-7 py-3.5 rounded-lg bg-[#0B1826]/80 hover:bg-[#102135] active:scale-[0.98] text-slate-200 hover:text-white font-bold text-sm sm:text-base tracking-wide border border-white/15 hover:border-[#0088FF]/60 transition-all flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-sm"
              >
                <span>REQUEST A MOTOR</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE POINTS BAR */}
      <section className="w-full bg-[#081320] border-y border-white/[0.08] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#0088FF]/10 border border-[#0088FF]/25 flex items-center justify-center text-[#0088FF] group-hover:bg-[#0088FF]/20 transition-colors shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white font-['Cabinet_Grotesk']">
                  NEW &amp; USED MOTORS
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Top-tier brands &amp; sizes</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#0088FF]/10 border border-[#0088FF]/25 flex items-center justify-center text-[#0088FF] group-hover:bg-[#0088FF]/20 transition-colors shrink-0">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white font-['Cabinet_Grotesk']">
                  SALES &amp; SERVICE
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Factory-trained marine care</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#0088FF]/10 border border-[#0088FF]/25 flex items-center justify-center text-[#0088FF] group-hover:bg-[#0088FF]/20 transition-colors shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white font-['Cabinet_Grotesk']">
                  PARTS &amp; ACCESSORIES
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Controls, rigging &amp; props</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#0088FF]/10 border border-[#0088FF]/25 flex items-center justify-center text-[#0088FF] group-hover:bg-[#0088FF]/20 transition-colors shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white font-['Cabinet_Grotesk']">
                  DELIVERY AVAILABLE
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct to dock or freight</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AUTHORIZED BRANDS STRIP */}
      <DealerBrandsBar />

      {/* QUICK OVERVIEW / HIGHLIGHT SECTION */}
      <section className="py-20 bg-[#050B14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Side */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0088FF] mb-2 block font-['Cabinet_Grotesk']">
                THE BLUEWAVE COMMITMENT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug mb-6 font-['Cabinet_Grotesk']">
                Precision Outboard Power,{' '}
                <span className="text-[#0099FF]">Backed by Marine Experts.</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Whether you need a lightweight portable 4-stroke for your tender, a rugged inline engine for your bay boat, or high-output multi-engine power for offshore tournaments, BlueWave Outboard Motors delivers genuine reliability, honest consultations, and seamless procurement.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0088FF] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">Verified factory warranties &amp; pre-inspection</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0088FF] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">Turnkey rigging &amp; digital gauge packages</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0088FF] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">Propeller matching &amp; pitch optimization</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#0088FF] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200">Door-to-dock insured transport options</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-6 py-3 rounded-lg bg-[#0B1826] hover:bg-[#102135] text-white text-sm font-bold border border-white/10 hover:border-[#0088FF]/50 transition-colors flex items-center gap-2"
                >
                  Learn About BlueWave
                  <ArrowRight className="w-4 h-4 text-[#0088FF]" />
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className="px-6 py-3 rounded-lg text-slate-300 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  View All Services
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0B1826] group">
                <img
                  src="/src/assets/images/about_outboard_motor_1791036540139.jpg"
                  alt="High output outboard motor on showroom stand"
                  className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#0088FF]">
                      IN-DEMAND REPOWER
                    </span>
                    <span className="text-xs text-slate-400 font-mono">115 – 300+ HP</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-['Cabinet_Grotesk']">
                    Looking to repower your current hull?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Share your current boat transom height, steering setup, and performance goals. We match you with the optimal motor class.
                  </p>
                  <button
                    onClick={() => onNavigate('order')}
                    className="w-full py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-[#0088FF]/20"
                  >
                    Request Repower Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
