import React, { useState, useEffect } from 'react';
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
  Lock,
  ArrowLeft,
  Clock,
  Sparkles,
  Info,
  User,
  LogIn,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PageId } from '../components/Header.tsx';
import { DealerBrandsBar } from '../components/BlueWaveLogo.tsx';

interface CheckoutPageProps {
  onNavigate: (page: PageId) => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { cart, cartSubtotal, cartShipping, cartTotal, currentUser, clearCart, formatMoney, businessInfo } = useStore();

  // Shipping & Contact Details
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.profile?.deliveryAddress || '');
  const [city, setCity] = useState(currentUser?.profile?.city || '');
  const [state, setState] = useState(currentUser?.profile?.state || '');
  const [zipCode, setZipCode] = useState(currentUser?.profile?.zipCode || '');
  const [country, setCountry] = useState(currentUser?.profile?.country || 'United States');
  const [notes, setNotes] = useState('');

  // Selected Payment Method
  const [selectedMethod, setSelectedMethod] = useState<'bank_transfer' | 'bitcoin' | 'paypal'>('bank_transfer');

  // Receipt submission state
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Flow State
  const [step, setStep] = useState<'details' | 'payment_instructions' | 'confirmation'>('details');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptSuccess, setReceiptSuccess] = useState(false);

  // Pre-fill if customer logs in or user profile changes
  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.fullName);
      if (!email) setEmail(currentUser.email);
      if (!phone && currentUser.phone) setPhone(currentUser.phone);
      if (!deliveryAddress && currentUser.profile?.deliveryAddress) setDeliveryAddress(currentUser.profile.deliveryAddress);
      if (!city && currentUser.profile?.city) setCity(currentUser.profile.city);
      if (!state && currentUser.profile?.state) setState(currentUser.profile.state);
      if (!zipCode && currentUser.profile?.zipCode) setZipCode(currentUser.profile.zipCode);
    }
  }, [currentUser, fullName, email, phone, deliveryAddress, city, state, zipCode]);

  // Lead Bank Information (Configurable & Dynamic)
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

  // Bitcoin Address (Configurable & Dynamic)
  const btcWalletAddress = 'bc1qf4rxtj2ez7wprkp2j6dx99cynxwytc447asn47';

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

    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser ? { Authorization: `Bearer ${localStorage.getItem('bw_token')}` } : {}),
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
          paymentMethod:
            selectedMethod === 'bank_transfer'
              ? 'Bank Transfer (Lead Bank Wire)'
              : selectedMethod === 'bitcoin'
              ? 'Bitcoin (BTC)'
              : 'PayPal',
          notes,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setCreatedOrderId(data.orderId);
        setStep('payment_instructions');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Checkout failed');
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
    if (!receiptImage) {
      alert('Please select or upload a screenshot of your bank transfer or Bitcoin transaction receipt.');
      return;
    }
    if (!createdOrderId) return;

    setReceiptSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser ? { Authorization: `Bearer ${localStorage.getItem('bw_token')}` } : {}),
        },
        body: JSON.stringify({
          orderId: createdOrderId,
          paymentMethod: selectedMethod === 'bank_transfer' ? 'Bank Transfer' : 'Bitcoin',
          amount: cartTotal,
          receiptImage,
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
        const data = await res.json();
        alert(data.error || 'Failed to submit receipt');
      }
    } catch {
      setReceiptSubmitting(false);
      alert('Error submitting payment receipt');
    }
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(btcWalletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-12 md:py-20 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <button onClick={() => onNavigate('shop')} className="hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shop</span>
          </button>
          <span>/</span>
          <span className="text-[#0088FF] font-semibold">Dealership Checkout &bull; Order Processing</span>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CUSTOMER DETAILS & PAYMENT METHOD SELECTION */}
        {/* ======================================================== */}
        {step === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left: Checkout Form */}
            <div className="lg:col-span-7 bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF]">
                    STEP 1 OF 2 &bull; GUEST OR ACCOUNT CHECKOUT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
                    Delivery &amp; Customer Information
                  </h2>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#0088FF]/15 text-[#0088FF] flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              {/* Guest Checkout Notice / Optional Log In */}
              {!currentUser && onOpenAuth && (
                <div className="mb-6 p-4 rounded-xl bg-[#07111D] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0088FF]/15 text-[#0088FF] flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Checking out as a Guest
                      </span>
                      <span className="text-[11px] text-slate-400">
                        No account or password is required. Have an existing account?
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0B1826] hover:bg-[#122438] text-white text-xs font-semibold border border-white/10 hover:border-[#0088FF]/50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#0088FF]" />
                    <span>Log In to Auto-Fill</span>
                  </button>
                </div>
              )}

              {currentUser && (
                <div className="mb-6 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Logged in as <strong>{currentUser.fullName}</strong> ({currentUser.email})</span>
                  </div>
                  <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                    PRE-FILLED
                  </span>
                </div>
              )}

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
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                </div>

                {/* Delivery Street Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Delivery Address / Marina Dock <span className="text-[#0088FF]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street address or receiving marina dock location"
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
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                      State / Region <span className="text-[#0088FF]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FL"
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

                {/* Country (Default United States) */}
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

                {/* ======================================================== */}
                {/* SELECT PAYMENT METHOD */}
                {/* ======================================================== */}
                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] block mb-2 font-['Cabinet_Grotesk']">
                    SELECT PAYMENT METHOD
                  </span>

                  <div className="space-y-2.5">
                    {/* Option 1: Bank Transfer (Wire / ACH) */}
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
                            Direct corporate bank transfer with secure verification.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </label>

                    {/* Option 2: Bitcoin */}
                    <label
                      onClick={() => setSelectedMethod('bitcoin')}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedMethod === 'bitcoin'
                          ? 'bg-[#0088FF]/15 border-[#0088FF] shadow-md'
                          : 'bg-[#060D17] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border flex items-center justify-center border-[#0088FF]">
                          {selectedMethod === 'bitcoin' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0088FF]" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Bitcoin (BTC)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Instant on-chain Bitcoin cryptocurrency payment.
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    </label>

                    {/* Option 3: PayPal (Not Connected State) */}
                    <div className="p-3.5 rounded-xl border border-white/5 bg-[#060D17]/50 opacity-60 flex items-center justify-between cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center" />
                        <div>
                          <span className="text-xs font-bold text-slate-300 block">PayPal</span>
                          <span className="text-[11px] text-slate-500">Official PayPal Business Gateway</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded font-mono">
                        PAYPAL — NOT CONNECTED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="w-full py-4 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>CONTINUE TO PAYMENT INSTRUCTIONS</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-[#0B1826] rounded-2xl p-6 sm:p-7 border border-white/10 shadow-2xl space-y-5">
              <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk'] pb-3 border-b border-white/10">
                Order Items ({cart.length})
              </h3>

              {cart.length === 0 ? (
                <p className="text-xs text-slate-400">Your cart is empty.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
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
                <span className="font-mono text-[#38BDF8] font-bold">{createdOrderId}</span> in your transfer memo. After sending, upload a screenshot or photo of your receipt below. Our team verifies submissions promptly.
              </div>
            </div>

            {/* METHOD A: BANK TRANSFER DETAILS */}
            {selectedMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#0088FF]" />
                    <span>Official BlueWave Wire / ACH Transfer Details</span>
                  </h3>
                  <button
                    onClick={handleCopyAccount}
                    className="text-xs text-[#0088FF] hover:underline flex items-center gap-1"
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

            {/* METHOD B: BITCOIN PAYMENT DETAILS */}
            {selectedMethod === 'bitcoin' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                  Bitcoin Payment Details
                </h3>

                <div className="p-5 rounded-xl bg-[#060D17] border border-white/10 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Send Payment to Official Bitcoin Wallet:</span>
                    <div className="flex items-center gap-2 bg-[#0B1826] p-3 rounded-lg border border-white/10">
                      <span className="font-mono text-xs sm:text-sm text-slate-100 break-all select-all flex-1">
                        {btcWalletAddress}
                      </span>
                      <button
                        onClick={handleCopyWallet}
                        className="px-3 py-1.5 rounded bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold shrink-0 flex items-center gap-1"
                      >
                        {copiedWallet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWallet ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Send the USD equivalent of <strong className="text-white">{formatMoney(cartTotal)}</strong>. Include reference{' '}
                    <strong className="text-[#0088FF]">{createdOrderId}</strong> in your transaction notes.
                  </p>
                </div>
              </div>
            )}

            {/* SUBMIT RECEIPT SECTION */}
            <form onSubmit={handleSubmitReceipt} className="space-y-5 pt-4 border-t border-white/10">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#0088FF] block mb-1">
                  SUBMIT RECEIPT FOR VERIFICATION
                </span>
                <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">
                  Upload Payment Screenshot or Wire Confirmation
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload a photo or screenshot showing the transfer details, bank confirmation code, or Bitcoin transaction hash.
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
                      className="text-slate-400 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Notes / Bank Wire Reference (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sent via Chase wire reference #981244 or Bitcoin TX ID..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF] resize-y"
                />
              </div>

              {/* Submit Receipt Action */}
              <button
                type="submit"
                disabled={receiptSubmitting || !receiptImage}
                className="w-full py-4 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {receiptSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>SUBMIT RECEIPT &bull; QUEUE FOR VERIFICATION</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Submitting a receipt queues your order for dealership review. Orders are marked PAID once verified by BlueWave accounts.
              </p>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: ORDER CONFIRMATION & VERIFICATION QUEUE */}
        {/* ======================================================== */}
        {step === 'confirmation' && createdOrderId && (
          <div className="max-w-2xl mx-auto bg-[#0B1826] rounded-2xl p-8 sm:p-10 border border-white/15 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#0088FF]/20 border border-[#0088FF]/40 text-[#0088FF] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/50 px-3 py-1 rounded-full uppercase tracking-wider">
                PAYMENT RECEIPT SUBMITTED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-['Cabinet_Grotesk'] mt-3">
                Order Registered #{createdOrderId}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{fullName}</strong>. Your payment receipt has been uploaded and our accounts department is verifying the transaction.
              </p>
            </div>

            {/* Status Summary Card */}
            <div className="p-5 rounded-xl bg-[#060D17] border border-white/10 text-left text-xs space-y-2.5 max-w-md mx-auto font-mono">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Order Reference:</span>
                <span className="text-white font-bold">{createdOrderId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Payment Status:</span>
                <span className="text-amber-400 font-bold">AWAITING VERIFICATION</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Order Status:</span>
                <span className="text-white font-bold">NEW &bull; PROCESSING</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Destination:</span>
                <span className="text-white font-medium truncate max-w-[200px]">{city}, {state}</span>
              </div>
            </div>

            {/* Direct Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {currentUser ? (
                <button
                  onClick={() => onNavigate('account')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>VIEW MY ORDER IN ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (onOpenAuth) onOpenAuth('register');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>CREATE OPTIONAL ACCOUNT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0B1826] hover:bg-[#122438] text-white text-xs font-bold uppercase tracking-wider transition-colors border border-white/10"
                  >
                    CONTINUE SHOPPING
                  </button>
                </>
              )}

              <button
                onClick={() => onNavigate('contact')}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0E2034] hover:bg-[#152e4a] text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-white/10 cursor-pointer"
              >
                CONTACT BLUEWAVE
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="mt-16">
        <DealerBrandsBar />
      </div>
    </div>
  );
};
