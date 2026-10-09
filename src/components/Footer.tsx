import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Facebook, Instagram, ShieldCheck, Wrench, Truck, Lock, ArrowRight, UserPlus, LogIn, ShoppingBag, Send } from 'lucide-react';
import { PageId } from './Header.tsx';
import { BlueWaveFullBadge } from './BlueWaveLogo.tsx';
import { useStore } from '../context/StoreContext.tsx';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenAdminLogin: () => void;
  onOpenCustomerAuth?: (mode: 'login' | 'register') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdminLogin, onOpenCustomerAuth }) => {
  const { businessInfo, isAdminLoggedIn } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check user reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setPrefersReducedMotion(true);
        setIsVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Disconnect once revealed to avoid repeated distracting animations on scroll
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = businessInfo.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = businessInfo.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer
      ref={footerRef}
      className={`w-full bg-[#03070E] border-t border-white/[0.08] text-slate-300 pt-14 pb-12 mt-auto transition-all duration-700 ease-out ${
        isVisible || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ======================================================== */}
        {/* ANIMATED HERO FOOTER BANNER: POWER YOUR NEXT ADVENTURE   */}
        {/* ======================================================== */}
        <div className="mb-12 pb-12 border-b border-white/[0.08] text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Cabinet_Grotesk'] leading-tight transition-all duration-700 ease-out transform ${
              isVisible || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            Power Your Next Adventure
          </h2>

          {/* Supporting Text underneath heading */}
          <p
            className={`text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-3 leading-relaxed transition-all duration-700 delay-150 ease-out transform ${
              isVisible || prefersReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-6'
            }`}
          >
            Certified outboard motors across all horsepower classes, direct marine freight,
            custom rigging consultations, and authentic dealer support for every journey.
          </p>

          {/* 4 Prominent Navigation Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* 1. Shop Outboards */}
            <button
              onClick={() => handleNav('shop')}
              className={`px-5 py-3 rounded-xl bg-[#0088FF] hover:bg-[#0074DB] active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0088FF]/30 hover:shadow-[#0088FF]/50 flex items-center justify-center gap-2 border border-[#0099FF] cursor-pointer transition-all duration-500 delay-300 ease-out transform min-w-[150px] ${
                isVisible || prefersReducedMotion
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Outboards</span>
            </button>

            {/* 2. Request Moto */}
            <button
              onClick={() => handleNav('order')}
              className={`px-5 py-3 rounded-xl bg-[#0B1826] hover:bg-[#122438] active:scale-95 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/15 hover:border-[#0088FF]/60 flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all duration-500 delay-400 ease-out transform min-w-[150px] ${
                isVisible || prefersReducedMotion
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <Send className="w-4 h-4 text-[#0088FF]" />
              <span>Request Moto</span>
            </button>

            {/* 3. Join Now */}
            <button
              onClick={() => {
                if (onOpenCustomerAuth) onOpenCustomerAuth('register');
              }}
              className={`px-5 py-3 rounded-xl bg-[#0B1826] hover:bg-[#122438] active:scale-95 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/15 hover:border-[#0088FF]/60 flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all duration-500 delay-500 ease-out transform min-w-[150px] ${
                isVisible || prefersReducedMotion
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <UserPlus className="w-4 h-4 text-[#0088FF]" />
              <span>Join Now</span>
            </button>

            {/* 4. Log In */}
            <button
              onClick={() => {
                if (onOpenCustomerAuth) onOpenCustomerAuth('login');
              }}
              className={`px-5 py-3 rounded-xl bg-[#060D17] hover:bg-[#0E1C2E] active:scale-95 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/10 hover:border-[#0088FF]/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-500 delay-600 ease-out transform min-w-[150px] ${
                isVisible || prefersReducedMotion
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <LogIn className="w-4 h-4 text-[#0088FF]" />
              <span>Log In</span>
            </button>
          </div>
        </div>
        
        {/* Dealership Core Pillars Strip */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/[0.07] transition-all duration-700 delay-700 ease-out transform ${
            isVisible || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex items-center gap-4 bg-[#07111D] p-5 rounded-xl border border-white/[0.06]">
            <div className="w-12 h-12 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-wide uppercase">New &amp; Used Outboards</h4>
              <p className="text-xs text-slate-400 mt-0.5">Factory-inspected sourcing across all horsepower classes.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#07111D] p-5 rounded-xl border border-white/[0.06]">
            <div className="w-12 h-12 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-wide uppercase">Sales &amp; Service</h4>
              <p className="text-xs text-slate-400 mt-0.5">Full rigging, tune-ups, accessories, controls &amp; props.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-[#07111D] p-5 rounded-xl border border-white/[0.06]">
            <div className="w-12 h-12 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm tracking-wide uppercase">Delivery Available</h4>
              <p className="text-xs text-slate-400 mt-0.5">Safe freight transport directly to your dock or marina.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-white/[0.07] transition-all duration-700 delay-[800ms] ease-out transform ${
            isVisible || prefersReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Col 1: Brand & Badge */}
          <div className="lg:col-span-1 flex flex-col items-start">
            <BlueWaveFullBadge className="items-start text-left" />
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Premier marine power dealership specializing in new and used outboard sales, 
              custom rigging, replacement parts, and dedicated customer delivery.
            </p>
          </div>

          {/* Col 2: Brand Specialization */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest text-[#0088FF] mb-4 font-['Cabinet_Grotesk']">
              Featured Brands
            </h4>
            <div className="flex flex-col space-y-2 text-sm">
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] group-hover:scale-125 transition-transform"></span>
                Yamaha Outboards
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] group-hover:scale-125 transition-transform"></span>
                Suzuki Marine
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] group-hover:scale-125 transition-transform"></span>
                Honda Marine
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] group-hover:scale-125 transition-transform"></span>
                Mercury Marine
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer group" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] group-hover:scale-125 transition-transform"></span>
                Tohatsu Outboards
              </span>
            </div>
          </div>

          {/* Col 3: Navigation Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest text-[#0088FF] mb-4 font-['Cabinet_Grotesk']">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition-colors text-slate-300 hover:translate-x-1 duration-150 inline-block"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors text-slate-300 hover:translate-x-1 duration-150 inline-block"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-slate-300 hover:translate-x-1 duration-150 inline-block"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop')}
                  className="hover:text-white transition-colors text-slate-300 hover:translate-x-1 duration-150 inline-block"
                >
                  Shop Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors text-slate-300 hover:translate-x-1 duration-150 inline-block"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('order')}
                  className="text-[#0088FF] hover:underline font-semibold hover:translate-x-1 duration-150 inline-block"
                >
                  Order / Request a Motor
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Dynamic Contact & Placeholders */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest text-[#0088FF] mb-4 font-['Cabinet_Grotesk']">
              Dealership Inquiries
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#0088FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Phone / WhatsApp</span>
                  <a href={`tel:${cleanPhone}`} className="text-white font-medium hover:text-[#0088FF] transition-colors">
                    {businessInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#0088FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Email</span>
                  <a href={`mailto:${businessInfo.email}`} className="text-white font-medium hover:text-[#0088FF] transition-colors">
                    {businessInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0088FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Dealership Location</span>
                  <span className="text-white font-medium">{businessInfo.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#0088FF] shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Business Hours</span>
                  <span className="text-slate-300">{businessInfo.businessHours.weekdays}</span>
                </div>
              </div>
            </div>

            {/* Social Icons (Dynamic URLs) */}
            <div className="mt-5 pt-4 border-t border-white/[0.08]">
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Connect With Us</span>
              <div className="flex items-center gap-3">
                <a
                  href={businessInfo.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#0088FF] hover:text-white text-slate-300 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={businessInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#0088FF] hover:text-white text-slate-300 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#0088FF] hover:text-white text-slate-300 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Admin Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            &copy; 2026 {businessInfo.businessName}. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Power &bull; Reliability &bull; On The Water</span>
            <span>&bull;</span>
            <button
              onClick={onOpenAdminLogin}
              className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-500 hover:text-slate-300 py-1 px-2 rounded hover:bg-white/[0.03]"
              title="Private Dealership Owner Portal"
            >
              <Lock className="w-3 h-3 text-[#0088FF]/70" />
              <span>{isAdminLoggedIn ? 'Admin Console (Active)' : 'Dealer Admin Portal'}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
