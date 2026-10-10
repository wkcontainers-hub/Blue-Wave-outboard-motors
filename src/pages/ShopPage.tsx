import React, { useState } from 'react';
import {
  Search,
  Check,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  Truck,
  Sparkles,
  SlidersHorizontal,
  X,
  Gauge,
  Clock,
  MapPin,
  ShoppingBag,
  MessageSquare,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { PageId } from '../components/Header.tsx';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { OutboardMotorListing } from '../types/inventory.ts';
import { InquiryModal } from '../components/InquiryModal.tsx';
import { getSafeImageUrl, handleImageError } from '../utils/imageUrl.ts';

interface ShopPageProps {
  onNavigate: (
    page: PageId,
    prefill?: {
      category?: string;
      horsepower?: string;
      condition?: string;
      brand?: string;
      model?: string;
      motorId?: string;
    }
  ) => void;
  onOpenCart: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onNavigate, onOpenCart }) => {
  const { motors, loadingMotors, addToCart, formatMoney, currentUser } = useStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedHpClass, setSelectedHpClass] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState<'All' | 'Available' | 'Sold'>('Available');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'hp-desc'>('featured');

  // Modals
  const [activeSpecMotor, setActiveSpecMotor] = useState<OutboardMotorListing | null>(null);
  const [inquiryMotor, setInquiryMotor] = useState<OutboardMotorListing | null>(null);

  // Added-to-cart toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter logic
  const filteredMotors = motors.filter((motor) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      motor.model.toLowerCase().includes(q) ||
      motor.brand.toLowerCase().includes(q) ||
      motor.description.toLowerCase().includes(q) ||
      motor.horsepower.toString().includes(q) ||
      motor.location.toLowerCase().includes(q);

    const matchesBrand = selectedBrand === 'All' || motor.brand === selectedBrand;

    let matchesHp = true;
    if (selectedHpClass === 'portable') matchesHp = motor.horsepower <= 15;
    else if (selectedHpClass === 'mid') matchesHp = motor.horsepower > 15 && motor.horsepower <= 115;
    else if (selectedHpClass === 'high') matchesHp = motor.horsepower > 115;

    const matchesCondition = selectedCondition === 'All' || motor.condition === selectedCondition;

    const matchesAvailability =
      selectedAvailability === 'All'
        ? true
        : selectedAvailability === 'Available'
        ? motor.availability === 'Available'
        : motor.availability === 'Sold';

    return matchesSearch && matchesBrand && matchesHp && matchesCondition && matchesAvailability;
  });

  // Sort logic
  const sortedMotors = [...filteredMotors].sort((a, b) => {
    if (sortBy === 'price-asc') {
      const priceA = a.isCallForPrice || !a.price ? 999999 : a.price;
      const priceB = b.isCallForPrice || !b.price ? 999999 : b.price;
      return priceA - priceB;
    }
    if (sortBy === 'price-desc') {
      const priceA = a.isCallForPrice || !a.price ? 0 : a.price;
      const priceB = b.isCallForPrice || !b.price ? 0 : b.price;
      return priceB - priceA;
    }
    if (sortBy === 'hp-desc') {
      return b.horsepower - a.horsepower;
    }
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  const handleAddToCart = (motor: OutboardMotorListing) => {
    const res = addToCart(motor);
    if (res.success) {
      setToastMessage(`Added "${motor.brand} ${motor.model}" to cart.`);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      alert(res.error || 'Cannot add this item to cart.');
    }
  };

  const handleBuyNow = (motor: OutboardMotorListing) => {
    const res = addToCart(motor);
    if (res.success) {
      onNavigate('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert(res.error || 'Cannot purchase this item.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-10 md:py-16 text-white">
      {/* Substantially wider container to display multiple products across each row */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-4xl mb-6">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#0088FF] mb-2 block font-['Cabinet_Grotesk']">
            BLUEWAVE OUTBOARD SHOWROOM &bull; U.S. INVENTORY
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3 font-['Cabinet_Grotesk']">
            Outboards for{' '}
            <span className="text-[#0099FF] bg-gradient-to-r from-[#0099FF] to-[#38BDF8] bg-clip-text text-transparent">
              every mission.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            Browse our extensive certified outboard inventory with upfront USD ($) pricing, genuine manufacturer warranties, and insured nationwide freight.
          </p>
        </div>

        {/* Added-to-Cart Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0E2034] border border-[#0088FF] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <ShoppingBag className="w-5 h-5 text-[#0088FF]" />
            <span className="text-xs font-semibold">{toastMessage}</span>
            <button
              onClick={onOpenCart}
              className="ml-2 text-xs font-bold text-[#38BDF8] underline hover:text-white"
            >
              View Cart
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-[#0B1826] rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Box */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by brand, model, horsepower, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0088FF]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Brand Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
              >
                <option value="All">All Brands</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Honda">Honda</option>
                <option value="Mercury">Mercury</option>
                <option value="Tohatsu">Tohatsu</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* HP Class Dropdown */}
            <div className="md:col-span-2">
              <select
                value={selectedHpClass}
                onChange={(e) => setSelectedHpClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
              >
                <option value="All">All Horsepower</option>
                <option value="portable">Portable (≤ 15 HP)</option>
                <option value="mid">Mid-Range (20–115 HP)</option>
                <option value="high">Offshore (140–300+ HP)</option>
              </select>
            </div>

            {/* Condition Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
              >
                <option value="All">All Conditions (New &amp; Used)</option>
                <option value="New">New Only</option>
                <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                <option value="Used">Used / Pre-Owned</option>
              </select>
            </div>
          </div>

          {/* Quick Availability & Sorting Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Availability:</span>
              <button
                onClick={() => setSelectedAvailability('Available')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedAvailability === 'Available'
                    ? 'bg-[#0088FF] text-white font-bold'
                    : 'bg-[#060D17] text-slate-300 hover:text-white'
                }`}
              >
                In Stock &bull; Available Only
              </button>
              <button
                onClick={() => setSelectedAvailability('All')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedAvailability === 'All'
                    ? 'bg-[#0088FF] text-white font-bold'
                    : 'bg-[#060D17] text-slate-300 hover:text-white'
                }`}
              >
                All (Including Sold)
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs">Showing {sortedMotors.length} outboards</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1 rounded-md bg-[#060D17] border border-white/10 text-white text-xs"
                >
                  <option value="featured">Featured / Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="hp-desc">Horsepower: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-column Grid: Desktop displays several products across each row (5 columns on 2xl) */}
        {loadingMotors ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-3 border-[#0088FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-mono">Loading BlueWave Outboard Inventory...</p>
          </div>
        ) : sortedMotors.length === 0 ? (
          <div className="py-20 text-center bg-[#0B1826] rounded-2xl border border-white/[0.08] p-8 mb-16">
            <SlidersHorizontal className="w-12 h-12 text-[#0088FF] mx-auto mb-3 opacity-60" />
            <h3 className="text-xl font-bold text-white mb-2 font-['Cabinet_Grotesk']">
              No outboards match your active filters
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              We frequently receive new distributor shipments and customer trade-ins. Tell us what you need and our sourcing team will check unlisted warehouse allotments.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('All');
                setSelectedHpClass('All');
                setSelectedCondition('All');
                setSelectedAvailability('All');
              }}
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mb-16">
            {sortedMotors.map((motor) => {
              const photos = motor.productPhotos?.length > 0
                ? motor.productPhotos
                : ['/images/about_outboard_motor_1791036540139.jpg'];
              const isSold = motor.availability === 'Sold' || (motor.stockCount !== undefined && motor.stockCount <= 0);

              return (
                <div
                  key={motor.id}
                  className={`bg-[#0B1826] rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between group ${
                    isSold
                      ? 'border-white/[0.06] opacity-85'
                      : 'border-white/[0.08] hover:border-[#0088FF]/50 hover:shadow-xl hover:shadow-[#0088FF]/10'
                  }`}
                >
                  <div>
                    {/* Compact Image Container */}
                    <div className="relative aspect-[16/11] overflow-hidden bg-[#060D17]">
                      <img
                        src={getSafeImageUrl(photos[0])}
                        alt={motor.model}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageError(e)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1826] via-transparent to-transparent opacity-75 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {isSold ? (
                          <span className="px-2 py-0.5 rounded bg-red-600/95 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                            SOLD
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-bold uppercase tracking-wider shadow-md">
                            IN STOCK
                          </span>
                        )}
                        {motor.condition === 'New' && !isSold && (
                          <span className="px-1.5 py-0.5 rounded bg-[#0088FF]/90 text-white text-[9px] font-bold uppercase tracking-wider">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Horsepower Tag */}
                      <div className="absolute top-2.5 right-2.5 bg-[#050B14]/90 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-[#0088FF] border border-white/10">
                        {motor.horsepower} HP
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-4.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-extrabold uppercase text-[#0088FF] tracking-wider font-['Cabinet_Grotesk']">
                          {motor.brand} &bull; {motor.year}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {motor.condition}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white mb-2 leading-snug font-['Cabinet_Grotesk'] line-clamp-1 group-hover:text-[#38BDF8] transition-colors">
                        {motor.model}
                      </h3>

                      {/* Compact Specs Grid */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 bg-[#060D17] p-2 rounded-lg border border-white/5 mb-3 font-mono">
                        <div>Shaft: <strong className="text-white">{motor.shaftLength.split(' ')[0]}</strong></div>
                        <div>Hours: <strong className="text-white">{motor.engineHours ? `${motor.engineHours} hrs` : '0 (New)'}</strong></div>
                      </div>

                      {/* Price in USD ($12,500.00) */}
                      <div className="flex items-baseline justify-between pt-1 border-t border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Dealer Price</span>
                        <span className="text-sm font-black text-white font-mono">
                          {motor.isCallForPrice || !motor.price ? 'Call for Price' : formatMoney(motor.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: ADD TO CART, View Details, Ask About This Motor */}
                  <div className="p-4 pt-0 space-y-2">
                    {/* Primary ADD TO CART / BUY NOW */}
                    <button
                      onClick={() => handleAddToCart(motor)}
                      disabled={isSold}
                      className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSold
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                          : 'bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white shadow-[#0088FF]/20 hover:shadow-[#0088FF]/30'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isSold ? 'SOLD OUT' : 'ADD TO CART'}</span>
                    </button>

                    {/* Secondary Actions: Quick Specs & Ask About This Motor */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setActiveSpecMotor(motor)}
                        className="flex-1 py-1.5 px-2 rounded-md bg-[#0E2034] hover:bg-[#152e4a] text-slate-300 hover:text-white text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 border border-white/5"
                        title="View Full Specifications"
                      >
                        <Eye className="w-3 h-3 text-[#0088FF]" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => setInquiryMotor(motor)}
                        className="flex-1 py-1.5 px-2 rounded-md bg-[#0E2034] hover:bg-[#152e4a] text-slate-300 hover:text-white text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 border border-white/5"
                        title="Ask about this motor"
                      >
                        <MessageSquare className="w-3 h-3 text-[#0088FF]" />
                        <span>Ask Staff</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sourcing Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#07111D] via-[#0B1826] to-[#07111D] rounded-2xl border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#0088FF] block mb-1">
              CUSTOM SOURCING &bull; REPOWER PACKAGES
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
              Looking for a specific motor class, counter-rotating pair, or custom rigging?
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              BlueWave coordinates commercial warehouse allocations directly across Yamaha, Suzuki, Honda, Mercury, and Tohatsu distributor networks.
            </p>
          </div>
          <button
            onClick={() => onNavigate('order')}
            className="shrink-0 px-6 py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0088FF]/30 flex items-center gap-2"
          >
            <span>Submit Sourcing Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div className="mt-16">
        <DealerBrandsBar />
      </div>

      {/* Inquiry Modal */}
      <InquiryModal motor={inquiryMotor} onClose={() => setInquiryMotor(null)} />

      {/* Quick Specs Modal */}
      {activeSpecMotor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1826] rounded-2xl border border-white/15 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0088FF]">
                  {activeSpecMotor.brand} &bull; {activeSpecMotor.year} &bull; {activeSpecMotor.horsepower} HP
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
                  {activeSpecMotor.model}
                </h3>
              </div>
              <button
                onClick={() => setActiveSpecMotor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Spec Modal Photo */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-6 bg-[#060D17]">
              <img
                src={getSafeImageUrl(activeSpecMotor.productPhotos[0])}
                alt={activeSpecMotor.model}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e)}
              />
              <div className="absolute bottom-3 left-3 bg-[#050B14]/85 backdrop-blur-md px-3 py-1 rounded text-xs font-mono font-bold text-white">
                Price: {activeSpecMotor.isCallForPrice || !activeSpecMotor.price ? 'Call for Price' : formatMoney(activeSpecMotor.price)}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
                Motor Overview
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeSpecMotor.description}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="mb-6">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#060D17] p-4 rounded-xl border border-white/5 font-mono">
                <div><span className="text-slate-400">Horsepower:</span> <strong className="text-white">{activeSpecMotor.horsepower} HP</strong></div>
                <div><span className="text-slate-400">Condition:</span> <strong className="text-white">{activeSpecMotor.condition}</strong></div>
                <div><span className="text-slate-400">Model Year:</span> <strong className="text-white">{activeSpecMotor.year}</strong></div>
                <div><span className="text-slate-400">Engine Hours:</span> <strong className="text-white">{activeSpecMotor.engineHours ?? 0} hrs</strong></div>
                <div><span className="text-slate-400">Shaft Length:</span> <strong className="text-white">{activeSpecMotor.shaftLength}</strong></div>
                <div><span className="text-slate-400">Fuel / Induction:</span> <strong className="text-white">{activeSpecMotor.fuelType || 'EFI 4-Stroke'}</strong></div>
                <div><span className="text-slate-400">Location:</span> <strong className="text-white">{activeSpecMotor.location}</strong></div>
                <div><span className="text-slate-400">Delivery:</span> <strong className="text-white">{activeSpecMotor.deliveryAvailable ? 'Nationwide Freight' : 'Local Yard Pickup'}</strong></div>

                {Object.entries(activeSpecMotor.specs || {}).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-400">{k}:</span> <strong className="text-white">{v}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setInquiryMotor(activeSpecMotor);
                  setActiveSpecMotor(null);
                }}
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-300 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Question</span>
              </button>

              <button
                onClick={() => {
                  handleBuyNow(activeSpecMotor);
                  setActiveSpecMotor(null);
                }}
                disabled={activeSpecMotor.availability === 'Sold'}
                className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0088FF]/30 disabled:opacity-50"
              >
                {activeSpecMotor.availability === 'Sold' ? 'Motor Already Sold' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
