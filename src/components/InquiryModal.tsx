import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, Anchor, AlertCircle } from 'lucide-react';
import { OutboardMotorListing } from '../types/inventory.ts';
import { useStore } from '../context/StoreContext.tsx';

interface InquiryModalProps {
  motor: OutboardMotorListing | null;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ motor, onClose }) => {
  const { currentUser } = useStore();
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!motor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please enter your question.');
      return;
    }
    if (!email.trim() && !currentUser) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() || 'Interested Customer',
          email: email.trim(),
          phone: phone.trim(),
          productId: motor.id,
          productName: `${motor.brand} ${motor.model} (${motor.horsepower} HP)`,
          subject: `Inquiry: ${motor.brand} ${motor.model} [${motor.horsepower} HP]`,
          content: content.trim(),
        }),
      });

      setLoading(false);
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit inquiry');
      }
    } catch {
      setLoading(false);
      setError('Network error submitting question');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B1826] rounded-2xl border border-white/15 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-200 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#0088FF]/20 border border-[#0088FF]/40 text-[#0088FF] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white font-['Cabinet_Grotesk'] mb-2">
              Inquiry Dispatched to Dealership
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mb-6">
              Thank you. Our certified rigging team will review your questions regarding the{' '}
              <strong className="text-white">{motor.brand} {motor.model}</strong> and follow up promptly.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0088FF] block mb-1">
                PRODUCT INQUIRY
              </span>
              <h3 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                Ask About This Outboard
              </h3>
            </div>

            {/* Attached Motor Badge */}
            <div className="p-3 rounded-xl bg-[#060D17] border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0E2034] text-[#0088FF] flex items-center justify-center shrink-0">
                <Anchor className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  {motor.brand} {motor.model}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {motor.horsepower} HP &bull; {motor.condition} &bull; {motor.shaftLength}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!currentUser && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Miller"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Question or Rigging Requirement
              </label>
              <textarea
                rows={4}
                required
                placeholder="Ask about hull compatibility, transom bracket fitment, digital binnacle controls, propeller pitch recommendations, or delivery lead time..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF] resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0088FF]/30 flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Message to Staff</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
