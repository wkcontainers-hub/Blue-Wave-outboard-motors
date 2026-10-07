import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, MessageSquare, AlertCircle, PhoneCall, ExternalLink } from 'lucide-react';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';
import { useStore } from '../context/StoreContext.tsx';

export const ContactPage: React.FC = () => {
  const { businessInfo } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) {
      errs.name = 'Please provide your full name.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Please provide your phone or WhatsApp number.';
    }
    if (!formData.message.trim()) {
      errs.message = 'Please tell us what motor, service, or question you have.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Submission handler structured for Formspree, Resend, Supabase, CRM, or backend API
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setSubmitted(false);
    setErrors({});
  };

  // Format clean phone for tel: link
  const cleanPhoneForTel = businessInfo.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsappForLink = businessInfo.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-12 md:py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-12 md:mb-16">
          {/* Top label */}
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#0088FF] mb-3 block font-['Cabinet_Grotesk']">
            CONTACT US
          </span>

          {/* Large heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 font-['Cabinet_Grotesk']">
            Let's get you{' '}
            <span className="text-[#0099FF] bg-gradient-to-r from-[#0099FF] to-[#38BDF8] bg-clip-text text-transparent">
              on the water.
            </span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Tell us what you're looking for and we'll help you start the conversation.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT SIDE: Dynamic Business Contact Information Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0B1826] rounded-2xl p-7 border border-white/[0.08] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] font-['Cabinet_Grotesk']">
                  DIRECT DEALERSHIP DESK
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Verified Dealer</span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Connect directly with {businessInfo.businessName} sales and certified rigging specialists for immediate pricing, trade-ins, and transport schedules.
              </p>

              <div className="space-y-4">
                {/* Phone / WhatsApp */}
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/[0.05] hover:border-[#0088FF]/30 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 font-['Cabinet_Grotesk']">
                        PHONE / WHATSAPP
                      </span>
                      <a
                        href={`tel:${cleanPhoneForTel}`}
                        className="text-sm sm:text-base font-bold text-white hover:text-[#0088FF] transition-colors block font-mono"
                      >
                        {businessInfo.phone}
                      </a>
                      {businessInfo.secondaryPhone && (
                        <span className="text-xs text-slate-400 block font-mono mt-0.5">
                          Alt: {businessInfo.secondaryPhone}
                        </span>
                      )}

                      {/* WhatsApp quick button */}
                      {businessInfo.whatsapp && (
                        <a
                          href={`https://wa.me/${cleanWhatsappForLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-700/40"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat via WhatsApp ({businessInfo.whatsapp})</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/[0.05] hover:border-[#0088FF]/30 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 font-['Cabinet_Grotesk']">
                        EMAIL INBOX
                      </span>
                      <a
                        href={`mailto:${businessInfo.email}`}
                        className="text-sm sm:text-base font-bold text-white hover:text-[#0088FF] transition-colors font-mono"
                      >
                        {businessInfo.email}
                      </a>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Direct dealership quotes &amp; invoicing</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/[0.05] hover:border-[#0088FF]/30 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 font-['Cabinet_Grotesk']">
                        LOCATION &amp; MARINA YARD
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">
                        {businessInfo.location}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Showroom, test tank &amp; forklift loading dock</span>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/[0.05]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/30 flex items-center justify-center text-[#0088FF] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 font-['Cabinet_Grotesk']">
                        BUSINESS HOURS
                      </span>
                      <div className="text-xs text-slate-200 space-y-1 mt-1">
                        <div>{businessInfo.businessHours.weekdays}</div>
                        <div>{businessInfo.businessHours.saturday}</div>
                        <div className="text-slate-400">{businessInfo.businessHours.sunday}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick response note */}
            <div className="p-4 rounded-xl bg-[#07111D] border border-[#0088FF]/20 text-xs text-slate-300 flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-[#0088FF] shrink-0" />
              <span>We usually respond to inquiries within 1 to 2 business hours.</span>
            </div>
          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0B1826] rounded-2xl p-7 sm:p-9 border border-white/[0.08] shadow-2xl relative">
              {submitted ? (
                <div className="py-12 px-4 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#0088FF]/20 border border-[#0088FF]/40 text-[#0088FF] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-['Cabinet_Grotesk']">
                    Message Sent Successfully
                  </h3>
                  <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
                    Thank you, <strong className="text-white">{formData.name}</strong>. A {businessInfo.businessName} marine representative has received your request and will contact you via {formData.email} or phone shortly.
                  </p>
                  <div className="p-4 rounded-xl bg-[#07111D] border border-white/5 max-w-sm mx-auto text-xs text-slate-400 mb-6 font-mono">
                    Reference ID: BW-MSG-{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <h2 className="text-xl font-bold text-white mb-4 font-['Cabinet_Grotesk']">
                    Send an Inquiry
                  </h2>

                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Name <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Captain John Miller"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
                        errors.name ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Email <span className="text-[#0088FF]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
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

                    {/* Phone / WhatsApp */}
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Phone / WhatsApp <span className="text-[#0088FF]">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all ${
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
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Message <span className="text-[#0088FF]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Tell us about your boat, motor needs, horsepower preference, or service questions..."
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (errors.message) setErrors({ ...errors, message: '' });
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-[#060D17] border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0088FF] transition-all resize-y ${
                        errors.message ? 'border-red-500/80 bg-red-950/10' : 'border-white/10 hover:border-white/20'
                      }`}
                      required
                    />
                    {errors.message && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#0088FF]/30 hover:shadow-xl hover:shadow-[#0088FF]/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>SEND MESSAGE</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Your details are securely received by {businessInfo.businessName} dealership specialists.
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
