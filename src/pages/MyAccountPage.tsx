import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Package,
  MessageSquare,
  HelpCircle,
  CreditCard,
  LogOut,
  Save,
  Send,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Truck,
  Building,
  Key,
  ChevronRight,
  Eye,
  RefreshCw,
  FileText,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PageId } from '../components/Header.tsx';
import { Order, CustomerMessage, SupportTicket } from '../types/inventory.ts';

interface MyAccountPageProps {
  onNavigate: (page: PageId) => void;
  onOpenAuth: () => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { currentUser, logout, updateProfile, cart, cartCount, cartTotal, formatMoney } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'cart' | 'messages' | 'support' | 'payments'>('orders');

  // Profile Form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.profile?.deliveryAddress || '');
  const [city, setCity] = useState(currentUser?.profile?.city || '');
  const [state, setState] = useState(currentUser?.profile?.state || '');
  const [zipCode, setZipCode] = useState(currentUser?.profile?.zipCode || '');
  const [country, setCountry] = useState(currentUser?.profile?.country || 'United States');
  const [profileSaved, setProfileSaved] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Messages state
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeMessage, setActiveMessage] = useState<CustomerMessage | null>(null);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isComposingMsg, setIsComposingMsg] = useState(false);
  const [newMsgSubject, setNewMsgSubject] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');

  // Support Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyContent, setTicketReplyContent] = useState('');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Question');
  const [newTicketOrderId, setNewTicketOrderId] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Load customer data when authenticated
  useEffect(() => {
    if (!currentUser) return;

    setFullName(currentUser.fullName);
    setPhone(currentUser.phone || '');
    if (currentUser.profile) {
      setDeliveryAddress(currentUser.profile.deliveryAddress || '');
      setCity(currentUser.profile.city || '');
      setState(currentUser.profile.state || '');
      setZipCode(currentUser.profile.zipCode || '');
      setCountry(currentUser.profile.country || 'United States');
    }

    const token = localStorage.getItem('bw_token');
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch orders
    setLoadingOrders(true);
    fetch('/api/orders/my-orders', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.warn)
      .finally(() => setLoadingOrders(false));

    // Fetch messages
    setLoadingMessages(true);
    fetch('/api/messages/my-messages', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.warn)
      .finally(() => setLoadingMessages(false));

    // Fetch support tickets
    setLoadingTickets(true);
    fetch('/api/support/my-tickets', { headers })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTickets(data);
      })
      .catch(console.warn)
      .finally(() => setLoadingTickets(false));
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center py-20 px-4 bg-[#050B14] text-white">
        <div className="max-w-md w-full text-center bg-[#0B1826] p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#0088FF]/15 text-[#0088FF] flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white font-['Cabinet_Grotesk'] mb-2">
            Customer Account Required
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Sign in to view your outboard motor orders, verify payment receipts, message BlueWave support, or manage delivery locations.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onOpenAuth}
              className="w-full py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0088FF]/30"
            >
              Sign In or Register
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-2.5 rounded-lg bg-[#0E2034] text-slate-300 text-xs font-semibold hover:text-white"
            >
              Continue Browsing Outboards
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({
      fullName,
      phone,
      deliveryAddress,
      city,
      state,
      zipCode,
      country,
    });
    if (res.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bw_token')}`,
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg({ text: 'Password changed successfully', error: false });
        setCurrentPass('');
        setNewPass('');
      } else {
        setPassMsg({ text: data.error || 'Password update failed', error: true });
      }
    } catch {
      setPassMsg({ text: 'Error changing password', error: true });
    }
  };

  // Message Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMessage || !newReplyContent.trim()) return;

    try {
      const res = await fetch(`/api/messages/${activeMessage.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bw_token')}`,
        },
        body: JSON.stringify({ content: newReplyContent.trim() }),
      });
      if (res.ok) {
        // Refresh messages
        const updatedReplies = [
          ...activeMessage.replies,
          {
            id: 'temp_' + Date.now(),
            senderRole: 'customer' as const,
            senderName: currentUser.fullName,
            content: newReplyContent.trim(),
            createdAt: new Date().toISOString(),
          },
        ];
        setActiveMessage({ ...activeMessage, replies: updatedReplies });
        setNewReplyContent('');
      }
    } catch (e) {
      console.warn('Failed to post reply', e);
    }
  };

  // Compose New Message
  const handleCreateNewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgSubject.trim() || !newMsgContent.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bw_token')}`,
        },
        body: JSON.stringify({
          fullName: currentUser.fullName,
          email: currentUser.email,
          phone: currentUser.phone,
          subject: newMsgSubject.trim(),
          content: newMsgContent.trim(),
        }),
      });
      if (res.ok) {
        setIsComposingMsg(false);
        setNewMsgSubject('');
        setNewMsgContent('');
        // Reload messages
        const refresh = await fetch('/api/messages/my-messages', {
          headers: { Authorization: `Bearer ${localStorage.getItem('bw_token')}` },
        });
        const d = await refresh.json();
        if (Array.isArray(d)) setMessages(d);
      }
    } catch (e) {
      console.warn('Failed to send message', e);
    }
  };

  // Support Ticket Reply
  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !ticketReplyContent.trim()) return;

    try {
      const res = await fetch(`/api/support/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bw_token')}`,
        },
        body: JSON.stringify({ content: ticketReplyContent.trim() }),
      });
      if (res.ok) {
        const updatedReplies = [
          ...activeTicket.replies,
          {
            id: 'temp_' + Date.now(),
            senderRole: 'customer' as const,
            senderName: currentUser.fullName,
            content: ticketReplyContent.trim(),
            createdAt: new Date().toISOString(),
          },
        ];
        setActiveTicket({ ...activeTicket, replies: updatedReplies });
        setTicketReplyContent('');
      }
    } catch (e) {
      console.warn('Failed to post ticket reply', e);
    }
  };

  // Create Support Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bw_token')}`,
        },
        body: JSON.stringify({
          fullName: currentUser.fullName,
          email: currentUser.email,
          phone: currentUser.phone,
          category: newTicketCategory,
          orderId: newTicketOrderId || undefined,
          subject: newTicketSubject.trim(),
          message: newTicketMessage.trim(),
        }),
      });
      if (res.ok) {
        setIsCreatingTicket(false);
        setNewTicketSubject('');
        setNewTicketMessage('');
        setNewTicketOrderId('');
        // Reload tickets
        const refresh = await fetch('/api/support/my-tickets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('bw_token')}` },
        });
        const d = await refresh.json();
        if (Array.isArray(d)) setTickets(d);
      }
    } catch (e) {
      console.warn('Failed to create ticket', e);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050B14] py-10 md:py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Profile Banner */}
        <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0088FF] to-[#0044BB] text-white flex items-center justify-center font-black text-xl font-['Cabinet_Grotesk'] shadow-lg shadow-[#0088FF]/25">
              {currentUser.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
                  {currentUser.fullName}
                </h1>
                <span className="text-[10px] bg-[#0088FF]/20 text-[#38BDF8] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  VERIFIED CUSTOMER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUser.email} &bull; {currentUser.phone || 'No phone set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('shop')}
              className="px-4 py-2 rounded-lg bg-[#0E2034] hover:bg-[#152e4a] text-xs font-bold text-slate-200 border border-white/10"
            >
              Browse Showroom
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="px-4 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 border border-red-800/40 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Tabs Navigation */}
        <div className="flex space-x-2 sm:space-x-4 border-b border-white/10 pb-2 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('orders');
              setSelectedOrder(null);
            }}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'cart'
                ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Cart ({cartCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('messages');
              setActiveMessage(null);
            }}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'messages'
                ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages ({messages.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('support');
              setActiveTicket(null);
            }}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'support'
                ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Support / Complaints ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'payments'
                ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment History</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MY ORDERS */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {selectedOrder ? (
              /* Single Order Detail View */
              <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs text-[#0088FF] hover:underline mb-1 flex items-center gap-1"
                    >
                      &larr; Back to All Orders
                    </button>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Cabinet_Grotesk']">
                      Order Reference #{selectedOrder.id}
                    </h2>
                    <span className="text-xs text-slate-400">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                        selectedOrder.paymentStatus === 'PAID'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50'
                          : selectedOrder.paymentStatus === 'PAYMENT REJECTED'
                          ? 'bg-red-950/80 text-red-300 border border-red-600/50'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      Fulfillment: <strong className="text-white">{selectedOrder.orderStatus}</strong>
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0088FF] mb-3">
                    Purchased Outboard Units
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#060D17] border border-white/5 flex items-center gap-4">
                        <img
                          src={it.photo || '/src/assets/images/about_outboard_motor_1791036540139.jpg'}
                          alt={it.model}
                          className="w-16 h-14 object-cover rounded-lg bg-[#091522]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-[#0088FF] font-bold uppercase block">{it.brand}</span>
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{it.model}</h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {it.horsepower} HP &bull; Qty: {it.quantity}
                          </span>
                        </div>
                        <span className="text-sm font-mono font-bold text-white">
                          {formatMoney(it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery and payment breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 text-xs">
                  <div className="space-y-1.5 p-4 rounded-xl bg-[#060D17] border border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Delivery Destination
                    </span>
                    <p className="text-white font-medium">{selectedOrder.customerName}</p>
                    <p className="text-slate-300">{selectedOrder.deliveryAddress}</p>
                    <p className="text-slate-400">{selectedOrder.phone}</p>
                  </div>

                  <div className="space-y-2 p-4 rounded-xl bg-[#060D17] border border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Financial Summary
                    </span>
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="text-white font-mono">{formatMoney(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Marine Freight:</span>
                      <span className="text-emerald-400 font-mono">
                        {selectedOrder.shipping === 0 ? 'Complimentary' : formatMoney(selectedOrder.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                      <span>Total:</span>
                      <span className="text-[#0099FF] font-mono text-base">{formatMoney(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.rejectionReason && (
                  <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/50 text-xs text-red-200">
                    <strong className="block mb-1 text-red-100 font-bold">Verification Note from Dealership:</strong>
                    <span>{selectedOrder.rejectionReason}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="py-20 text-center bg-[#0B1826] rounded-2xl border border-white/10 p-8">
                    <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-white font-['Cabinet_Grotesk']">No orders placed yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                      Explore our wide outboard showroom to find factory-new and certified pre-owned motors.
                    </p>
                    <button
                      onClick={() => onNavigate('shop')}
                      className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30"
                    >
                      Shop Outboard Motors
                    </button>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className="bg-[#0B1826] rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-[#0088FF]/50 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0E2034] text-[#0088FF] flex items-center justify-center shrink-0">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                              Order #{o.id}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              &bull; {new Date(o.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            {o.items.length} {o.items.length === 1 ? 'unit' : 'units'}:{' '}
                            {o.items.map((i) => `${i.brand} ${i.model}`).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-sm font-mono font-bold text-white block">
                            {formatMoney(o.total)}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-950/80 text-emerald-300'
                                : o.paymentStatus === 'PAYMENT REJECTED'
                                ? 'bg-red-950/80 text-red-300'
                                : 'bg-amber-950/80 text-amber-300'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: MY PROFILE */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                    Personal &amp; Delivery Information
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Save your shipping address to speed up quote and motor checkout.
                  </p>
                </div>
                {profileSaved && (
                  <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Address / Dock</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Marina dock slip or street address"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="lg:col-span-4 bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-2xl h-fit">
              <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk'] mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#0088FF]" />
                <span>Security / Password</span>
              </h3>

              {passMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs mb-3 ${
                    passMsg.error
                      ? 'bg-red-950/70 border border-red-700/50 text-red-300'
                      : 'bg-emerald-950/70 border border-emerald-700/50 text-emerald-300'
                  }`}
                >
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#0E2034] hover:bg-[#152e4a] text-xs font-semibold text-white border border-white/10"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY CART */}
        {/* ======================================================== */}
        {activeTab === 'cart' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk'] mb-4">
              Your Current Saved Cart
            </h2>

            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-xs text-slate-400 mb-4">You have no items in your cart.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 rounded-lg bg-[#0088FF] text-xs font-bold uppercase text-white"
                >
                  View Outboard Motors
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-white/10">
                  {cart.map((item) => (
                    <div key={item.productId} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={item.photo} alt={item.model} className="w-16 h-14 object-cover rounded-lg" />
                        <div>
                          <span className="text-[10px] text-[#0088FF] font-bold uppercase">{item.brand}</span>
                          <h4 className="text-sm font-bold text-white">{item.model}</h4>
                          <span className="text-xs text-slate-400 font-mono">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-white block">
                          {formatMoney(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm">
                    <span className="text-slate-400">Total: </span>
                    <strong className="text-lg font-mono text-[#0099FF]">{formatMoney(cartTotal)}</strong>
                  </div>

                  <button
                    onClick={() => onNavigate('checkout')}
                    className="px-8 py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#0088FF]/30 flex items-center gap-2"
                  >
                    <span>BUY NOW &bull; CHECKOUT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MESSAGES */}
        {/* ======================================================== */}
        {activeTab === 'messages' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Direct Staff Conversations
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Two-way messaging with BlueWave certified marine advisors.
                </p>
              </div>

              {!isComposingMsg && !activeMessage && (
                <button
                  onClick={() => setIsComposingMsg(true)}
                  className="px-4 py-2 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Message</span>
                </button>
              )}
            </div>

            {/* Compose New Message Form */}
            {isComposingMsg && (
              <form onSubmit={handleCreateNewMessage} className="p-5 rounded-xl bg-[#060D17] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0088FF]">Compose New Message</h3>
                  <button type="button" onClick={() => setIsComposingMsg(false)} className="text-xs text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question regarding Yamaha rigging kit"
                    value={newMsgSubject}
                    onChange={(e) => setNewMsgSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your message to the BlueWave team..."
                    value={newMsgContent}
                    onChange={(e) => setNewMsgContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs resize-y"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Send Message
                </button>
              </form>
            )}

            {/* Active Thread View */}
            {activeMessage ? (
              <div className="space-y-4">
                <button
                  onClick={() => setActiveMessage(null)}
                  className="text-xs text-[#0088FF] hover:underline"
                >
                  &larr; Back to all messages
                </button>
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/10">
                  <span className="text-xs font-mono text-[#38BDF8] block mb-1">SUBJECT</span>
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">{activeMessage.subject}</h3>
                </div>

                {/* Message replies history */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {activeMessage.replies.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl text-xs space-y-1 ${
                        r.senderRole === 'admin'
                          ? 'bg-[#0E2034] border border-[#0088FF]/30 ml-4'
                          : 'bg-[#060D17] border border-white/10 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <strong className={r.senderRole === 'admin' ? 'text-[#38BDF8]' : 'text-white'}>
                          {r.senderName} ({r.senderRole === 'admin' ? 'Staff' : 'You'})
                        </strong>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Type your response..."
                    value={newReplyContent}
                    onChange={(e) => setNewReplyContent(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              /* Messages List */
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No messages yet. Send an inquiry anytime.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setActiveMessage(m)}
                      className="p-4 rounded-xl bg-[#060D17] border border-white/10 hover:border-[#0088FF]/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{m.subject}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              m.status === 'REPLIED' ? 'bg-emerald-950 text-emerald-300' : 'bg-[#0088FF]/20 text-[#38BDF8]'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.replies.length} message{m.replies.length === 1 ? '' : 's'} &bull; Updated{' '}
                          {new Date(m.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SUPPORT / COMPLAINTS */}
        {/* ======================================================== */}
        {activeTab === 'support' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Support &amp; Complaints Tickets
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Formal support requests tracked with unique reference numbers (BW-SUPPORT-XXXX).
                </p>
              </div>

              {!isCreatingTicket && !activeTicket && (
                <button
                  onClick={() => setIsCreatingTicket(true)}
                  className="px-4 py-2 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </button>
              )}
            </div>

            {/* Create Ticket Form */}
            {isCreatingTicket && (
              <form onSubmit={handleCreateTicket} className="p-5 rounded-xl bg-[#060D17] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0088FF]">Create New Support Ticket</h3>
                  <button type="button" onClick={() => setIsCreatingTicket(false)} className="text-xs text-slate-400 hover:text-white">
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Issue Category</label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs"
                    >
                      <option value="Delivery Issue">Delivery / Freight Issue</option>
                      <option value="Payment Issue">Payment / Verification Issue</option>
                      <option value="Product Issue">Product / Specification Issue</option>
                      <option value="Order Issue">Order Status Issue</option>
                      <option value="Complaint">Formal Complaint</option>
                      <option value="Question">General Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Order Reference (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. BW-104928"
                      value={newTicketOrderId}
                      onChange={(e) => setNewTicketOrderId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of the problem"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Detailed Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your issue with exact details, dates, or specifications..."
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs resize-y"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider"
                >
                  Submit Support Ticket
                </button>
              </form>
            )}

            {/* Active Ticket Thread */}
            {activeTicket ? (
              <div className="space-y-4">
                <button
                  onClick={() => setActiveTicket(null)}
                  className="text-xs text-[#0088FF] hover:underline"
                >
                  &larr; Back to all tickets
                </button>
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#38BDF8] block">{activeTicket.ticketNumber}</span>
                    <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">{activeTicket.subject}</h3>
                    <span className="text-[11px] text-slate-400">Category: {activeTicket.category}</span>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded bg-white/10 text-white font-bold">
                    {activeTicket.status}
                  </span>
                </div>

                {/* Conversation */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {activeTicket.replies.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl text-xs space-y-1 ${
                        r.senderRole === 'admin'
                          ? 'bg-[#0E2034] border border-[#0088FF]/30 ml-4'
                          : 'bg-[#060D17] border border-white/10 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <strong className={r.senderRole === 'admin' ? 'text-[#38BDF8]' : 'text-white'}>
                          {r.senderName} ({r.senderRole === 'admin' ? 'Dealership Agent' : 'You'})
                        </strong>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>

                {/* Ticket Reply Form */}
                <form onSubmit={handleSendTicketReply} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Reply to ticket..."
                    value={ticketReplyContent}
                    onChange={(e) => setTicketReplyContent(e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs focus:ring-1 focus:ring-[#0088FF]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              /* Ticket List */
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No open support tickets.</p>
                ) : (
                  tickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setActiveTicket(t)}
                      className="p-4 rounded-xl bg-[#060D17] border border-white/10 hover:border-[#0088FF]/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#0088FF]">{t.ticketNumber}</span>
                          <span className="text-xs font-bold text-white truncate max-w-xs">{t.subject}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {t.category} &bull; {t.replies.length} replies &bull; Updated{' '}
                          {new Date(t.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-950 text-emerald-300'
                            : t.status === 'OPEN'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PAYMENT HISTORY */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk'] mb-2">
              Payment &amp; Transaction Ledger
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Complete historical record of orders and payment verification submissions.
            </p>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No transactions recorded.</p>
            ) : (
              <div className="divide-y divide-white/10 text-xs">
                {orders.map((o) => (
                  <div key={o.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-mono text-xs">Order #{o.id}</strong>
                        <span className="text-slate-400">&bull; {o.paymentMethod}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{new Date(o.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">{formatMoney(o.total)}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          o.paymentStatus === 'PAID'
                            ? 'bg-emerald-950 text-emerald-300'
                            : o.paymentStatus === 'PAYMENT REJECTED'
                            ? 'bg-red-950 text-red-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
