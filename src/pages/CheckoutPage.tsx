import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  AlertCircle,
  Truck,
  Building2,
  CreditCard,
  Lock,
  ArrowLeft,
  Clock,
  Sparkles,
  Info,
  Bitcoin,
  QrCode,
  Wallet,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PageId } from '../components/Header.tsx';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';
import { getApiUrl } from '../utils/api.ts';

interface CheckoutPageProps {
  onNavigate: (page: PageId) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, cartSubtotal, cartShipping, cartTotal, clearCart, formatMoney, paymentMethods } = useStore();

  // Shipping & Contact Details (Guest Checkout)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [notes, setNotes] = useState('');

  // Selected Payment Method: Bitcoin, Bank Transfer, or PayPal
  const [selectedMethod, setSelectedMethod] = useState<'bitcoin' | 'bank_transfer' | 'paypal'>('bitcoin');

  // Receipt submission state
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedBtc, setCopiedBtc] = useState(false);

  // Flow State
  const [step, setStep] = useState<'details' | 'payment_instructions' | 'confirmation'>('details');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptSuccess, setReceiptSuccess] = useState(false);

  // Lead Bank Information
  const bankDetails = {
    beneficiaryName: 'Choussy Christian Junior',
    accountNumber: '210051969790',
    bankName: 'Lead Bank',
    routingNumber: '101019644',
    address: '1801 Main St.',
    city: 'Kansas City',
    state: 'MO',
    country: 'US',
    postalCode: '64108',
  };

  // Bitcoin Wallet Information
  const bitcoinDetails = {
    walletAddress:
      paymentMethods.find((m) => m.id === 'bitcoin')?.config?.walletAddress ||
      'bc1qf4rxtj2ez7wprkp2j6dx99cynxwytc447asn47',
    instructions:
      paymentMethods.find((m) => m.id === 'bitcoin')?.config?.paymentInstructions ||
      'Send the exact USD equivalent amount in BTC to the BlueWave public wallet address below. Once sent, upload a screenshot or transaction hash link for verification.',
  };

  // Handle Step 1: Submit Customer & Order Information
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !deliveryAddress || !city || !state || !zipCode) {
      setError('Please fill in all contact and delivery address fields.');
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    const paymentMethodLabel =
      selectedMethod === 'bitcoin'
        ? 'Bitcoin (BTC)'
        : selectedMethod === 'bank_transfer'
        ? 'Bank Transfer (Lead Bank Wire)'
        : 'PayPal';

    try {
      const res = await fetch(getApiUrl('/api/orders/checkout'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          deliveryAddress,
          city,
          state,
          zipCode,
          country,
          items: cart,
          paymentMethod: paymentMethodLabel,
          notes,
        }),
      });

      const data = await res.json().catch(() => ({}));
      setLoading(false);

      if (res.ok) {
        setCreatedOrderId(data.orderId);
        setStep('payment_instructions');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || `Checkout failed (HTTP ${res.status})`);
      }
    } catch {
      setLoading(false);
      setError('Network communication error during checkout');
    }
  };

  // Handle Receipt Upload (FileReader to Base64)
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload a screenshot image (JPEG, PNG, WEBP) or PDF receipt.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setReceiptImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Step 2: Submit Payment Receipt
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage && !customerNotes.trim()) {
      alert(
        selectedMethod === 'bitcoin'
          ? 'Please upload a transaction screenshot or enter your Bitcoin Transaction ID (TxID) / hash in the notes below.'
          : 'Please select or upload a screenshot of your bank transfer receipt.'
      );
      return;
    }
    if (!createdOrderId) return;

    const paymentMethodLabel =
      selectedMethod === 'bitcoin'
        ? 'Bitcoin (BTC)'
        : selectedMethod === 'bank_transfer'
        ? 'Bank Transfer'
        : 'PayPal';

    setReceiptSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/payments/submit-receipt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: createdOrderId,
          paymentMethod: paymentMethodLabel,
          amount: cartTotal,
          receiptImage: receiptImage || '',
          customerNotes,
        }),
      });

      setReceiptSubmitting(false);
      if (res.ok) {
        setReceiptSuccess(true);
        clearCart();
        setStep('confirmation');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Failed to submit receipt. Please contact BlueWave support.');
      }
    } catch {
      setReceiptSubmitting(false);
      alert('Network error submitting payment verification receipt.');
    }
  };

  const handleSkipReceiptForNow = () => {
    clearCart();
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyBtc = () => {
    navigator.clipboard.writeText(bitcoinDetails.walletAddress);
    setCopiedBtc(true);
    setTimeout(() => setCopiedBtc(false), 2000);
  };

  return (
    <div className="w-full bg-[#050B14] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-white min-h-[85vh]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Dealership Header & Steps Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs text-[#0088FF] hover:underline flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Motors</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk'] tracking-tight">
              Direct Marine Checkout
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure guest checkout. No account or password required.
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              step === 'details' ? 'bg-[#0088FF]/20 border-[#0088FF] text-white font-bold' : 'border-white/10 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-[#0088FF] text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Information</span>
            </div>

            <div className="w-3 h-0.5 bg-white/20" />

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              step === 'payment_instructions' ? 'bg-[#0088FF]/20 border-[#0088FF] text-white font-bold' : 'border-white/10 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Payment</span>
            </div>

            <div className="w-3 h-0.5 bg-white/20" />

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
              step === 'confirmation' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold' : 'border-white/10 text-slate-400'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmed</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CUSTOMER & DELIVERY DETAILS FORM */}
        {/* ======================================================== */}
        {step === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Checkout Form */}
            <div className="lg:col-span-7 bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF]">
                    STEP 1 OF 2 &bull; GUEST CHECKOUT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
                    Delivery &amp; Customer Information
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#0088FF]/15 text-[#0088FF] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-950/70 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Full Legal Name <span className="text-[#0088FF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Captain Robert Harris"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Email Address <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="robert@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      Phone Number <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                </div>

                {/* Delivery Street Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Delivery Address / Marine Slip / Marina Address <span className="text-[#0088FF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="1480 Ocean Marina Drive, Dock Slip 4B"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      City <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Miami"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      State <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="FL"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      ZIP / Postal Code <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="33132"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Order / Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Liftgate required, forklift availability, delivery access notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF] resize-y"
                  />
                </div>

                {/* SELECT PAYMENT METHOD */}
                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] block mb-2 font-['Cabinet_Grotesk']">
                    SELECT PAYMENT METHOD
                  </span>

                  <div className="space-y-2.5">
                    {/* Option 1: Bitcoin (BTC) */}
                    <label
                      onClick={() => setSelectedMethod('bitcoin')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedMethod === 'bitcoin'
                          ? 'bg-[#F7931A]/15 border-[#F7931A] shadow-md shadow-[#F7931A]/10'
                          : 'bg-[#060D17] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedMethod === 'bitcoin' ? 'border-[#F7931A]' : 'border-white/30'
                          }`}
                        >
                          {selectedMethod === 'bitcoin' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F7931A]" />
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#F7931A]/20 text-[#F7931A] flex items-center justify-center font-bold text-xs shrink-0">
                            <Bitcoin className="w-4 h-4 text-[#F7931A]" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              Bitcoin (BTC)
                              <span className="text-[10px] text-amber-400 font-mono font-normal">Native Network</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono truncate max-w-[280px] sm:max-w-md block">
                              Wallet: {bitcoinDetails.walletAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </label>

                    {/* Option 2: Bank Transfer (Wire / ACH) */}
                    <label
                      onClick={() => setSelectedMethod('bank_transfer')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedMethod === 'bank_transfer'
                          ? 'bg-[#0088FF]/15 border-[#0088FF] shadow-md'
                          : 'bg-[#060D17] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center border-[#0088FF]">
                          {selectedMethod === 'bank_transfer' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0088FF]" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Bank Transfer (Lead Bank Wire / ACH)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Direct corporate bank transfer with secure reference verification.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </label>

                    {/* Option 3: PayPal */}
                    <label
                      onClick={() => setSelectedMethod('paypal')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedMethod === 'paypal'
                          ? 'bg-[#0088FF]/15 border-[#0088FF] shadow-md'
                          : 'bg-[#060D17] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center border-[#0088FF]">
                          {selectedMethod === 'paypal' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0088FF]" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            PayPal
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Official PayPal invoice sent directly to your email address.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-sky-950/60 text-sky-300 border border-sky-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        AVAILABLE
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full py-3.5 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>PROCEED TO PAYMENT SETTLEMENT</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    No account required &bull; Direct dealer delivery arranged upon payment verification.
                  </p>
                </div>
              </form>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-[#0B1826] rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6 lg:sticky lg:top-24">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0088FF] font-bold block mb-1">
                  ORDER CART REVIEW
                </span>
                <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                  Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                </h3>
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Your cart is empty.{' '}
                  <button onClick={() => onNavigate('shop')} className="text-[#0088FF] underline font-bold">
                    Add outboard motors
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex gap-3 items-center p-2.5 rounded-lg bg-[#060D17]">
                      <img
                        src={item.photo}
                        alt={item.model}
                        className="w-14 h-12 object-cover rounded bg-[#091522] border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#0088FF] font-bold uppercase block">{item.brand}</span>
                        <h4 className="text-xs font-bold text-white truncate">{item.model}</h4>
                        <div className="flex justify-between items-center text-xs text-slate-300 font-mono mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          <span className="text-white font-bold">{formatMoney(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">{formatMoney(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#0088FF]" />
                    <span>Insured Marine Freight</span>
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {cartShipping === 0 ? 'Complimentary / Included' : formatMoney(cartShipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                  <span>Total Amount (USD)</span>
                  <span className="text-[#0099FF] font-mono text-lg">{formatMoney(cartTotal)}</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="p-3.5 rounded-xl bg-[#07111D] border border-white/5 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#0088FF]" />
                  <span>BlueWave Authorized Transaction</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every order is assigned a dedicated marine specialist to verify transom dimensions and confirm transport logistics prior to warehouse release.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PAYMENT INSTRUCTIONS & RECEIPT SUBMISSION */}
        {/* ======================================================== */}
        {step === 'payment_instructions' && createdOrderId && (
          <div className="max-w-3xl mx-auto bg-[#0B1826] rounded-2xl p-6 sm:p-9 border border-white/15 shadow-2xl space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="border-b border-white/10 pb-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] block mb-1">
                STEP 2 OF 2 &bull; PAYMENT SETTLEMENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk']">
                Complete Your Payment
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                <span>
                  Order Reference: <strong className="text-white font-mono text-sm">{createdOrderId}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Amount Due:{' '}
                  <strong className="text-[#0099FF] font-mono text-sm">{formatMoney(cartTotal)}</strong>
                </span>
              </div>
            </div>

            {/* Instruction Warning */}
            <div className="p-4 rounded-xl bg-[#091726] border border-[#0088FF]/40 text-xs text-slate-200 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#0088FF] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Payment Verification Notice:</strong> Please include your Order Reference{' '}
                <span className="font-mono text-[#38BDF8] font-bold">{createdOrderId}</span> in your payment transfer memo or notes. After initiating payment, upload a screenshot or photo of your receipt below. Our team verifies submissions promptly.
              </div>
            </div>

            {/* METHOD A: BITCOIN (BTC) SETTLEMENT DETAILS */}
            {selectedMethod === 'bitcoin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#F7931A]/20 text-[#F7931A] flex items-center justify-center">
                      <Bitcoin className="w-4 h-4 text-[#F7931A]" />
                    </div>
                    <span>Official BlueWave Bitcoin (BTC) Settlement Details</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyBtc}
                    className="text-xs text-[#F7931A] hover:underline flex items-center gap-1 cursor-pointer bg-[#F7931A]/10 border border-[#F7931A]/30 px-2.5 py-1 rounded-md"
                  >
                    {copiedBtc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className={copiedBtc ? 'text-emerald-400 font-bold' : ''}>
                      {copiedBtc ? 'Copied Wallet Address!' : 'Copy Bitcoin Address'}
                    </span>
                  </button>
                </div>

                {/* Bitcoin Payment Card */}
                <div className="bg-[#060D17] p-5 sm:p-6 rounded-xl border border-[#F7931A]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F7931A] block">
                        BITCOIN NETWORK (NATIVE BTC)
                      </span>
                      <span className="text-xs text-slate-300">
                        Send the exact USD equivalent of <strong className="text-white font-mono text-sm">{formatMoney(cartTotal)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-[#0F2238] px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-slate-400">Order Ref:</span>
                      <span className="font-mono font-bold text-white">{createdOrderId}</span>
                    </div>
                  </div>

                  {/* Wallet Address Box with Copy */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Official Public Bitcoin Wallet Address:</span>
                      <span className="text-[11px] text-amber-400 font-mono">BTC Network Only</span>
                    </label>
                    <div className="flex items-center gap-2 bg-[#050B14] border border-[#F7931A]/40 rounded-lg p-3">
                      <div className="w-8 h-8 rounded-md bg-[#F7931A]/20 text-[#F7931A] flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4 text-[#F7931A]" />
                      </div>
                      <span className="font-mono text-xs sm:text-sm text-amber-200 select-all break-all flex-1">
                        {bitcoinDetails.walletAddress}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyBtc}
                        className="p-2 bg-[#F7931A]/20 hover:bg-[#F7931A]/30 text-[#F7931A] rounded-md transition-colors cursor-pointer shrink-0"
                        title="Copy Bitcoin Address"
                      >
                        {copiedBtc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-3.5 rounded-lg bg-[#0A1828] border border-white/10 text-xs space-y-1.5 text-slate-300">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#F7931A]" />
                      <span>Payment Instructions:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {bitcoinDetails.instructions}
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      Tip: Once the transaction is broadcast from your Bitcoin wallet or exchange, copy the Transaction Hash (TxID) and paste it into the notes field below, or take a screenshot and upload it for prompt verification by our operations team.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD B: BANK TRANSFER DETAILS */}
            {selectedMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#0088FF]" />
                    <span>Official BlueWave Wire / ACH Transfer Details</span>
                  </h3>
                  <button
                    onClick={handleCopyAccount}
                    className="text-xs text-[#0088FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Copied Account' : 'Copy Account #'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#060D17] p-5 rounded-xl border border-white/10 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Beneficiary Name:</span>
                    <strong className="text-white text-sm">{bankDetails.beneficiaryName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bank Name:</span>
                    <strong className="text-white text-sm">{bankDetails.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Number:</span>
                    <strong className="text-white text-sm tracking-wider">{bankDetails.accountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Routing Number (ABA):</span>
                    <strong className="text-white text-sm">{bankDetails.routingNumber}</strong>
                  </div>
                  <div className="sm:col-span-2 pt-2 border-t border-white/5">
                    <span className="text-slate-400 block text-[11px]">Bank Street Address:</span>
                    <strong className="text-white">
                      {bankDetails.address}, {bankDetails.city}, {bankDetails.state} {bankDetails.postalCode},{' '}
                      {bankDetails.country}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD C: PAYPAL INSTRUCTIONS */}
            {selectedMethod === 'paypal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0088FF]" />
                  <span>PayPal Invoice Settlement</span>
                </h3>

                <div className="p-5 rounded-xl bg-[#060D17] border border-white/10 space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">
                    A formal BlueWave PayPal Business invoice and checkout link for <strong className="text-white">{formatMoney(cartTotal)}</strong> will be sent to your email (<strong className="text-[#0088FF]">{email}</strong>) referencing order <strong className="font-mono text-white">{createdOrderId}</strong>.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    If you have already completed payment via PayPal, you may upload your confirmation screenshot below to expedite order fulfillment.
                  </p>
                </div>
              </div>
            )}

            {/* SUBMIT RECEIPT SECTION */}
            <form onSubmit={handleSubmitReceipt} className="space-y-5 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] block mb-1">
                  SUBMIT RECEIPT / VERIFICATION PROOF (OPTIONAL / RECOMMENDED)
                </span>
                <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                  {selectedMethod === 'bitcoin'
                    ? 'Upload Transaction Screenshot or Enter Transaction Hash'
                    : 'Upload Payment Screenshot or Wire Confirmation'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedMethod === 'bitcoin'
                    ? 'Upload a screenshot from your Bitcoin wallet or exchange showing the transaction, or provide the TxID / Hash below.'
                    : 'Upload a photo or screenshot showing the transfer details, bank confirmation code, or transaction receipt.'}
                </p>
              </div>

              {/* Upload Box */}
              <div className="space-y-3">
                <label className="border-2 border-dashed border-white/20 hover:border-[#0088FF] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#060D17]">
                  <Upload className="w-8 h-8 text-[#0088FF] mb-2" />
                  <span className="text-xs font-bold text-white mb-0.5">
                    Click to Upload Screenshot / Image / PDF Receipt
                  </span>
                  <span className="text-[10px] text-slate-400">JPEG, PNG, WEBP, or PDF up to 25MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Preview */}
                {receiptImage && (
                  <div className="p-3 rounded-lg bg-[#060D17] border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Receipt screenshot attached &amp; ready to submit</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Notes / TxID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {selectedMethod === 'bitcoin'
                    ? 'Bitcoin Transaction ID (TxID) / Hash / Sender Notes'
                    : 'Customer Notes / Bank Wire Reference (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    selectedMethod === 'bitcoin'
                      ? 'Paste your Bitcoin TxID / transaction hash or wallet memo here...'
                      : 'e.g. Sent via Chase wire reference #981244...'
                  }
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF] resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={receiptSubmitting || (!receiptImage && !customerNotes.trim())}
                  className="flex-1 py-4 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {receiptSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>SUBMIT PROOF &bull; QUEUE FOR VERIFICATION</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkipReceiptForNow}
                  className="py-4 px-6 rounded-lg bg-[#0E2034] hover:bg-[#152e4a] text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
                >
                  FINISH &amp; I'LL SEND PROOF LATER
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Submitting a receipt queues your order for dealership review. Orders are marked PAID once verified by BlueWave accounts.
              </p>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: ORDER CONFIRMATION */}
        {/* ======================================================== */}
        {step === 'confirmation' && createdOrderId && (
          <div className="max-w-2xl mx-auto bg-[#0B1826] rounded-2xl p-6 sm:p-10 border border-white/15 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] block mb-1">
                ORDER RECEIVED &bull; PENDING VERIFICATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk']">
                Thank You For Your Order!
              </h2>
              <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
                Your order has been recorded in the BlueWave system. Our marine operations team will review your payment and coordinate transport logistics.
              </p>
            </div>

            {/* Order Reference Card */}
            <div className="p-4 rounded-xl bg-[#060D17] border border-white/10 max-w-md mx-auto text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Your Order Reference Number</span>
              <span className="text-2xl font-black text-[#0099FF] font-mono tracking-wider block">
                {createdOrderId}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Please save this reference number for all communications with our support team.
              </span>
            </div>

            {/* Order Status Details */}
            <div className="text-xs text-slate-300 max-w-md mx-auto bg-[#07111D] p-4 rounded-xl border border-white/5 space-y-2 text-left">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Payment Method:</span>
                <span className="text-white font-bold">
                  {selectedMethod === 'bitcoin'
                    ? 'Bitcoin (BTC)'
                    : selectedMethod === 'bank_transfer'
                    ? 'Bank Wire Transfer'
                    : 'PayPal'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-amber-400 font-bold">
                  {receiptSuccess ? 'AWAITING VERIFICATION' : 'AWAITING PAYMENT'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Fulfillment Status:</span>
                <span className="text-white font-bold">NEW &bull; PROCESSING</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Destination:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{city}, {state}</span>
              </div>
            </div>

            {/* Direct Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONTINUE SHOPPING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0E2034] hover:bg-[#152e4a] text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
              >
                CONTACT BLUEWAVE SUPPORT
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
