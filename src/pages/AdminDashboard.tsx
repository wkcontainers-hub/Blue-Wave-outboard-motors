import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  Inbox,
  HelpCircle,
  CreditCard,
  Settings,
  Building,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  LogOut,
  Search,
  ExternalLink,
  Eye,
  ArrowLeft,
  Truck,
  Sparkles,
  Upload,
  X,
  Send,
  AlertCircle,
  DollarSign,
  Clock,
  Shield,
  RefreshCw,
  FileCheck,
  Layers,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PageId } from '../components/Header.tsx';
import { OutboardMotorListing, OutboardBrand, MotorCondition, ShaftLength, AdminStats } from '../types/inventory.ts';
import { getSafeImageUrl, handleImageError } from '../utils/imageUrl.ts';

interface AdminDashboardProps {
  onNavigate: (page: PageId) => void;
}

type AdminTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'customers'
  | 'inbox'
  | 'support'
  | 'payments'
  | 'edit_pages'
  | 'payment_settings'
  | 'business_settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    motors,
    businessInfo,
    pagesContent,
    refreshProducts,
    refreshBusinessInfo,
    refreshPagesContent,
    updatePageContent,
    addMotor,
    updateMotor,
    deleteMotor,
    toggleMotorAvailability,
    logout,
    formatMoney,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Stats & Recent Activity
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Products filters & modal
  const [productSearch, setProductSearch] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('All');
  const [isMotorModalOpen, setIsMotorModalOpen] = useState(false);
  const [editingMotorId, setEditingMotorId] = useState<string | null>(null);

  // Motor Form
  const initialMotorForm: Omit<OutboardMotorListing, 'id' | 'createdAt'> = {
    brand: 'Yamaha',
    model: '',
    horsepower: 150,
    year: 2024,
    condition: 'New',
    engineHours: 0,
    shaftLength: '25" (Extra Long)',
    fuelType: 'Gasoline 4-Stroke EFI',
    price: 15000,
    isCallForPrice: false,
    location: 'Dealership Yard',
    deliveryAvailable: true,
    availability: 'Available',
    stockCount: 1,
    productPhotos: [],
    description: '',
    specs: {},
    featured: false,
  };
  const [motorForm, setMotorForm] = useState(initialMotorForm);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Customers State
  const [customers, setCustomers] = useState<any[]>([]);

  // Inbox State
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<any | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Payment Verification Receipts State
  const [paymentReceipts, setPaymentReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Payment Settings State
  const [paymentConfig, setPaymentConfig] = useState<any>({ methods: [] });
  const [paymentConfigSaved, setPaymentConfigSaved] = useState(false);

  // Business Settings State
  const [bizForm, setBizForm] = useState<any>({ ...businessInfo });
  const [bizSaved, setBizSaved] = useState(false);

  // Edit Pages State
  const [selectedPageToEdit, setSelectedPageToEdit] = useState<'home' | 'about' | 'services'>('home');
  const [homeForm, setHomeForm] = useState<any>(pagesContent.home);
  const [aboutForm, setAboutForm] = useState<any>(pagesContent.about);
  const [servicesForm, setServicesForm] = useState<any>(pagesContent.services);
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [pageSaveSuccess, setPageSaveSuccess] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (pagesContent.home) setHomeForm(pagesContent.home);
    if (pagesContent.about) setAboutForm(pagesContent.about);
    if (pagesContent.services) setServicesForm(pagesContent.services);
  }, [pagesContent]);

  const uploadPageImage = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          });
          if (res.ok) {
            const data = await res.json();
            resolve(data.url);
          } else {
            resolve(base64);
          }
        } catch {
          resolve(base64);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveCurrentPage = async () => {
    setIsSavingPage(true);
    setPageSaveSuccess(null);
    let contentToSave;
    if (selectedPageToEdit === 'home') contentToSave = homeForm;
    else if (selectedPageToEdit === 'about') contentToSave = aboutForm;
    else contentToSave = servicesForm;

    const res = await updatePageContent(selectedPageToEdit, contentToSave);
    setIsSavingPage(false);
    if (res.success) {
      setPageSaveSuccess(`✓ Successfully published! The ${selectedPageToEdit.toUpperCase()} page is now live and persistent in the database.`);
      setTimeout(() => setPageSaveSuccess(null), 5000);
    } else {
      alert(`Error saving page: ${res.error || 'Unknown error'}`);
    }
  };

  // Helper for auth headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('bw_token')}`,
  });

  // Load Dashboard Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Could not load admin stats', e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Orders
  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.warn('Could not load orders', e);
    }
  };

  // Load Customers
  const loadCustomers = async () => {
    try {
      const res = await fetch('/api/admin/customers', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.warn('Could not load customers', e);
    }
  };

  // Load Inbox
  const loadInbox = async () => {
    try {
      const res = await fetch('/api/admin/inbox', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setInboxMessages(data);
      }
    } catch (e) {
      console.warn('Could not load inbox', e);
    }
  };

  // Load Support
  const loadSupport = async () => {
    try {
      const res = await fetch('/api/admin/support', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data);
      }
    } catch (e) {
      console.warn('Could not load support tickets', e);
    }
  };

  // Load Payment Receipts
  const loadReceipts = async () => {
    try {
      const res = await fetch('/api/admin/payments/receipts', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPaymentReceipts(data);
      }
    } catch (e) {
      console.warn('Could not load payment receipts', e);
    }
  };

  // Load Payment Settings
  const loadPaymentSettings = async () => {
    try {
      const res = await fetch('/api/admin/payments/settings', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setPaymentConfig(data);
      }
    } catch (e) {
      console.warn('Could not load payment settings', e);
    }
  };

  useEffect(() => {
    loadStats();
    loadOrders();
    loadCustomers();
    loadInbox();
    loadSupport();
    loadReceipts();
    loadPaymentSettings();
    setBizForm({ ...businessInfo });
  }, [businessInfo]);

  // Product Add / Edit Handlers
  const handleOpenAddMotor = () => {
    setEditingMotorId(null);
    setMotorForm(initialMotorForm);
    setPhotoInputUrl('');
    setIsMotorModalOpen(true);
  };

  const handleOpenEditMotor = (motor: OutboardMotorListing) => {
    setEditingMotorId(motor.id);
    setMotorForm({
      brand: motor.brand,
      model: motor.model,
      horsepower: motor.horsepower,
      year: motor.year,
      condition: motor.condition,
      engineHours: motor.engineHours ?? 0,
      shaftLength: motor.shaftLength,
      fuelType: motor.fuelType ?? 'Gasoline 4-Stroke EFI',
      price: motor.price ?? 0,
      isCallForPrice: motor.isCallForPrice ?? false,
      location: motor.location,
      deliveryAvailable: motor.deliveryAvailable,
      availability: motor.availability,
      stockCount: motor.stockCount ?? 1,
      productPhotos: motor.productPhotos || [],
      description: motor.description,
      specs: motor.specs || {},
      featured: motor.featured ?? false,
    });
    setPhotoInputUrl('');
    setIsMotorModalOpen(true);
  };

  const handleSaveMotor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motorForm.model.trim()) {
      alert('Model name is required');
      return;
    }

    if (editingMotorId) {
      await updateMotor(editingMotorId, motorForm);
    } else {
      await addMotor(motorForm);
    }
    setIsMotorModalOpen(false);
    loadStats();
  };

  const handleDeleteMotor = async (id: string, model: string) => {
    if (window.confirm(`Permanently delete "${model}" from the dealership database?`)) {
      await deleteMotor(id);
      loadStats();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMotorForm((prev) => ({
            ...prev,
            productPhotos: [...prev.productPhotos, event.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Review Payment Receipt Handler
  const handleReviewReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt) return;

    setReviewing(true);
    try {
      const res = await fetch(`/api/admin/payments/receipts/${selectedReceipt.id}/review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ decision: reviewDecision, adminNotes: reviewNotes }),
      });
      const data = await res.json();
      setReviewing(false);
      if (res.ok) {
        alert(data.message || 'Payment review completed');
        setSelectedReceipt(null);
        setReviewNotes('');
        loadReceipts();
        loadOrders();
        loadStats();
        refreshProducts();
      } else {
        alert(data.error || 'Review failed');
      }
    } catch {
      setReviewing(false);
      alert('Error reviewing payment receipt');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string, paymentStatus?: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      loadOrders();
      loadStats();
      refreshProducts();
    } catch (e) {
      console.warn('Failed to update order status', e);
    }
  };

  // Admin Reply to Inbox Message
  const handleAdminReplyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboxMsg || !adminReplyText.trim()) return;

    try {
      const res = await fetch(`/api/messages/${selectedInboxMsg.id}/reply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content: adminReplyText.trim() }),
      });
      if (res.ok) {
        setAdminReplyText('');
        loadInbox();
        setSelectedInboxMsg(null);
      }
    } catch (e) {
      console.warn('Failed to reply', e);
    }
  };

  // Admin Reply to Support Ticket
  const handleAdminReplyTicket = async (e: React.FormEvent, newStatus?: string) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;

    try {
      const res = await fetch(`/api/support/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content: ticketReplyText.trim(), newStatus }),
      });
      if (res.ok) {
        setTicketReplyText('');
        loadSupport();
        setSelectedTicket(null);
      }
    } catch (e) {
      console.warn('Failed to reply to ticket', e);
    }
  };

  // Save Payment Settings
  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/payments/settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(paymentConfig),
      });
      if (res.ok) {
        setPaymentConfigSaved(true);
        setTimeout(() => setPaymentConfigSaved(false), 3000);
      }
    } catch (e) {
      console.warn('Failed to save payment settings', e);
    }
  };

  // Save Business Settings
  const handleSaveBusinessSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings/business', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(bizForm),
      });
      if (res.ok) {
        setBizSaved(true);
        refreshBusinessInfo();
        setTimeout(() => setBizSaved(false), 3000);
      }
    } catch (e) {
      console.warn('Failed to save business settings', e);
    }
  };

  const filteredProducts = motors.filter((m) => {
    const q = productSearch.toLowerCase();
    const matchQ = !q || m.model.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q);
    const matchB = productBrandFilter === 'All' || m.brand === productBrandFilter;
    return matchQ && matchB;
  });

  return (
    <div className="w-full min-h-screen bg-[#050B14] text-white">
      {/* Top Navbar */}
      <div className="bg-[#07111D] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('shop')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#0088FF] font-['Cabinet_Grotesk']">
                  BLUEWAVE OUTBOARD MOTORS
                </span>
                <span className="text-[10px] bg-[#0088FF]/20 text-[#38BDF8] px-2 py-0.5 rounded font-mono font-bold">
                  MASTER DEALERSHIP CONTROL
                </span>
              </div>
              <h1 className="text-lg font-black text-white font-['Cabinet_Grotesk']">
                Executive Operations Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('shop')}
              className="px-3 py-1.5 rounded-lg bg-[#0E2034] hover:bg-[#152e4a] text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#0088FF]" />
              <span>View Public Store</span>
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-300 border border-red-800/40 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar border-t border-white/5 pt-1">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Sparkles },
            { id: 'products', label: `Products (${motors.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
            { id: 'payments', label: `Payment Verification (${paymentReceipts.filter((r) => r.status === 'Awaiting Verification').length})`, icon: FileCheck },
            { id: 'edit_pages', label: 'Edit Pages', icon: Layers },
            { id: 'inbox', label: `Inbox (${inboxMessages.filter((m) => m.status === 'UNREAD').length})`, icon: Inbox },
            { id: 'support', label: `Support Tickets (${supportTickets.filter((t) => t.status === 'OPEN').length})`, icon: HelpCircle },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'payment_settings', label: 'Payment Settings', icon: CreditCard },
            { id: 'business_settings', label: 'Business Settings', icon: Building },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setSelectedOrder(null);
                  setSelectedReceipt(null);
                  setSelectedInboxMsg(null);
                  setSelectedTicket(null);
                }}
                className={`py-2.5 px-3 sm:px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-[#0088FF] text-[#0088FF] bg-[#0088FF]/10'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ======================================================== */}
        {/* TAB: DASHBOARD OVERVIEW & CARDS */}
        {/* ======================================================== */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* 9 Summary Cards */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0088FF] mb-3">
                DEALERSHIP METRICS SNAPSHOT
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3.5">
                {[
                  { label: 'TOTAL PRODUCTS', val: stats.cards.totalProducts, color: 'text-white' },
                  { label: 'AVAILABLE', val: stats.cards.availableProducts, color: 'text-emerald-400' },
                  { label: 'SOLD', val: stats.cards.soldProducts, color: 'text-red-400' },
                  { label: 'TOTAL ORDERS', val: stats.cards.totalOrders, color: 'text-white' },
                  { label: 'PENDING ORDERS', val: stats.cards.pendingOrders, color: 'text-amber-400' },
                  { label: 'PAID ORDERS', val: stats.cards.paidOrders, color: 'text-emerald-400' },
                  { label: 'UNREAD INBOX', val: stats.cards.unreadMessages, color: 'text-[#0088FF]' },
                  { label: 'OPEN SUPPORT', val: stats.cards.openSupportTickets, color: 'text-purple-400' },
                  { label: 'RECEIPTS QUEUE', val: stats.cards.pendingReceipts, color: 'text-rose-400' },
                ].map((card, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#0B1826] border border-white/10 shadow-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      {card.label}
                    </span>
                    <span className={`text-2xl font-black font-mono mt-1 block ${card.color}`}>
                      {card.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Recent Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Orders */}
              <div className="lg:col-span-6 bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#0088FF]" />
                    <span>Recent Customer Orders</span>
                  </h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-[#0088FF] hover:underline">
                    View All &rarr;
                  </button>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  {stats.recent.orders.length === 0 ? (
                    <p className="py-6 text-slate-500 text-center">No orders recorded yet.</p>
                  ) : (
                    stats.recent.orders.map((o: any) => (
                      <div key={o.id} className="py-3 flex items-center justify-between">
                        <div>
                          <strong className="text-white block font-mono">#{o.id}</strong>
                          <span className="text-slate-400">{o.customer_name} &bull; {o.payment_method}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-mono font-bold block">{formatMoney(o.total)}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              o.payment_status === 'PAID' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {o.payment_status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Payment Receipts Queue */}
              <div className="lg:col-span-6 bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk'] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Recent Payment Verification Queue</span>
                  </h3>
                  <button onClick={() => setActiveTab('payments')} className="text-xs text-[#0088FF] hover:underline">
                    Manage Queue &rarr;
                  </button>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  {stats.recent.receipts.length === 0 ? (
                    <p className="py-6 text-slate-500 text-center">No payment receipts pending review.</p>
                  ) : (
                    stats.recent.receipts.map((r: any) => (
                      <div key={r.id} className="py-3 flex items-center justify-between">
                        <div>
                          <strong className="text-white block">Order #{r.order_id}</strong>
                          <span className="text-slate-400">{r.payment_method} &bull; {new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-mono font-bold block">{formatMoney(r.amount)}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              r.status === 'Approved'
                                ? 'bg-emerald-950 text-emerald-300'
                                : r.status === 'Rejected'
                                ? 'bg-red-950 text-red-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: PRODUCTS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0B1826] p-5 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Outboard Motor Catalog ({motors.length} Motors)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add, edit, upload photos, manage prices, and toggle Available/Sold statuses.
                </p>
              </div>

              <button
                onClick={handleOpenAddMotor}
                className="px-5 py-3 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#0088FF]/30 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Outboard Motor</span>
              </button>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Search model, horsepower, brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="px-3.5 py-2 rounded-lg bg-[#07111D] border border-white/10 text-white text-xs"
              />
              <select
                value={productBrandFilter}
                onChange={(e) => setProductBrandFilter(e.target.value)}
                className="px-3.5 py-2 rounded-lg bg-[#07111D] border border-white/10 text-white text-xs"
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

            {/* Motor Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((m) => {
                const isSold = m.availability === 'Sold';
                return (
                  <div
                    key={m.id}
                    className={`bg-[#0B1826] rounded-2xl overflow-hidden border flex flex-col justify-between ${
                      isSold ? 'border-white/5 opacity-80' : 'border-white/10 hover:border-[#0088FF]/50 shadow-xl'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-[#060D17]">
                        <img
                          src={getSafeImageUrl(m.productPhotos[0])}
                          alt={m.model}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageError(e)}
                        />
                        <div className="absolute top-2.5 left-2.5">
                          {isSold ? (
                            <span className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-black uppercase">
                              SOLD
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-bold uppercase">
                              AVAILABLE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-bold text-[#0088FF] uppercase">{m.brand}</span>
                          <span className="font-mono">{m.year}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mb-2">{m.model}</h4>
                        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
                          <span className="text-slate-400">{m.horsepower} HP &bull; {m.condition}</span>
                          <strong className="text-white font-mono">{m.isCallForPrice || !m.price ? 'Call' : formatMoney(m.price)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#07111D] border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleMotorAvailability(m.id, isSold ? 'Available' : 'Sold')}
                        className={`text-[11px] px-2.5 py-1.5 rounded-md font-semibold transition-colors ${
                          isSold ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {isSold ? 'Mark Available' : 'Mark Sold'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditMotor(m)}
                          className="p-1.5 rounded-md bg-white/5 hover:bg-[#0088FF] text-slate-300 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMotor(m.id, m.model)}
                          className="p-1.5 rounded-md bg-white/5 hover:bg-red-600 text-slate-300 hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: ORDERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0B1826] p-5 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Customer Orders ({orders.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update fulfillment statuses: NEW, PROCESSING, READY FOR DELIVERY, SHIPPED, DELIVERED, COMPLETED.
                </p>
              </div>
            </div>

            <div className="bg-[#0B1826] rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07111D] border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">Order #</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Payment Method</th>
                      <th className="p-3.5">Payment Status</th>
                      <th className="p-3.5">Fulfillment Status</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="p-3.5 font-mono font-bold text-white">{o.id}</td>
                        <td className="p-3.5">
                          <strong className="text-white block">{o.customerName}</strong>
                          <span className="text-[11px] text-slate-400">{o.email}</span>
                        </td>
                        <td className="p-3.5 max-w-xs truncate">
                          {o.items.map((i: any) => `${i.brand} ${i.model} (${i.quantity})`).join(', ')}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">{formatMoney(o.total)}</td>
                        <td className="p-3.5">{o.paymentMethod}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              o.paymentStatus === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300'
                                : o.paymentStatus === 'PAYMENT REJECTED'
                                ? 'bg-red-950 text-red-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="px-2 py-1 rounded bg-[#060D17] border border-white/10 text-white text-[11px]"
                          >
                            <option value="NEW">NEW</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="READY FOR DELIVERY">READY FOR DELIVERY</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="REFUNDED">REFUNDED</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 rounded bg-white/5 hover:bg-[#0088FF] text-white"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: PAYMENT VERIFICATION QUEUE */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0B1826] p-5 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Manual Payment Verification Queue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify submitted Bank Wire and Bitcoin transfer screenshots before approving orders as PAID.
                </p>
              </div>
            </div>

            {paymentReceipts.length === 0 ? (
              <p className="py-16 text-center text-slate-500 bg-[#0B1826] rounded-2xl border border-white/10">
                No payment receipts submitted yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentReceipts.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0B1826] rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <strong className="text-white font-mono">Order #{r.orderId}</strong>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            r.status === 'Approved'
                              ? 'bg-emerald-950 text-emerald-300'
                              : r.status === 'Rejected'
                              ? 'bg-red-950 text-red-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{r.customerName} &bull; {r.email}</p>
                      <p className="text-xs font-mono font-bold text-[#0099FF] mt-1">Amount: {formatMoney(r.amount)}</p>

                      {/* Receipt Image Thumbnail */}
                      <div className="mt-3 relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-white/10">
                        <img src={r.receiptImage} alt="Receipt proof" className="w-full h-full object-contain" />
                      </div>

                      {r.customerNotes && (
                        <p className="text-xs text-slate-400 mt-2 bg-[#060D17] p-2.5 rounded-lg border border-white/5">
                          "{r.customerNotes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          setSelectedReceipt(r);
                          setReviewDecision('approve');
                          setReviewNotes('');
                        }}
                        className="w-full py-2 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider"
                      >
                        Audit &amp; Verify Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: INBOX (CUSTOMER INQUIRIES) */}
        {/* ======================================================== */}
        {activeTab === 'inbox' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk'] pb-3 border-b border-white/10">
              Customer Messages &amp; Motor Inquiries ({inboxMessages.length})
            </h2>

            {selectedInboxMsg ? (
              <div className="space-y-4">
                <button onClick={() => setSelectedInboxMsg(null)} className="text-xs text-[#0088FF] hover:underline">
                  &larr; Back to all conversations
                </button>
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/10">
                  <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">{selectedInboxMsg.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customer: <strong className="text-white">{selectedInboxMsg.customerName}</strong> ({selectedInboxMsg.customerEmail})
                    {selectedInboxMsg.productName && ` • Motor: ${selectedInboxMsg.productName}`}
                  </p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedInboxMsg.replies.map((r: any) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl text-xs space-y-1 ${
                        r.senderRole === 'admin'
                          ? 'bg-[#0E2034] border border-[#0088FF]/30 mr-6'
                          : 'bg-[#060D17] border border-white/10 ml-6'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <strong className={r.senderRole === 'admin' ? 'text-[#38BDF8]' : 'text-white'}>
                          {r.senderName} ({r.senderRole === 'admin' ? 'Staff' : 'Customer'})
                        </strong>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAdminReplyMessage} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Type official reply to customer..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span>Send Reply</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {inboxMessages.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No messages in inbox.</p>
                ) : (
                  inboxMessages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedInboxMsg(m)}
                      className="p-4 rounded-xl bg-[#060D17] border border-white/10 hover:border-[#0088FF]/50 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-bold text-white">{m.subject}</strong>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                              m.status === 'UNREAD' ? 'bg-[#0088FF] text-white' : 'bg-white/10 text-slate-400'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          From: {m.customerName} &bull; {m.customerEmail}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">&rarr;</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: SUPPORT & COMPLAINTS */}
        {/* ======================================================== */}
        {activeTab === 'support' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk'] pb-3 border-b border-white/10">
              Formal Customer Support &amp; Complaints Tickets
            </h2>

            {selectedTicket ? (
              <div className="space-y-4">
                <button onClick={() => setSelectedTicket(null)} className="text-xs text-[#0088FF] hover:underline">
                  &larr; Back to all tickets
                </button>
                <div className="p-4 rounded-xl bg-[#060D17] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#38BDF8]">{selectedTicket.ticketNumber}</span>
                    <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">{selectedTicket.subject}</h3>
                    <p className="text-[11px] text-slate-400">
                      Category: {selectedTicket.category} &bull; From: {selectedTicket.customerName} ({selectedTicket.customerEmail})
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded bg-white/10 font-bold">{selectedTicket.status}</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedTicket.replies.map((r: any) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl text-xs space-y-1 ${
                        r.senderRole === 'admin'
                          ? 'bg-[#0E2034] border border-[#0088FF]/30 mr-6'
                          : 'bg-[#060D17] border border-white/10 ml-6'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <strong className={r.senderRole === 'admin' ? 'text-[#38BDF8]' : 'text-white'}>
                          {r.senderName} ({r.senderRole === 'admin' ? 'Staff' : 'Customer'})
                        </strong>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={(e) => handleAdminReplyTicket(e)} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter formal support reply to customer..."
                    value={ticketReplyText}
                    onChange={(e) => setTicketReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAdminReplyTicket(e, 'RESOLVED')}
                    className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider"
                  >
                    Mark Resolved
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">No support tickets.</p>
                ) : (
                  supportTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="p-4 rounded-xl bg-[#060D17] border border-white/10 hover:border-[#0088FF]/50 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#0088FF]">{t.ticketNumber}</span>
                          <strong className="text-xs text-white">{t.subject}</strong>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {t.category} &bull; Customer: {t.customerName} &bull; {t.replies.length} replies
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">{t.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: CUSTOMERS */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <div className="bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk'] pb-3 border-b border-white/10">
              Registered Customer Directory ({customers.length})
            </h2>

            <div className="divide-y divide-white/5 text-xs">
              {customers.map((c) => (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.full_name}</h3>
                    <p className="text-slate-400">{c.email} &bull; {c.phone || 'No phone'}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Delivery: {c.delivery_address ? `${c.delivery_address}, ${c.city}, ${c.state}` : 'Not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white font-bold block">{c.order_count} Orders</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Total Paid: {formatMoney(c.total_spend)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: PAYMENT SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'payment_settings' && (
          <div className="max-w-4xl mx-auto bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Modular Payment Methods Architecture
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure corporate bank accounts, public Bitcoin wallet addresses, and official PayPal credentials.
                </p>
              </div>
              {paymentConfigSaved && (
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-600/50">
                  Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSavePaymentConfig} className="space-y-6">
              {paymentConfig.methods.map((method: any, idx: number) => (
                <div key={method.id} className="p-5 rounded-xl bg-[#060D17] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{method.name}</h3>
                      <p className="text-xs text-slate-400">{method.description}</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={method.enabled}
                        onChange={(e) => {
                          const copy = [...paymentConfig.methods];
                          copy[idx].enabled = e.target.checked;
                          setPaymentConfig({ ...paymentConfig, methods: copy });
                        }}
                        className="w-4 h-4 rounded text-[#0088FF]"
                      />
                      <span className="font-semibold text-white">Enable Method</span>
                    </label>
                  </div>

                  {/* Bank Transfer Config */}
                  {method.id === 'bank_transfer' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-white/5">
                      <div>
                        <label className="block text-slate-400 mb-1">Beneficiary Name</label>
                        <input
                          type="text"
                          value={method.config.beneficiaryName}
                          onChange={(e) => {
                            const copy = [...paymentConfig.methods];
                            copy[idx].config.beneficiaryName = e.target.value;
                            setPaymentConfig({ ...paymentConfig, methods: copy });
                          }}
                          className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={method.config.accountNumber}
                          onChange={(e) => {
                            const copy = [...paymentConfig.methods];
                            copy[idx].config.accountNumber = e.target.value;
                            setPaymentConfig({ ...paymentConfig, methods: copy });
                          }}
                          className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={method.config.bankName}
                          onChange={(e) => {
                            const copy = [...paymentConfig.methods];
                            copy[idx].config.bankName = e.target.value;
                            setPaymentConfig({ ...paymentConfig, methods: copy });
                          }}
                          className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Routing Number</label>
                        <input
                          type="text"
                          value={method.config.routingNumber}
                          onChange={(e) => {
                            const copy = [...paymentConfig.methods];
                            copy[idx].config.routingNumber = e.target.value;
                            setPaymentConfig({ ...paymentConfig, methods: copy });
                          }}
                          className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 mb-1">Bank Address</label>
                        <input
                          type="text"
                          value={`${method.config.address}, ${method.config.city}, ${method.config.state} ${method.config.postalCode}`}
                          onChange={(e) => {
                            const copy = [...paymentConfig.methods];
                            copy[idx].config.address = e.target.value;
                            setPaymentConfig({ ...paymentConfig, methods: copy });
                          }}
                          className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bitcoin Config */}
                  {method.id === 'bitcoin' && (
                    <div className="pt-2 border-t border-white/5 text-xs">
                      <label className="block text-slate-400 mb-1">Public Bitcoin Wallet Address</label>
                      <input
                        type="text"
                        value={method.config.walletAddress}
                        onChange={(e) => {
                          const copy = [...paymentConfig.methods];
                          copy[idx].config.walletAddress = e.target.value;
                          setPaymentConfig({ ...paymentConfig, methods: copy });
                        }}
                        className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white font-mono text-xs"
                      />
                    </div>
                  )}

                  {/* PayPal Config */}
                  {method.id === 'paypal' && (
                    <div className="pt-2 border-t border-white/5 text-xs space-y-2">
                      <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
                        Status: <strong>PAYPAL — NOT CONNECTED</strong>. Enter valid PayPal Client ID &amp; Secret below once business account is ready.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">PayPal Client ID</label>
                          <input
                            type="text"
                            placeholder="Enter Client ID"
                            value={method.config?.clientId || ''}
                            onChange={(e) => {
                              const copy = [...paymentConfig.methods];
                              copy[idx].config.clientId = e.target.value;
                              setPaymentConfig({ ...paymentConfig, methods: copy });
                            }}
                            className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">PayPal Client Secret</label>
                          <input
                            type="password"
                            placeholder="Enter Client Secret"
                            value={method.config?.clientSecret || ''}
                            onChange={(e) => {
                              const copy = [...paymentConfig.methods];
                              copy[idx].config.clientSecret = e.target.value;
                              setPaymentConfig({ ...paymentConfig, methods: copy });
                            }}
                            className="w-full px-3 py-2 rounded bg-[#0B1826] border border-white/10 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Payment Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: BUSINESS SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'business_settings' && (
          <div className="max-w-4xl mx-auto bg-[#0B1826] rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white font-['Cabinet_Grotesk']">
                  Dealership Contact &amp; Business Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Centrally updates phone, email, address, operating hours, and currency across all pages.
                </p>
              </div>
              {bizSaved && (
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-600/50">
                  Updated Live!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBusinessSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={bizForm.businessName}
                    onChange={(e) => setBizForm({ ...bizForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={bizForm.tagline}
                    onChange={(e) => setBizForm({ ...bizForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Primary Phone</label>
                  <input
                    type="text"
                    required
                    value={bizForm.phone}
                    onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Secondary Phone</label>
                  <input
                    type="text"
                    value={bizForm.secondaryPhone}
                    onChange={(e) => setBizForm({ ...bizForm, secondaryPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={bizForm.whatsapp}
                    onChange={(e) => setBizForm({ ...bizForm, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Dealership Email</label>
                <input
                  type="email"
                  required
                  value={bizForm.email}
                  onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={bizForm.address}
                  onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={bizForm.city}
                    onChange={(e) => setBizForm({ ...bizForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={bizForm.state}
                    onChange={(e) => setBizForm({ ...bizForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={bizForm.zipCode}
                    onChange={(e) => setBizForm({ ...bizForm, zipCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Currency Code (Default USD)</label>
                <input
                  type="text"
                  disabled
                  value="USD ($)"
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-slate-400 text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Business Information</span>
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: EDIT PAGES (HOME, ABOUT US, SERVICES) */}
        {/* ======================================================== */}
        {activeTab === 'edit_pages' && (
          <div className="space-y-8">
            {/* Top Bar with Page Selector and Actions */}
            <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#0088FF] uppercase tracking-wider block mb-1">
                  WEBSITE CONTENT MANAGEMENT
                </span>
                <h2 className="text-2xl font-black text-white font-['Cabinet_Grotesk']">
                  Edit Website Pages
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize headings, text descriptions, call-to-actions, and ultra-realistic photography. Changes persist permanently in the database.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-[#060D17] hover:bg-[#102135] text-slate-200 hover:text-white text-xs font-bold border border-white/10 hover:border-[#0088FF]/50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Eye className="w-4 h-4 text-[#0088FF]" />
                  <span>Preview Changes</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingPage}
                  onClick={handleSaveCurrentPage}
                  className="px-5 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#0088FF]/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingPage ? 'Publishing...' : 'Save & Publish Changes'}</span>
                </button>
              </div>
            </div>

            {/* Success notification */}
            {pageSaveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{pageSaveSuccess}</span>
              </div>
            )}

            {/* Page Sub-Tabs (Home, About Us, Services) */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              {[
                { id: 'home', label: 'Home Page' },
                { id: 'about', label: 'About Us Page' },
                { id: 'services', label: 'Services Page' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPageToEdit(p.id as any)}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    selectedPageToEdit === p.id
                      ? 'bg-[#0088FF] text-white shadow-md shadow-[#0088FF]/20'
                      : 'bg-[#0B1826] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* ---------------------------------------------------- */}
            {/* 1. HOME PAGE EDIT FORM */}
            {/* ---------------------------------------------------- */}
            {selectedPageToEdit === 'home' && homeForm && (
              <div className="space-y-6">
                {/* Hero Section Card */}
                <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF] flex items-center gap-2">
                    <span>1. Hero Banner &amp; Primary Call-to-Action</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Small Top Badge</label>
                      <input
                        type="text"
                        value={homeForm.heroBadge || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, heroBadge: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Prefix</label>
                      <input
                        type="text"
                        value={homeForm.heroTitle || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, heroTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Highlight (Gradient Blue)</label>
                      <input
                        type="text"
                        value={homeForm.heroHighlight || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, heroHighlight: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-bold text-[#0099FF]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Button</label>
                        <input
                          type="text"
                          value={homeForm.primaryCtaText || ''}
                          onChange={(e) => setHomeForm({ ...homeForm, primaryCtaText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary Button</label>
                        <input
                          type="text"
                          value={homeForm.secondaryCtaText || ''}
                          onChange={(e) => setHomeForm({ ...homeForm, secondaryCtaText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Supporting Text / Subtitle</label>
                    <textarea
                      rows={2}
                      value={homeForm.heroSubtitle || ''}
                      onChange={(e) => setHomeForm({ ...homeForm, heroSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                    />
                  </div>

                  {/* Hero Background Image */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Background Image</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                        <img
                          src={getSafeImageUrl(homeForm.heroImage, '/images/hero_outboard_boat_1791036528701.jpg')}
                          alt="Hero background"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, '/images/hero_outboard_boat_1791036528701.jpg')}
                        />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={homeForm.heroImage || ''}
                          onChange={(e) => setHomeForm({ ...homeForm, heroImage: e.target.value })}
                          placeholder="Image URL or local asset path..."
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                        />
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-semibold cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Replacement Hero Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadPageImage(file);
                                if (url) setHomeForm({ ...homeForm, heroImage: url });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Points Bar */}
                <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF]">
                    2. Feature Highlights Strip (4 Highlights)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(homeForm.featurePoints || []).map((pt: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#060D17] border border-white/5 space-y-2">
                        <span className="text-[10px] font-mono text-[#0088FF] uppercase block">Item #{idx + 1}</span>
                        <input
                          type="text"
                          value={pt.title}
                          onChange={(e) => {
                            const updated = [...homeForm.featurePoints];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setHomeForm({ ...homeForm, featurePoints: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0B1826] border border-white/10 text-white text-xs font-bold"
                          placeholder="Title"
                        />
                        <input
                          type="text"
                          value={pt.subtitle}
                          onChange={(e) => {
                            const updated = [...homeForm.featurePoints];
                            updated[idx] = { ...updated[idx], subtitle: e.target.value };
                            setHomeForm({ ...homeForm, featurePoints: updated });
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-[#0B1826] border border-white/10 text-slate-300 text-xs"
                          placeholder="Subtitle"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commitment Section */}
                <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF]">
                    3. The BlueWave Commitment Section
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Badge</label>
                      <input
                        type="text"
                        value={homeForm.commitmentBadge || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, commitmentBadge: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                      <input
                        type="text"
                        value={homeForm.commitmentTitle || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, commitmentTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Highlight</label>
                      <input
                        type="text"
                        value={homeForm.commitmentHighlight || ''}
                        onChange={(e) => setHomeForm({ ...homeForm, commitmentHighlight: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-bold text-[#0099FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Commitment Statement</label>
                    <textarea
                      rows={3}
                      value={homeForm.commitmentText || ''}
                      onChange={(e) => setHomeForm({ ...homeForm, commitmentText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                    />
                  </div>
                </div>

                {/* In-Demand Repower Showcase Card */}
                {homeForm.repowerCard && (
                  <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF]">
                      4. In-Demand Repower Showcase Card
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Tag</label>
                        <input
                          type="text"
                          value={homeForm.repowerCard.tag || ''}
                          onChange={(e) =>
                            setHomeForm({
                              ...homeForm,
                              repowerCard: { ...homeForm.repowerCard, tag: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Power Range</label>
                        <input
                          type="text"
                          value={homeForm.repowerCard.powerRange || ''}
                          onChange={(e) =>
                            setHomeForm({
                              ...homeForm,
                              repowerCard: { ...homeForm.repowerCard, powerRange: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Card CTA Label</label>
                        <input
                          type="text"
                          value={homeForm.repowerCard.ctaText || ''}
                          onChange={(e) =>
                            setHomeForm({
                              ...homeForm,
                              repowerCard: { ...homeForm.repowerCard, ctaText: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Card Title</label>
                      <input
                        type="text"
                        value={homeForm.repowerCard.title || ''}
                        onChange={(e) =>
                          setHomeForm({
                            ...homeForm,
                            repowerCard: { ...homeForm.repowerCard, title: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Card Description</label>
                      <textarea
                        rows={2}
                        value={homeForm.repowerCard.desc || ''}
                        onChange={(e) =>
                          setHomeForm({
                            ...homeForm,
                            repowerCard: { ...homeForm.repowerCard, desc: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Card Photograph</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="relative w-40 h-28 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                          <img
                            src={getSafeImageUrl(homeForm.repowerCard.image, '/images/about_outboard_motor_1791036540139.jpg')}
                            alt="Repower motor"
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, '/images/about_outboard_motor_1791036540139.jpg')}
                          />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="text"
                            value={homeForm.repowerCard.image || ''}
                            onChange={(e) =>
                              setHomeForm({
                                ...homeForm,
                                repowerCard: { ...homeForm.repowerCard, image: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                          />
                          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-semibold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Replacement Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await uploadPageImage(file);
                                  if (url)
                                    setHomeForm({
                                      ...homeForm,
                                      repowerCard: { ...homeForm.repowerCard, image: url },
                                    });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 2. ABOUT US PAGE EDIT FORM */}
            {/* ---------------------------------------------------- */}
            {selectedPageToEdit === 'about' && aboutForm && (
              <div className="space-y-6">
                <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF]">
                    About Us Main Content &amp; Headlines
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Top Badge</label>
                      <input
                        type="text"
                        value={aboutForm.badge || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Prefix</label>
                      <input
                        type="text"
                        value={aboutForm.title || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Highlight</label>
                      <input
                        type="text"
                        value={aboutForm.titleHighlight || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, titleHighlight: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-bold text-[#0099FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Intro Subtitle</label>
                      <textarea
                        rows={2}
                        value={aboutForm.subtitle || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CTA Button Label</label>
                      <input
                        type="text"
                        value={aboutForm.ctaText || ''}
                        onChange={(e) => setAboutForm({ ...aboutForm, ctaText: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Dealership Value Points (4 Bullets)</label>
                    <div className="space-y-2">
                      {(aboutForm.bullets || []).map((bullet: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-5 text-center text-xs font-mono text-slate-400">#{idx + 1}</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...aboutForm.bullets];
                              updated[idx] = e.target.value;
                              setAboutForm({ ...aboutForm, bullets: updated });
                            }}
                            className="flex-1 px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Showcase Outboard Photo */}
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Main Showcase Outboard Photograph</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="relative w-48 h-36 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                        <img
                          src={getSafeImageUrl(aboutForm.image, '/images/about_outboard_motor_1791036540139.jpg')}
                          alt="About showcase"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, '/images/about_outboard_motor_1791036540139.jpg')}
                        />
                      </div>
                      <div className="flex-1 w-full space-y-3">
                        <input
                          type="text"
                          value={aboutForm.image || ''}
                          onChange={(e) => setAboutForm({ ...aboutForm, image: e.target.value })}
                          placeholder="Image URL or local path..."
                          className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                        />
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-semibold cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Replacement Photograph</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadPageImage(file);
                                if (url) setAboutForm({ ...aboutForm, image: url });
                              }
                            }}
                          />
                        </label>

                        {/* Overlay Badge texts */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                          <div>
                            <label className="block text-[10px] text-slate-400">Badge Title</label>
                            <input
                              type="text"
                              value={aboutForm.badgeOverlayTitle || ''}
                              onChange={(e) => setAboutForm({ ...aboutForm, badgeOverlayTitle: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-[#060D17] border border-white/10 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">Badge Subtitle</label>
                            <input
                              type="text"
                              value={aboutForm.badgeOverlayDesc || ''}
                              onChange={(e) => setAboutForm({ ...aboutForm, badgeOverlayDesc: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-[#060D17] border border-white/10 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400">Badge Tag</label>
                            <input
                              type="text"
                              value={aboutForm.badgeOverlayTag || ''}
                              onChange={(e) => setAboutForm({ ...aboutForm, badgeOverlayTag: e.target.value })}
                              className="w-full px-2 py-1 rounded bg-[#060D17] border border-white/10 text-white text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 3. SERVICES PAGE EDIT FORM */}
            {/* ---------------------------------------------------- */}
            {selectedPageToEdit === 'services' && servicesForm && (
              <div className="space-y-6">
                <div className="bg-[#0B1826] rounded-2xl p-6 border border-white/10 shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF]">
                    Services Page Header
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Top Badge</label>
                      <input
                        type="text"
                        value={servicesForm.badge || ''}
                        onChange={(e) => setServicesForm({ ...servicesForm, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Prefix</label>
                      <input
                        type="text"
                        value={servicesForm.title || ''}
                        onChange={(e) => setServicesForm({ ...servicesForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Highlight</label>
                      <input
                        type="text"
                        value={servicesForm.titleHighlight || ''}
                        onChange={(e) => setServicesForm({ ...servicesForm, titleHighlight: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-bold text-[#0099FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Header Subtitle</label>
                    <textarea
                      rows={2}
                      value={servicesForm.subtitle || ''}
                      onChange={(e) => setServicesForm({ ...servicesForm, subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                    />
                  </div>
                </div>

                {/* 3 Service Cards */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Cabinet_Grotesk'] text-[#0088FF]">
                    The 3 Dealership Service Offerings
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {(servicesForm.serviceCards || []).map((card: any, idx: number) => (
                      <div key={card.id || idx} className="bg-[#0B1826] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono font-bold text-[#0088FF] uppercase block">
                            Service Card #{idx + 1} ({card.id})
                          </span>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Service Title</label>
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => {
                                const updated = [...servicesForm.serviceCards];
                                updated[idx] = { ...updated[idx], title: e.target.value };
                                setServicesForm({ ...servicesForm, serviceCards: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={card.desc}
                              onChange={(e) => {
                                const updated = [...servicesForm.serviceCards];
                                updated[idx] = { ...updated[idx], desc: e.target.value };
                                setServicesForm({ ...servicesForm, serviceCards: updated });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                            />
                          </div>

                          {/* Image preview & upload */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Service Photograph</label>
                            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/15 bg-black mb-2">
                              <img
                                src={getSafeImageUrl(card.image, '/images/service_outboard_engine_1791036551185.jpg')}
                                alt={card.title}
                                className="w-full h-full object-cover"
                                onError={(e) => handleImageError(e, '/images/service_outboard_engine_1791036551185.jpg')}
                              />
                            </div>
                            <input
                              type="text"
                              value={card.image}
                              onChange={(e) => {
                                const updated = [...servicesForm.serviceCards];
                                updated[idx] = { ...updated[idx], image: e.target.value };
                                setServicesForm({ ...servicesForm, serviceCards: updated });
                              }}
                              className="w-full px-2.5 py-1 rounded bg-[#060D17] border border-white/10 text-white text-[11px] font-mono mb-2"
                            />
                            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0E2034] hover:bg-[#0088FF] text-white text-[11px] font-semibold cursor-pointer transition-colors">
                              <Upload className="w-3 h-3" />
                              <span>Upload Card Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadPageImage(file);
                                    if (url) {
                                      const updated = [...servicesForm.serviceCards];
                                      updated[idx] = { ...updated[idx], image: url };
                                      setServicesForm({ ...servicesForm, serviceCards: updated });
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Action Button & Page */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Action Button</label>
                              <input
                                type="text"
                                value={card.actionText}
                                onChange={(e) => {
                                  const updated = [...servicesForm.serviceCards];
                                  updated[idx] = { ...updated[idx], actionText: e.target.value };
                                  setServicesForm({ ...servicesForm, serviceCards: updated });
                                }}
                                className="w-full px-2 py-1 rounded bg-[#060D17] border border-white/10 text-white text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-1">Target Page</label>
                              <select
                                value={card.actionPage || 'shop'}
                                onChange={(e) => {
                                  const updated = [...servicesForm.serviceCards];
                                  updated[idx] = { ...updated[idx], actionPage: e.target.value };
                                  setServicesForm({ ...servicesForm, serviceCards: updated });
                                }}
                                className="w-full px-2 py-1 rounded bg-[#060D17] border border-white/10 text-white text-xs"
                              >
                                <option value="shop">Shop</option>
                                <option value="contact">Contact</option>
                                <option value="order">Order Request</option>
                              </select>
                            </div>
                          </div>

                          {/* Bullets */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-300 mb-1">Key Bullets (3 items)</label>
                            <div className="space-y-1.5">
                              {(card.bullets || []).map((b: string, bIdx: number) => (
                                <input
                                  key={bIdx}
                                  type="text"
                                  value={b}
                                  onChange={(e) => {
                                    const updated = [...servicesForm.serviceCards];
                                    const cardBullets = [...updated[idx].bullets];
                                    cardBullets[bIdx] = e.target.value;
                                    updated[idx] = { ...updated[idx], bullets: cardBullets };
                                    setServicesForm({ ...servicesForm, serviceCards: updated });
                                  }}
                                  className="w-full px-2 py-1 rounded bg-[#060D17] border border-white/10 text-slate-200 text-xs"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Floating Save Button Bar */}
            <div className="sticky bottom-4 z-20 bg-[#0B1826]/95 backdrop-blur-md p-4 rounded-xl border border-white/15 shadow-2xl flex items-center justify-between">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0088FF] animate-pulse"></span>
                <span>Editing: <strong className="text-white uppercase">{selectedPageToEdit} Page</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0088FF]" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  disabled={isSavingPage}
                  onClick={handleSaveCurrentPage}
                  className="px-6 py-2 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#0088FF]/30 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingPage ? 'Publishing...' : 'Save & Publish Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL: AUDIT & VERIFY PAYMENT RECEIPT */}
      {/* ======================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1826] rounded-2xl border border-white/15 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-xs font-mono font-bold text-[#0088FF]">PAYMENT VERIFICATION AUDIT</span>
                <h3 className="text-xl font-bold text-white font-['Cabinet_Grotesk']">
                  Order #{selectedReceipt.orderId} &bull; {selectedReceipt.paymentMethod}
                </h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Receipt Proof Screenshot */}
            <div className="mb-5 bg-[#060D17] rounded-xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Customer Uploaded Receipt Proof
              </span>
              <img
                src={selectedReceipt.receiptImage}
                alt="Submitted receipt"
                className="max-h-96 w-full object-contain rounded bg-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#060D17] p-3 rounded-lg border border-white/5 mb-5 font-mono">
              <div>Customer: <strong className="text-white">{selectedReceipt.customerName}</strong></div>
              <div>Email: <strong className="text-white">{selectedReceipt.email}</strong></div>
              <div>Phone: <strong className="text-white">{selectedReceipt.phone}</strong></div>
              <div>Amount: <strong className="text-[#0088FF]">{formatMoney(selectedReceipt.amount)}</strong></div>
            </div>

            <form onSubmit={handleReviewReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Verification Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('approve')}
                    className={`py-3 rounded-lg font-bold text-xs uppercase tracking-wider border flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'approve'
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-[#060D17] border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('reject')}
                    className={`py-3 rounded-lg font-bold text-xs uppercase tracking-wider border flex items-center justify-center gap-1.5 ${
                      reviewDecision === 'reject'
                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30'
                        : 'bg-[#060D17] border-white/10 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Payment</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {reviewDecision === 'approve' ? 'Internal Approval Notes (Optional)' : 'Rejection Reason (Sent to Customer)'}
                </label>
                <textarea
                  rows={2}
                  required={reviewDecision === 'reject'}
                  placeholder={
                    reviewDecision === 'approve'
                      ? 'e.g. Lead Bank wire confirmed in business account #210051969790'
                      : 'e.g. Wire transfer reference could not be matched. Please confirm exact amount and re-upload.'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30"
                >
                  {reviewing ? 'Processing...' : 'Confirm Audit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT MOTOR */}
      {/* ======================================================== */}
      {isMotorModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1826] rounded-2xl border border-white/15 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 animate-in zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0088FF]">
                  {editingMotorId ? 'EDIT MOTOR LISTING' : 'NEW OUTBOARD MOTOR LISTING'}
                </span>
                <h3 className="text-xl font-bold text-white font-['Cabinet_Grotesk']">
                  {editingMotorId ? `Edit ${motorForm.model || 'Motor'}` : 'Add Outboard Motor'}
                </h3>
              </div>
              <button onClick={() => setIsMotorModalOpen(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveMotor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand *</label>
                  <select
                    value={motorForm.brand}
                    onChange={(e) => setMotorForm({ ...motorForm, brand: e.target.value as OutboardBrand })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  >
                    <option value="Yamaha">Yamaha</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Honda">Honda</option>
                    <option value="Mercury">Mercury</option>
                    <option value="Tohatsu">Tohatsu</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. F250XSB Offshore 4.2L V6"
                    value={motorForm.model}
                    onChange={(e) => setMotorForm({ ...motorForm, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Horsepower (HP) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="600"
                    value={motorForm.horsepower}
                    onChange={(e) => setMotorForm({ ...motorForm, horsepower: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={motorForm.year}
                    onChange={(e) => setMotorForm({ ...motorForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
                  <select
                    value={motorForm.condition}
                    onChange={(e) => setMotorForm({ ...motorForm, condition: e.target.value as MotorCondition })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  >
                    <option value="New">New</option>
                    <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={motorForm.engineHours}
                    onChange={(e) => setMotorForm({ ...motorForm, engineHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shaft Length</label>
                  <select
                    value={motorForm.shaftLength}
                    onChange={(e) => setMotorForm({ ...motorForm, shaftLength: e.target.value as ShaftLength })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  >
                    <option value='15" (Short)'>15" (Short)</option>
                    <option value='20" (Long)'>20" (Long)</option>
                    <option value='25" (Extra Long)'>25" (Extra Long)</option>
                    <option value='30" (Ultra Long)'>30" (Ultra Long)</option>
                    <option value="Other / Custom">Other / Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (USD $)</label>
                  <input
                    type="number"
                    disabled={motorForm.isCallForPrice}
                    value={motorForm.price}
                    onChange={(e) => setMotorForm({ ...motorForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="callForPriceCheck"
                    checked={motorForm.isCallForPrice}
                    onChange={(e) => setMotorForm({ ...motorForm, isCallForPrice: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0088FF]"
                  />
                  <label htmlFor="callForPriceCheck" className="text-xs text-slate-300 cursor-pointer">
                    Call for Price
                  </label>
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Photos ({motorForm.productPhotos.length})</label>
                <div className="flex gap-2 mb-2">
                  <label className="px-3 py-1.5 rounded-lg bg-[#0E2034] hover:bg-[#0088FF] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL..."
                    value={photoInputUrl}
                    onChange={(e) => setPhotoInputUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (photoInputUrl.trim()) {
                        setMotorForm({ ...motorForm, productPhotos: [...motorForm.productPhotos, photoInputUrl.trim()] });
                        setPhotoInputUrl('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs"
                  >
                    Add URL
                  </button>
                </div>
                {motorForm.productPhotos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {motorForm.productPhotos.map((p, idx) => (
                      <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setMotorForm({ ...motorForm, productPhotos: motorForm.productPhotos.filter((_, i) => i !== idx) })}
                          className="absolute inset-0 bg-red-900/80 text-white opacity-0 hover:opacity-100 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={motorForm.description}
                  onChange={(e) => setMotorForm({ ...motorForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#060D17] border border-white/10 text-white text-xs resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMotorModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30"
                >
                  {editingMotorId ? 'Save Changes' : 'Publish Motor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LIVE PAGE PREVIEW */}
      {/* ======================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex flex-col p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="max-w-6xl w-full mx-auto bg-[#050B14] rounded-2xl border border-white/20 shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Preview Toolbar */}
            <div className="bg-[#0B1826] px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Cabinet_Grotesk']">
                    Live Preview: <span className="text-[#0088FF] uppercase">{selectedPageToEdit} Page</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Previewing unsaved draft state before publishing to database
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-[#060D17] rounded-lg p-0.5 border border-white/10">
                  {(['home', 'about', 'services'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPageToEdit(p)}
                      className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors ${
                        selectedPageToEdit === p
                          ? 'bg-[#0088FF] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveCurrentPage();
                    setIsPreviewOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Content Area */}
            <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-8 bg-[#050B14]">
              {selectedPageToEdit === 'home' && homeForm && (
                <div className="space-y-8">
                  {/* Hero preview */}
                  <div className="relative rounded-2xl overflow-hidden min-h-[380px] flex items-center p-8 bg-[#050B14] border border-white/10">
                    <img
                      src={getSafeImageUrl(homeForm.heroImage, '/images/hero_outboard_boat_1791036528701.jpg')}
                      alt="Hero preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => handleImageError(e, '/images/hero_outboard_boat_1791036528701.jpg')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/85 to-[#050B14]/65" />
                    <div className="relative z-10 max-w-xl text-left">
                      <span className="text-xs font-bold text-[#0088FF] uppercase tracking-[0.2em] block mb-2">
                        {homeForm.heroBadge}
                      </span>
                      <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3 font-['Cabinet_Grotesk']">
                        {homeForm.heroTitle}{' '}
                        <span className="text-[#0099FF]">{homeForm.heroHighlight}</span>
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                        {homeForm.heroSubtitle}
                      </p>
                      <div className="flex gap-3">
                        <button className="px-5 py-2.5 rounded-lg bg-[#0088FF] text-white text-xs font-bold uppercase tracking-wider">
                          {homeForm.primaryCtaText}
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-[#0B1826] border border-white/10 text-white text-xs font-bold">
                          {homeForm.secondaryCtaText}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature points preview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#081320] border border-white/5">
                    {(homeForm.featurePoints || []).map((pt: any, idx: number) => (
                      <div key={idx} className="p-2">
                        <h4 className="text-xs font-bold uppercase text-white font-['Cabinet_Grotesk']">{pt.title}</h4>
                        <p className="text-[11px] text-slate-400">{pt.subtitle}</p>
                      </div>
                    ))}
                  </div>

                  {/* Commitment preview */}
                  <div className="p-6 rounded-2xl bg-[#0B1826] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <span className="text-xs text-[#0088FF] font-bold uppercase tracking-wider block mb-1">
                        {homeForm.commitmentBadge}
                      </span>
                      <h3 className="text-xl font-black text-white mb-3 font-['Cabinet_Grotesk']">
                        {homeForm.commitmentTitle} <span className="text-[#0099FF]">{homeForm.commitmentHighlight}</span>
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{homeForm.commitmentText}</p>
                    </div>
                    {homeForm.repowerCard && (
                      <div className="rounded-xl overflow-hidden bg-[#060D17] border border-white/10 p-4 flex gap-4 items-center">
                        <img
                          src={getSafeImageUrl(homeForm.repowerCard.image, '/images/about_outboard_motor_1791036540139.jpg')}
                          alt=""
                          className="w-24 h-20 rounded-lg object-cover"
                          onError={(e) => handleImageError(e, '/images/about_outboard_motor_1791036540139.jpg')}
                        />
                        <div>
                          <span className="text-[10px] text-[#0088FF] font-mono font-bold uppercase block">
                            {homeForm.repowerCard.tag} ({homeForm.repowerCard.powerRange})
                          </span>
                          <h4 className="text-xs font-bold text-white mb-1 font-['Cabinet_Grotesk']">
                            {homeForm.repowerCard.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">{homeForm.repowerCard.desc}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedPageToEdit === 'about' && aboutForm && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6 rounded-2xl bg-[#0B1826] border border-white/10">
                    <div>
                      <span className="text-xs text-[#0088FF] font-bold uppercase tracking-wider block mb-1">
                        {aboutForm.badge}
                      </span>
                      <h2 className="text-3xl font-black text-white mb-3 font-['Cabinet_Grotesk']">
                        {aboutForm.title} <span className="text-[#0099FF]">{aboutForm.titleHighlight}</span>
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{aboutForm.subtitle}</p>
                      <div className="space-y-2 mb-6">
                        {(aboutForm.bullets || []).map((b: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF]"></span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                      <button className="px-5 py-2.5 rounded-lg bg-[#0088FF] text-white text-xs font-bold">
                        {aboutForm.ctaText}
                      </button>
                    </div>

                    <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-white/10">
                      <img
                        src={getSafeImageUrl(aboutForm.image, '/images/about_outboard_motor_1791036540139.jpg')}
                        alt="About preview"
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, '/images/about_outboard_motor_1791036540139.jpg')}
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-white block">{aboutForm.badgeOverlayTitle}</strong>
                          <span className="text-[10px] text-slate-300">{aboutForm.badgeOverlayDesc}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#0088FF] bg-[#0088FF]/15 px-2 py-0.5 rounded">
                          {aboutForm.badgeOverlayTag}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPageToEdit === 'services' && servicesForm && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto mb-6">
                    <span className="text-xs text-[#0088FF] font-bold uppercase tracking-wider block mb-1">
                      {servicesForm.badge}
                    </span>
                    <h2 className="text-2xl font-black text-white mb-2 font-['Cabinet_Grotesk']">
                      {servicesForm.title} <span className="text-[#0099FF]">{servicesForm.titleHighlight}</span>
                    </h2>
                    <p className="text-xs text-slate-300">{servicesForm.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(servicesForm.serviceCards || []).map((card: any, idx: number) => (
                      <div key={idx} className="rounded-xl overflow-hidden bg-[#0B1826] border border-white/10 flex flex-col">
                        <div className="aspect-[16/10] overflow-hidden bg-[#060D17]">
                          <img
                            src={getSafeImageUrl(card.image, '/images/service_outboard_engine_1791036551185.jpg')}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(e, '/images/service_outboard_engine_1791036551185.jpg')}
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-['Cabinet_Grotesk']">
                              {card.title}
                            </h3>
                            <p className="text-xs text-slate-300 mb-3">{card.desc}</p>
                            <ul className="space-y-1 mb-4 text-[11px] text-slate-400">
                              {(card.bullets || []).map((b: string, bIdx: number) => (
                                <li key={bIdx}>&bull; {b}</li>
                              ))}
                            </ul>
                          </div>
                          <span className="text-xs font-bold text-[#0088FF] uppercase">
                            {card.actionText} &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
