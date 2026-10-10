import React, { useEffect, useRef } from 'react';
import {
  Package,
  User,
  ShoppingBag,
  MessageSquare,
  HelpCircle,
  CreditCard,
  X,
  LogOut,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PageId } from './Header.tsx';

export type AccountMenuTab = 'orders' | 'profile' | 'cart' | 'messages' | 'support' | 'payments';

interface CustomerAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: AccountMenuTab) => void;
  onOpenCart: () => void;
  onNavigate: (page: PageId) => void;
}

export const CustomerAccountDrawer: React.FC<CustomerAccountDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenCart,
  onNavigate,
}) => {
  const { currentUser, logout, cartCount, formatMoney } = useStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // The 6 exact menu options required
  const menuItems: {
    id: AccountMenuTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    badge?: string | number;
    action: () => void;
  }[] = [
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      description: 'View order references, specifications, dates & statuses',
      action: () => {
        onClose();
        onNavigateToTab('orders');
      },
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      description: 'Manage legal name, phone & delivery address',
      action: () => {
        onClose();
        onNavigateToTab('profile');
      },
    },
    {
      id: 'cart',
      label: 'My Cart',
      icon: ShoppingBag,
      description: 'Review units, update quantities & proceed to checkout',
      badge: cartCount > 0 ? cartCount : undefined,
      action: () => {
        onClose();
        onOpenCart();
      },
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      description: 'Private direct messaging with BlueWave staff',
      action: () => {
        onClose();
        onNavigateToTab('messages');
      },
    },
    {
      id: 'support',
      label: 'Support & Complaints',
      icon: HelpCircle,
      description: 'Submit formal questions, warranty claims & complaints',
      action: () => {
        onClose();
        onNavigateToTab('support');
      },
    },
    {
      id: 'payments',
      label: 'Payment History',
      icon: CreditCard,
      description: 'Actual transaction ledger, amounts & verification status',
      action: () => {
        onClose();
        onNavigateToTab('payments');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-[#08121E] border-l border-white/10 shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-250"
          role="dialog"
          aria-modal="true"
          aria-label="Customer Account Menu"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#060D17]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0088FF] to-[#004FAF] flex items-center justify-center font-black text-white text-base font-['Cabinet_Grotesk'] shadow-md shadow-[#0088FF]/30">
                {currentUser?.fullName?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate font-['Cabinet_Grotesk']">
                    {currentUser?.fullName || 'Customer Account'}
                  </h3>
                  <span className="text-[10px] bg-[#0088FF]/20 text-[#38BDF8] px-2 py-0.5 rounded font-mono font-bold uppercase">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'Logged In Customer'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Account Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="px-5 py-2.5 bg-[#0A1624] border-b border-white/5 flex items-center justify-between text-xs text-slate-300">
            <span className="text-[11px] font-mono text-slate-400">
              Customer ID: <strong className="text-slate-200">{currentUser?.id?.slice(0, 12)}...</strong>
            </span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Dealership Session
            </span>
          </div>

          {/* 6 Account Menu Options in Exact Order */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-widest text-[#0088FF]">
              ACCOUNT DASHBOARD MENU
            </div>

            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full p-3.5 rounded-xl bg-[#0B1826] hover:bg-[#102236] active:scale-[0.99] border border-white/5 hover:border-[#0088FF]/40 text-left transition-all duration-150 flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#07111D] border border-white/10 text-[#0088FF] group-hover:text-white group-hover:bg-[#0088FF] flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors font-['Cabinet_Grotesk']">
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0088FF] text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Footer with Sign Out */}
          <div className="p-4 border-t border-white/10 bg-[#060D17] space-y-2.5">
            <button
              onClick={() => {
                logout();
                onClose();
                onNavigate('home');
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1B1115] hover:bg-[#2A161E] text-rose-300 hover:text-rose-200 border border-rose-900/40 hover:border-rose-700/60 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out of Account</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              BlueWave Outboard Motors &bull; Client Portal Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
