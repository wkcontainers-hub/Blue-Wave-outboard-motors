import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showSubtitle?: boolean;
}

/**
 * High-definition vector emblem of the BlueWave Outboard Motors brand mark.
 * Recreates the exact typography, cowl 300 geometry, dynamic wave crescents,
 * chrome metallic gradient, and bright electric blue highlights.
 */
export const BlueWaveEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="BlueWave Outboard Motors Logo"
    >
      <defs>
        {/* Electric Blue Wave Gradients */}
        <linearGradient id="waveArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="50%" stopColor="#0088FF" />
          <stop offset="100%" stopColor="#0044BB" />
        </linearGradient>

        <linearGradient id="waveWaveGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="45%" stopColor="#0088FF" />
          <stop offset="100%" stopColor="#0055D4" />
        </linearGradient>

        {/* Chrome Cowl Gradient */}
        <linearGradient id="cowlGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#3A4656" />
          <stop offset="35%" stopColor="#1C2430" />
          <stop offset="70%" stopColor="#0D131C" />
          <stop offset="100%" stopColor="#05080E" />
        </linearGradient>

        <linearGradient id="cowlHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="25%" stopColor="#A0B4C8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0A121A" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="chromeBevel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="40%" stopColor="#94A3B8" />
          <stop offset="70%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Propeller Metallic Gradient */}
        <linearGradient id="propellerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Outer Glow Circle Arc */}
      <circle
        cx="80"
        cy="75"
        r="68"
        stroke="url(#waveArcGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="360 80"
        transform="rotate(-50 80 75)"
        className="opacity-95"
      />

      {/* Dynamic Background Sea Waves */}
      <path
        d="M18 95 C 40 75, 65 72, 80 88 C 95 72, 120 75, 142 95 C 130 90, 110 84, 98 90 C 85 95, 75 95, 62 90 C 50 84, 30 90, 18 95 Z"
        fill="url(#waveWaveGrad)"
      />
      <path
        d="M25 108 C 45 92, 65 92, 78 102 C 92 92, 115 92, 135 108 C 120 102, 105 98, 92 104 C 80 109, 70 109, 58 104 C 45 98, 32 102, 25 108 Z"
        fill="url(#waveArcGrad)"
        opacity="0.85"
      />

      {/* Outboard Motor Silhouette & Engine Cowl */}
      <g id="outboard-motor" transform="translate(42, 16)">
        {/* Cowl Top Dome */}
        <path
          d="M 12 28 C 12 10, 24 2, 38 2 C 52 2, 64 10, 64 28 C 64 36, 61 46, 58 48 C 52 50, 24 50, 18 48 C 15 46, 12 36, 12 28 Z"
          fill="url(#cowlGrad)"
          stroke="#4B6079"
          strokeWidth="1.5"
        />

        {/* Cowl Chrome Accent Stripe */}
        <path
          d="M 14 30 Q 38 34 62 30"
          stroke="url(#chromeBevel)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* "300" Badge on Top Cowl */}
        <rect x="42" y="10" width="18" height="11" rx="2" fill="#0A1018" stroke="#38BDF8" strokeWidth="0.8" />
        <text
          x="51"
          y="18.5"
          fill="#FFFFFF"
          fontSize="7.5"
          fontFamily="'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          300
        </text>

        {/* Cowl Surface Specular Highlight */}
        <path
          d="M 18 10 C 24 5, 34 4, 38 4 C 41 4, 43 5, 45 7 C 32 8, 22 16, 20 28 L 16 28 C 16 20, 16 14, 18 10 Z"
          fill="url(#cowlHighlight)"
        />

        {/* Steering / Swivel Bracket & Mount */}
        <rect x="6" y="38" width="10" height="18" rx="2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <rect x="3" y="44" width="7" height="6" rx="1" fill="#334155" />

        {/* Midsection Housing */}
        <path
          d="M 24 49 L 52 49 L 48 78 L 28 78 Z"
          fill="#0F172A"
          stroke="#334155"
          strokeWidth="1.2"
        />
        {/* Exhaust / Trim Details */}
        <line x1="30" y1="56" x2="30" y2="72" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="56" x2="46" y2="72" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Lower Unit / Gearcase & Torpedo */}
        <path
          d="M 28 78 L 48 78 L 56 94 C 52 98, 40 100, 32 98 L 28 78 Z"
          fill="#0B1320"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Anti-Cavitation Plate */}
        <path
          d="M 22 88 L 62 88 L 58 91 L 24 91 Z"
          fill="#1E293B"
          stroke="#64748B"
          strokeWidth="0.8"
        />

        {/* Skeg (Bottom fin) */}
        <path
          d="M 33 98 L 48 98 L 43 118 C 39 119, 36 117, 35 112 Z"
          fill="#0F172A"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Stainless Steel Propeller */}
        <g id="propeller" transform="translate(54, 96)">
          <circle cx="0" cy="0" r="5" fill="#475569" stroke="#E2E8F0" strokeWidth="1" />
          {/* Blade 1 */}
          <path
            d="M 0 -2 C 6 -12, 14 -12, 16 -6 C 14 0, 6 2, 0 0 Z"
            fill="url(#propellerGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.6"
          />
          {/* Blade 2 */}
          <path
            d="M 2 2 C 12 6, 12 14, 6 16 C 0 14, -2 6, 0 0 Z"
            fill="url(#propellerGrad)"
            stroke="#FFFFFF"
            strokeWidth="0.6"
          />
          {/* Blade 3 */}
          <path
            d="M -2 0 C -12 -6, -14 2, -10 8 C -4 8, -2 4, 0 0 Z"
            fill="url(#propellerGrad)"
            stroke="#CBD5E1"
            strokeWidth="0.6"
          />
          {/* Propeller Center Cone */}
          <circle cx="0" cy="0" r="2.5" fill="#F8FAFC" />
        </g>
      </g>
    </svg>
  );
};

