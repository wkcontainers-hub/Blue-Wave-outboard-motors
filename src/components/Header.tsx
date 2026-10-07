import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Shield, LogOut, ShoppingBag, User as UserIcon } from 'lucide-react';
import { BlueWaveNavbarLogo } from './BlueWaveLogo.tsx';
import { useStore } from '../context/StoreContext.tsx';

export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'shop'
  | 'contact'
  | 'order'
  | 'admin'
  | 'checkout'
  | 'account';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onOpenCart, onOpenAuth }) => {
  const { isAdminLoggedIn, logoutAdmin, cartCount, currentUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'shop', label: 'Shop Now' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountClick = () => {
    if (currentUser) {
      handleNavClick('account');
    } else if (onOpenAuth) {
      onOpenAuth();
    } else {
      handleNavClick('account');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Discreet Admin Top Bar (Only visible when logged in) */}
      {isAdminLoggedIn && (
        <div className="bg-[#0088FF] text-white py-1 px-4 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Dealership Owner Session Active</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('admin')}
                className="underline hover:text-slate-100 font-bold"
              >
                Open Admin Dashboard
              </button>
              <span>&bull;</span>
              <button
                onClick={() => logoutAdmin()}
                className="hover:text-slate-200 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Bar */}
      <div
        className={`w-full transition-all duration-200 border-b ${
          scrolled
            ? 'bg-[#050B14]/95 backdrop-blur-md border-white/10 shadow-lg shadow-black/40 py-2.5'
            : 'bg-[#050B14] border-white/[0.08] py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: BlueWave Logo */}
          <BlueWaveNavbarLogo onClick={() => handleNavClick('home')} />

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative whitespace-nowrap ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#0088FF] rounded-full animate-in fade-in" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Cart, Account, Prominent Blue ORDER Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none cursor-pointer"
              title="View Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0088FF] text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-in zoom-in-75">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer Portal / Account */}
            <button
              onClick={handleAccountClick}
              className={`p-2 rounded-lg transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'account'
                  ? 'bg-white/[0.1] text-[#38BDF8]'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
              }`}
              title={currentUser ? `Account (${currentUser.fullName})` : 'Customer Portal'}
              aria-label="Customer Account"
            >
              <UserIcon className="w-5 h-5" />
              {currentUser && (
                <span className="hidden lg:inline text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              )}
            </button>

            {/* ORDER Button */}
            <button
              onClick={() => handleNavClick('order')}
              className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-200 whitespace-nowrap shadow-md cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'order'
                  ? 'bg-[#0070D6] text-white ring-2 ring-[#0088FF]/50 shadow-[#0088FF]/30'
                  : 'bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.98] text-white shadow-[#0088FF]/25 hover:shadow-lg hover:shadow-[#0088FF]/35'
              }`}
            >
              ORDER
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#07111D]/98 backdrop-blur-xl border-b border-white/10 shadow-2xl p-5 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-left transition-all ${
                      isActive
                        ? 'bg-[#0088FF]/15 text-[#0088FF] font-semibold border-l-4 border-[#0088FF]'
                        : 'text-slate-200 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="text-xs bg-[#0088FF]/20 px-2 py-0.5 rounded text-[#0088FF]">Active</span>}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCart) onOpenCart();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-left text-slate-200 hover:bg-white/[0.05] hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0088FF]" />
                  <span>Shopping Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="text-xs bg-[#0088FF] text-white px-2 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAccountClick();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-left text-slate-200 hover:bg-white/[0.05] hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#0088FF]" />
                  <span>{currentUser ? `Account (${currentUser.fullName})` : 'Customer Portal / Sign In'}</span>
                </div>
              </button>

              <div className="pt-4 mt-2 border-t border-white/10">
                <button
                  onClick={() => handleNavClick('order')}
                  className="w-full py-3 px-4 bg-[#0088FF] hover:bg-[#0074DB] text-white font-bold rounded-lg text-center shadow-lg shadow-[#0088FF]/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>ORDER A MOTOR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {isAdminLoggedIn && (
                <div className="pt-3 border-t border-white/10 mt-2">
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full py-2.5 px-4 bg-[#0E2034] text-[#38BDF8] text-xs font-bold rounded-lg text-center flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Open Admin Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
