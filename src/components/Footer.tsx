import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Facebook, Instagram, ShieldCheck, Wrench, Truck, Lock, Shield } from 'lucide-react';
import { PageId } from './Header.tsx';
import { BlueWaveFullBadge } from './BlueWaveLogo.tsx';
import { useStore } from '../context/StoreContext.tsx';

interface FooterProps {
  onNavigate: (page: PageId) => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdminLogin }) => {
  const { businessInfo, isAdminLoggedIn } = useStore();

  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = businessInfo.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsapp = businessInfo.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="w-full bg-[#03070E] border-t border-white/[0.08] text-slate-300 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dealership Core Pillars Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-white/[0.07]">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12 border-b border-white/[0.07]">
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
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF]"></span>
                Yamaha Outboards
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF]"></span>
                Suzuki Marine
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF]"></span>
                Honda Marine
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF]"></span>
                Mercury Marine
              </span>
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer" onClick={() => handleNav('shop')}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF]"></span>
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
                  className="hover:text-white transition-colors text-slate-300"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors text-slate-300"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('services')}
                  className="hover:text-white transition-colors text-slate-300"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop')}
                  className="hover:text-white transition-colors text-slate-300"
                >
                  Shop Now
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contact')}
                  className="hover:text-white transition-colors text-slate-300"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('order')}
                  className="text-[#0088FF] hover:underline font-semibold"
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
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#0088FF] hover:text-white text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={businessInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#0088FF] hover:text-white text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#0088FF] hover:text-white text-slate-300 flex items-center justify-center transition-colors"
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
