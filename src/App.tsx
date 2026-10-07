/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header, PageId } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { ServicesPage } from './pages/ServicesPage.tsx';
import { ShopPage } from './pages/ShopPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { OrderPage } from './pages/OrderPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { MyAccountPage } from './pages/MyAccountPage.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CustomerAuthModal } from './components/CustomerAuthModal.tsx';

interface PrefillData {
  category?: string;
  horsepower?: string;
  condition?: string;
  brand?: string;
  model?: string;
  motorId?: string;
}

function MainApp() {
  const { isAdminLoggedIn } = useStore();
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [orderPrefill, setOrderPrefill] = useState<PrefillData | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);

  // Sync hash routing so back/forward buttons, direct links, and #admin work
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = [
        'home',
        'about',
        'services',
        'shop',
        'contact',
        'order',
        'admin',
        'checkout',
        'account',
      ];
      if (validPages.includes(hash)) {
        if (hash === 'admin' && !isAdminLoggedIn) {
          setIsLoginModalOpen(true);
        } else {
          setCurrentPage(hash);
        }
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdminLoggedIn]);

  const handleNavigate = (page: PageId, prefill?: PrefillData) => {
    if (page === 'admin') {
      if (isAdminLoggedIn) {
        setCurrentPage('admin');
        window.location.hash = 'admin';
      } else {
        setIsLoginModalOpen(true);
      }
      return;
    }

    setCurrentPage(page);
    window.location.hash = page;
    if (prefill) {
      setOrderPrefill(prefill);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminLogin = () => {
    if (isAdminLoggedIn) {
      handleNavigate('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setCurrentPage('admin');
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050B14] text-white selection:bg-[#0088FF] selection:text-white">
      {/* Top Header (Shown on public pages, and includes admin status indicator if logged in) */}
      {currentPage !== 'admin' && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsCustomerAuthOpen(true)}
        />
      )}

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'shop' && (
          <ShopPage onNavigate={handleNavigate} onOpenCart={() => setIsCartOpen(true)} />
        )}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'order' && <OrderPage initialPrefill={orderPrefill} />}
        {currentPage === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}
        {currentPage === 'account' && (
          <MyAccountPage
            onNavigate={handleNavigate}
            onOpenAuth={() => setIsCustomerAuthOpen(true)}
          />
        )}
        {currentPage === 'admin' && (
          isAdminLoggedIn ? (
            <AdminDashboard onNavigate={handleNavigate} />
          ) : (
            <div className="py-24 text-center">
              <p className="text-slate-400 mb-4">Please log in to access the Dealership Admin Dashboard.</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 rounded-lg bg-[#0088FF] text-white font-bold text-xs uppercase"
              >
                Log In
              </button>
            </div>
          )
        )}
      </main>

      {/* Persistent Dealer Footer (On public pages) */}
      {currentPage !== 'admin' && (
        <Footer onNavigate={handleNavigate} onOpenAdminLogin={handleOpenAdminLogin} />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Customer Login / Register Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => setIsCustomerAuthOpen(false)}
        onSuccess={() => handleNavigate('account')}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
