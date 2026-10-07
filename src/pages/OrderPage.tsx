import React, { useState, useEffect } from 'react';
import { Check, Send, CheckCircle2, Shield, AlertCircle, FileText, Anchor } from 'lucide-react';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { OutboardBrand, MotorCondition } from '../types/inventory.ts';

interface OrderPageProps {
  initialPrefill?: {
    category?: string;
    horsepower?: string;
    condition?: string;
    brand?: string;
    model?: string;
    motorId?: string;
  } | null;
}

export const OrderPage: React.FC<OrderPageProps> = ({ initialPrefill }) => {
  const { businessInfo } = useStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    brand: 'Yamaha' as OutboardBrand,
    horsepower: '',
    condition: 'New' as MotorCondition,
    year: 'Current / Newest',
    shaftLength: '20" Long',
    deliveryLocation: '',
    budget: '',
    additionalDetails: '',
    motorId: '',
  });

  const [selectedMotorModel, setSelectedMotorModel] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialPrefill) {
      setFormData((prev) => ({
        ...prev,
        brand: (initialPrefill.brand as OutboardBrand) || prev.brand,
        horsepower: initialPrefill.horsepower || prev.horsepower,
        condition: (initialPrefill.condition as MotorCondition) || prev.condition,
        motorId: initialPrefill.motorId || '',
        additionalDetails: initialPrefill.model
          ? `Inquiring specifically about listing: ${initialPrefill.model}`
          : initialPrefill.category
          ? `Inquiring about ${initialPrefill.category}. `
          : prev.additionalDetails,
      }));

      if (initialPrefill.model) {
        setSelectedMotorModel(initialPrefill.model);
      }
    }
  }, [initialPrefill]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone / WhatsApp is required for quote communication.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!formData.horsepower.trim()) {
      errs.horsepower = 'Please enter desired horsepower (e.g. 9.9, 115, 250).';
    }
    if (!formData.deliveryLocation.trim()) {
      errs.deliveryLocation = 'Please state your city, state, or receiving marina zip code.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Form submission handler ready for Formspree / CRM / Webhook
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      brand: 'Yamaha',
      horsepower: '',
      condition: 'New',
      year: 'Current / Newest',
      shaftLength: '20" Long',
      deliveryLocation: '',
      budget: '',
      additionalDetails: '',
      motorId: '',
    });
    setSelectedMotorModel(null);
    setSubmitted(false);
    setErrors({});
  };

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-12 md:py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-12 md:mb-16">
          {/* Top label */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#0088FF] mb-3 block font-['Cabinet_Grotesk']">
            ORDER / REQUEST A MOTOR
          </span>

          {/* Large heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-['Cabinet_Grotesk']">
            Tell us what{' '}
            <span className="text-[#0099FF] bg-gradient-to-r from-[#0099FF] to-[#38BDF8] bg-clip-text text-transparent">
              you need.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Use this form for a purchase request or a quote. We can replace this with a real checkout/order system once inventory and payment details are ready.
          </p>
        </div>

        {/* Selected Motor Banner (if user came from Shop Now card) */}
        {selectedMotorModel && (
          <div className="mb-8 p-4 rounded-xl bg-[#091726] border border-[#0088FF]/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0088FF]/20 text-[#0088FF] flex items-center justify-center shrink-0">
                <Anchor className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0088FF] tracking-wider block">
                  SELECTED INVENTORY UNIT
                </span>
                <span className="text-sm font-bold text-white">{selectedMotorModel}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedMotorModel(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT SIDE: Information Checklist */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B1826] rounded-2xl p-7 border border-white/[0.08] shadow-xl">
              <h3 className="text-lg font-bold text-white mb-3 font-['Cabinet_Grotesk']">
                What Information to Provide
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                To guarantee the fastest turnaround on motor availability and freight calculations, please provide as many specifics as possible:
              </p>

              {/* Checklist */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#060D17] border border-white/[0.05]">
                  <div className="w-5 h-5 rounded-full bg-[#0088FF]/20 flex items-center justify-center text-[#0088FF] shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">Brand and horsepower</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#060D17] border border-white/[0.05]">
                  <div className="w-5 h-5 rounded-full bg-[#0088FF]/20 flex items-center justify-center text-[#0088FF] shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">New or used preference</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#060D17] border border-white/[0.05]">
                  <div className="w-5 h-5 rounded-full bg-[#0088FF]/20 flex items-center justify-center text-[#0088FF] shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">Year and shaft length (15", 20", 25", 30")</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#060D17] border border-white/[0.05]">
                  <div className="w-5 h-5 rounded-full bg-[#0088FF]/20 flex items-center justify-center text-[#0088FF] shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">Preferred delivery location</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#060D17] border border-white/[0.05]">
                  <div className="w-5 h-5 rounded-full bg-[#0088FF]/20 flex items-center justify-center text-[#0088FF] shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm text-slate-200 font-medium">Budget or pricing requirements</span>
                </div>
              </div>

              {/* Dealership Promise */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#0088FF] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-200 block font-semibold mb-0.5">
                    Direct {businessInfo.businessName} Guarantee
                  </strong>
                  Transparent pricing, factory warranty registration, and insured carrier freight right to your marina.
                </div>
              </div>
            </div>

            {/* Note about checkout / payment */}
            <div className="p-4 rounded-xl bg-[#07111D] border border-white/10 text-xs text-slate-400 flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#0088FF] shrink-0" />
              <span>This request form initiates a formal dealer quote. No payments are charged during this step.</span>
            </div>
          </div>

          {/* RIGHT SIDE: Professional Order Request Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0B1826] rounded-2xl p-7 sm:p-9 border border-white/[0.08] shadow-2xl relative">
              {submitted ? (
                <div className="py-12 px-4 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#0088FF]/20 border border-[#0088FF]/40 text-[#0088FF] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-['Cabinet_Grotesk']">
                    Order Request Received
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                    Thank you, <strong className="text-white">{formData.fullName}</strong>. We have registered your request for a <strong className="text-[#0088FF]">{formData.brand} ({formData.horsepower || 'motor'})</strong>.
                  </p>
                  
                  {/* Summary Box */}
                  <div className="p-5 rounded-xl bg-[#060D17] border border-white/10 max-w-md mx-auto text-left text-xs space-y-2 mb-6">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">Order Reference:</span>
                      <span className="text-white font-mono font-bold">BW-ORD-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Brand &amp; HP:</span>
                      <span className="text-white font-medium">{formData.brand} &bull; {formData.horsepower}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Condition:</span>
                      <span className="text-white font-medium">{formData.condition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shaft Length:</span>
                      <span className="text-white font-medium">{formData.shaftLength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivery Destination:</span>
                      <span className="text-white font-medium">{formData.deliveryLocation}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                    Our sales representative will verify current warehouse allotment and reply with exact invoice terms.
                  </p>

                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <h2 className="text-xl font-bold text-white mb-2 font-['Cabinet_Grotesk']">
                    Request / Quote Specifications
                  </h2>

                  {/* Customer Information (Full Name, Phone, Email) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="order-fullname" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Full Name <span className="text-[#0088FF]">*</span>
                      </label>
                      <input
                        id="order-fullname"
                        type="text"
                        placeholder="e.g. Captain Robert Harris"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({ ...formData, fullName: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
                          errors.fullName ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                        }`}
                        required
                      />
                      {errors.fullName && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="order-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Phone / WhatsApp <span className="text-[#0088FF]">*</span>
                      </label>
                      <input
                        id="order-phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
                          errors.phone ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                        }`}
                        required
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="order-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Email Address <span className="text-[#0088FF]">*</span>
                      </label>
                      <input
                        id="order-email"
                        type="email"
                        placeholder="robert@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
                          errors.email ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Motor Specs: Brand & Horsepower */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor="order-brand" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Brand
                      </label>
                      <select
                        id="order-brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value as OutboardBrand })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                      >
                        <option value="Yamaha">Yamaha</option>
                        <option value="Suzuki">Suzuki</option>
                        <option value="Honda">Honda</option>
                        <option value="Mercury">Mercury</option>
                        <option value="Tohatsu">Tohatsu</option>
                        <option value="Other">Other / Multiple</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="order-hp" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Horsepower <span className="text-[#0088FF]">*</span>
                      </label>
                      <input
                        id="order-hp"
                        type="text"
                        placeholder="e.g. 9.9 HP, 115 HP, 250 HP"
                        value={formData.horsepower}
                        onChange={(e) => {
                          setFormData({ ...formData, horsepower: e.target.value });
                          if (errors.horsepower) setErrors({ ...errors, horsepower: '' });
                        }}
                        className={`w-full px-4 py-2.5 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
                          errors.horsepower ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                        }`}
                        required
                      />
                      {errors.horsepower && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.horsepower}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Condition & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="order-condition" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Condition
                      </label>
                      <select
                        id="order-condition"
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value as MotorCondition })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                      >
                        <option value="New">New</option>
                        <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                        <option value="Used">Used</option>
                        <option value="Either">Either</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="order-year" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Year Preference
                      </label>
                      <input
                        id="order-year"
                        type="text"
                        placeholder="e.g. 2024–2026, 2018+, or Any"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                      />
                    </div>
                  </div>

                  {/* Shaft Length & Budget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="order-shaft" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Shaft Length
                      </label>
                      <select
                        id="order-shaft"
                        value={formData.shaftLength}
                        onChange={(e) => setFormData({ ...formData, shaftLength: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                      >
                        <option value='15" Short'>15" Short (Tenders &amp; Small Skiffs)</option>
                        <option value='20" Long'>20" Long (Standard Transom)</option>
                        <option value='25" Extra Long'>25" Extra Long (Offshore Deep-V)</option>
                        <option value='30" Ultra Long'>30" Ultra Long (Large Center Consoles)</option>
                        <option value="Unsure / Need Advice">Unsure / Need Advice</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="order-budget" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                        Budget / Target Price (Optional)
                      </label>
                      <input
                        id="order-budget"
                        type="text"
                        placeholder="e.g. $4,000 - $8,000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF]"
                      />
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div>
                    <label htmlFor="order-location" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Delivery Location (City, State or Marina Zip) <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      id="order-location"
                      type="text"
                      placeholder="e.g. Miami, FL 33139 or Local Dealership Pickup"
                      value={formData.deliveryLocation}
                      onChange={(e) => {
                        setFormData({ ...formData, deliveryLocation: e.target.value });
                        if (errors.deliveryLocation) setErrors({ ...errors, deliveryLocation: '' });
                      }}
                      className={`w-full px-4 py-2.5 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
                        errors.deliveryLocation ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                      }`}
                      required
                    />
                    {errors.deliveryLocation && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.deliveryLocation}
                      </p>
                    )}
                  </div>

                  {/* Additional Details */}
                  <div>
                    <label htmlFor="order-details" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Additional Details
                    </label>
                    <textarea
                      id="order-details"
                      rows={3}
                      placeholder="Tell us your boat make/model, whether controls/gauges/prop are needed, or timing..."
                      value={formData.additionalDetails}
                      onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#0088FF]/30 hover:shadow-xl hover:shadow-[#0088FF]/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>SUBMIT ORDER REQUEST</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center">
                    No payment is processed at this stage. You will receive an itemized quote with freight and rigging options from {businessInfo.businessName}.
                  </p>
                </form>
              )}
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
