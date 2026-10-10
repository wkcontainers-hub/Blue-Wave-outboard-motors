import React from 'react';
import { ShoppingBag, Wrench, Package, ArrowRight, CheckCircle } from 'lucide-react';
import { PageId } from '../components/Header.tsx';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';
import { useStore, DEFAULT_PAGE_CONTENT } from '../context/StoreContext.tsx';
import { getSafeImageUrl, handleImageError } from '../utils/imageUrl.ts';

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { pagesContent } = useStore();
  const servicesData = pagesContent?.services || DEFAULT_PAGE_CONTENT.services;

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'sales':
        return <ShoppingBag className="w-5 h-5 text-[#0088FF]" />;
      case 'service':
        return <Wrench className="w-5 h-5 text-[#0088FF]" />;
      case 'parts':
      default:
        return <Package className="w-5 h-5 text-[#0088FF]" />;
    }
  };

  const serviceCards = servicesData.serviceCards || DEFAULT_PAGE_CONTENT.services.serviceCards;

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-12 md:mb-16">
          {/* Top label */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#0088FF] mb-3 block font-['Cabinet_Grotesk']">
            {servicesData.badge || 'OUR SERVICES'}
          </span>

          {/* Large heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-['Cabinet_Grotesk']">
            {servicesData.title || 'More than'}{' '}
            <span className="text-[#0099FF] bg-gradient-to-r from-[#0099FF] to-[#38BDF8] bg-clip-text text-transparent">
              {servicesData.titleHighlight || 'just motors.'}
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            {servicesData.subtitle || 'BlueWave is built to support customers before, during and after the purchase.'}
          </p>
        </div>

        {/* 3 Large Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {serviceCards.map((card: any) => (
            <div
              key={card.id}
              className="bg-[#0B1826] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-[#0088FF]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#0088FF]/10 flex flex-col group"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#07111D]">
                <img
                  src={getSafeImageUrl(card.image, '/images/service_outboard_engine_1791036551185.jpg')}
                  alt={card.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, '/images/service_outboard_engine_1791036551185.jpg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1826] via-transparent to-transparent opacity-80" />
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* Small blue icon + Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center shrink-0">
                      {getServiceIcon(card.id)}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white font-['Cabinet_Grotesk']">
                      {card.title}
                    </h3>
                  </div>

                  {/* Short description */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-5">
                    {card.desc}
                  </p>

                  {/* Feature Bullets */}
                  <ul className="space-y-2 mb-6">
                    {(card.bullets || []).map((b: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-4 h-4 text-[#0088FF] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Button */}
                <button
                  onClick={() => onNavigate(card.actionPage as PageId)}
                  className="w-full py-3 px-4 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2 group/btn border border-white/10 hover:border-transparent cursor-pointer"
                >
                  <span>{card.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery & Rigging Extra Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#07111D] via-[#0B1826] to-[#07111D] rounded-2xl border border-white/[0.08] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0088FF] block mb-2 font-['Cabinet_Grotesk']">
              LOGISTICS &amp; SUPPORT
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 font-['Cabinet_Grotesk']">
              Need freight delivery straight to your dock or marina?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We coordinate crating, motor transport, and liftgate delivery nationwide. Let us know your zip code and receiving capabilities when placing an order request.
            </p>
          </div>
          <button
            onClick={() => onNavigate('order')}
            className="shrink-0 px-6 py-3.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#0088FF]/25 flex items-center gap-2"
          >
            <span>Ask for Delivery Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Brands Bar */}
      <div className="mt-16">
        <DealerBrandsBar />
      </div>
    </div>
  );
};