/**
 * Top Navbar Logo Component:
 * Clean, compact, matches the reference header layout exactly.
 */
export const BlueWaveNavbarLogo: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 text-left focus:outline-none group transition-opacity hover:opacity-95"
      aria-label="BlueWave Outboard Motors Homepage"
    >
      <BlueWaveEmblem size={44} className="group-hover:scale-105 transition-transform duration-300" />
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline tracking-tight">
          <span className="font-extrabold text-xl md:text-2xl text-slate-100 uppercase italic font-['Cabinet_Grotesk'] tracking-wider drop-shadow-sm">
            BLUE
          </span>
          <span className="font-extrabold text-xl md:text-2xl text-[#0099FF] uppercase italic font-['Cabinet_Grotesk'] tracking-wider drop-shadow-[0_0_12px_rgba(0,153,255,0.4)]">
            WAVE
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-[-2px]">
          <span className="h-[1px] w-2 bg-[#0088FF]/70"></span>
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-300 tracking-[0.22em] font-sans whitespace-nowrap">
            OUTBOARD MOTORS
          </span>
          <span className="h-[1px] w-2 bg-[#0088FF]/70"></span>
        </div>
      </div>
    </button>
  );
};

/**
 * Full Brand Badge Component:
 * Faithfully brings the entire badge from the uploaded reference logo
 * into the footer or highlight cards, including the tagline and badges.
 */
export const BlueWaveFullBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <BlueWaveEmblem size={96} className="mb-2 drop-shadow-[0_8px_24px_rgba(0,136,255,0.25)]" />
      
      <div className="flex items-baseline tracking-wider mb-0.5">
        <span className="font-black text-3xl sm:text-4xl text-white uppercase italic font-['Cabinet_Grotesk']">
          BLUE
        </span>
        <span className="font-black text-3xl sm:text-4xl text-[#0099FF] uppercase italic font-['Cabinet_Grotesk'] drop-shadow-[0_0_16px_rgba(0,153,255,0.5)]">
          WAVE
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 w-full max-w-xs my-1">
        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#0088FF] to-[#0088FF]"></div>
        <span className="text-[11px] sm:text-xs uppercase font-extrabold text-slate-200 tracking-[0.26em] whitespace-nowrap">
          OUTBOARD MOTORS
        </span>
        <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#0088FF] to-[#0088FF]"></div>
      </div>

      <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] text-slate-400 uppercase mt-2">
        POWER &nbsp;/&nbsp; RELIABILITY &nbsp;/&nbsp; ON THE WATER
      </p>
    </div>
  );
};

/**
 * Authentic Authorized Dealer Brand Logos
 * Yamaha • Suzuki • Honda • Mercury • Tohatsu
 */
export const DealerBrandsBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const brands = [
    {
      name: 'YAMAHA',
      tag: 'Four Stroke & V-Max',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M5 19 L19 5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ),
    },
    {
      name: 'SUZUKI',
      tag: 'DF V6 & In-Line',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 5 L7 11 L10 13 L17 9 L7 15 L10 17 L17 13 L17 19 L7 19" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinejoin="bevel" />
        </svg>
      ),
    },
    {
      name: 'HONDA',
      tag: 'VTEC Marine',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6 L7 18 L17 18 L20 6 L16 6 L14 15 L10 15 L8 6 Z" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'MERCURY',
      tag: 'Verado & Pro XS',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18 L7 6 L12 14 L17 6 L21 18 L17 18 L15 11 L12 16 L9 11 L7 18 Z" fill="currentColor" />
        </svg>
      ),
    },
    {
      name: 'TOHATSU',
      tag: 'MFS Four Stroke',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 7 L20 7 L20 10 L14 10 L14 19 L10 19 L10 10 L4 10 Z" fill="currentColor" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`w-full py-5 border-y border-white/[0.07] bg-[#07111D]/80 backdrop-blur-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-[10px] uppercase font-bold tracking-[0.25em] text-[#0088FF] mb-3">
          AUTHORIZED SPECIALISTS &bull; TRUSTED GLOBAL BRANDS
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-8 items-center justify-items-center">
          {brands.map((b) => (
            <div
              key={b.name}
              className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-slate-300 hover:text-white transition-colors duration-200"
            >
              <span className="text-[#0088FF] shrink-0">{b.icon}</span>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-wider font-['Cabinet_Grotesk'] text-slate-100">
                  {b.name}
                </span>
                <span className="text-[10px] text-slate-400 font-sans tracking-tight">
                  {b.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
