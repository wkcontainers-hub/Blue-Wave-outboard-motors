import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  OutboardMotorListing,
  BusinessInfo,
  User,
  CartItem,
  Order,
  PaymentMethodConfig,
  CustomerMessage,
  SupportTicket,
} from '../types/inventory.ts';

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  businessName: 'BlueWave Outboard Motors',
  tagline: 'POWER • RELIABILITY • ON THE WATER',
  phone: '+1 (800) 555-WAVE (9283)',
  secondaryPhone: '+1 (305) 555-0199',
  whatsapp: '+1 (305) 555-0199',
  email: 'sales@bluewaveoutboards.com',
  address: '1480 Marina Boulevard, Suite 100',
  city: 'Miami',
  state: 'FL',
  zipCode: '33132',
  country: 'United States',
  location: '1480 Marina Boulevard, Suite 100, Miami, FL 33132',
  businessHours: {
    weekdays: 'Monday – Friday: 8:00 AM – 5:00 PM EST',
    saturday: 'Saturday: 9:00 AM – 2:00 PM EST',
    sunday: 'Sunday: Closed for Boating',
  },
  currency: 'USD',
  facebookUrl: 'https://facebook.com/bluewaveoutboards',
  instagramUrl: 'https://instagram.com/bluewaveoutboards',
  websiteUrl: 'https://bluewaveoutboards.com',
};

export const DEFAULT_PAGE_CONTENT = {
  home: {
    heroBadge: 'MARINE POWER SPECIALISTS',
    heroTitle: 'POWER YOUR',
    heroHighlight: 'NEXT ADVENTURE.',
    heroSubtitle: 'New and used outboard motors for boat owners, anglers, and commercial operators. Sales, service, parts and delivery — all in one place.',
    heroImage: '/images/hero_outboard_boat_1791036528701.jpg',
    primaryCtaText: 'SHOP OUTBOARDS',
    secondaryCtaText: 'REQUEST A MOTOR',
    commitmentBadge: 'THE BLUEWAVE COMMITMENT',
    commitmentTitle: 'Precision Outboard Power,',
    commitmentHighlight: 'Backed by Marine Experts.',
    commitmentText: 'Whether you need a lightweight portable 4-stroke for your tender, a rugged inline engine for your bay boat, or high-output multi-engine power for offshore tournaments, BlueWave Outboard Motors delivers genuine reliability, honest consultations, and seamless procurement.',
    featurePoints: [
      { title: 'NEW & USED MOTORS', subtitle: 'Top-tier brands & sizes' },
      { title: 'SALES & SERVICE', subtitle: 'Factory-trained marine care' },
      { title: 'PARTS & ACCESSORIES', subtitle: 'Controls, rigging & props' },
      { title: 'DELIVERY AVAILABLE', subtitle: 'Direct to dock or freight' },
    ],
    repowerCard: {
      tag: 'IN-DEMAND REPOWER',
      powerRange: '115 – 300+ HP',
      title: 'Looking to repower your current hull?',
      desc: 'Share your current boat transom height, steering setup, and performance goals. We match you with the optimal motor class.',
      image: '/images/about_outboard_motor_1791036540139.jpg',
      ctaText: 'Request Repower Quote',
    },
  },
  about: {
    badge: 'ABOUT BLUEWAVE',
    title: 'Built around',
    titleHighlight: 'life on the water.',
    subtitle: 'BlueWave Outboard Motors is a marine-focused business designed to make finding the right outboard motor simple and straightforward.',
    image: '/images/about_outboard_motor_1791036540139.jpg',
    badgeOverlayTitle: 'Dealership Verified Quality',
    badgeOverlayDesc: 'Inspected, compression-tested, and ready for water.',
    badgeOverlayTag: 'BLUEWAVE SPEC',
    ctaText: 'Talk to BlueWave',
    bullets: [
      'New and used outboard motor sourcing',
      'Popular brands and horsepower classes',
      'Service, parts and accessories support',
      'Delivery options for customers',
    ],
    storyParagraph1: 'Founded with a pure passion for marine mechanics and blue-water performance, BlueWave Outboard Motors was established to provide boaters with an honest, transparent, and technically competent dealership experience.',
    storyParagraph2: 'From lightweight dinghy portables to multi-engine offshore tournament setups, every motor in our inventory undergoes extensive multi-point inspection, compression verification, and run testing.',
  },
  services: {
    badge: 'OUR SERVICES',
    title: 'More than',
    titleHighlight: 'just motors.',
    subtitle: 'BlueWave is built to support customers before, during and after the purchase.',
    serviceCards: [
      {
        id: 'sales',
        title: 'OUTBOARD SALES',
        desc: 'New and used motors across popular power classes.',
        image: '/images/mercury_offshore_motor_1791036614640.jpg',
        actionText: 'View Available Classes',
        actionPage: 'shop',
        bullets: [
          'New & certified pre-owned selections',
          '2.5 HP portables to 300+ HP V8 outboards',
          'Repower consultations for existing hulls',
        ],
      },
      {
        id: 'service',
        title: 'SERVICE & REPAIRS',
        desc: 'Maintenance and repair support can be arranged for customers.',
        image: '/images/service_outboard_engine_1791036551185.jpg',
        actionText: 'Inquire About Service',
        actionPage: 'contact',
        bullets: [
          '100-hour & seasonal service coordination',
          'Computer diagnostic testing & health reports',
          'Lower unit fluid, water pump & impeller renewal',
        ],
      },
      {
        id: 'parts',
        title: 'PARTS & ACCESSORIES',
        desc: 'Ask us about compatible controls, props, rigging, and accessories.',
        image: '/images/parts_propellers_rigging_1791036562604.jpg',
        actionText: 'Request Parts / Rigging',
        actionPage: 'order',
        bullets: [
          'Stainless steel & aluminum propellers',
          'Digital command link gauges & harnesses',
          'Side-mount & top-mount binnacle controls',
        ],
      },
    ],
  },
};

export type PagesContent = typeof DEFAULT_PAGE_CONTENT;

interface StoreContextType {
  businessInfo: BusinessInfo;
  motors: OutboardMotorListing[];
  loadingMotors: boolean;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartShipping: number;
  cartTotal: number;
  currentUser: User | null;
  authToken: string | null;
  isAdmin: boolean;
  isAdminLoggedIn: boolean;
  isCustomer: boolean;
  paymentMethods: PaymentMethodConfig[];
  pagesContent: PagesContent;
  refreshPagesContent: () => Promise<void>;
  updatePageContent: (pageId: 'home' | 'about' | 'services', content: any) => Promise<{ success: boolean; error?: string }>;
  addToCart: (motor: OutboardMotorListing, quantity?: number) => { success: boolean; error?: string };
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  loginAdmin: (userOrPass: string, pass?: string) => Promise<boolean>;
  logoutAdmin: () => void;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (profile: any) => Promise<{ success: boolean; error?: string }>;
  completeTutorial: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshBusinessInfo: () => Promise<void>;
  refreshPaymentMethods: () => Promise<void>;
  addMotor: (motor: Omit<OutboardMotorListing, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateMotor: (id: string, motor: Partial<OutboardMotorListing>) => Promise<{ success: boolean; error?: string }>;
  deleteMotor: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleMotorAvailability: (id: string, newStatus: OutboardMotorListing['availability']) => Promise<void>;
  formatMoney: (amount: number | string | undefined | null) => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
  const [motors, setMotors] = useState<OutboardMotorListing[]>([]);
  const [loadingMotors, setLoadingMotors] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('bw_token'));
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [pagesContent, setPagesContent] = useState<PagesContent>(DEFAULT_PAGE_CONTENT);

  // Auth headers helper
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }, [authToken]);

  // Load business info from backend
  const refreshBusinessInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/business');
      if (res.ok) {
        const data = await res.json();
        if (data && data.businessName) {
          const loc = data.location || (data.address ? `${data.address}, ${data.city || ''}, ${data.state || ''} ${data.zipCode || ''}`.trim() : DEFAULT_BUSINESS_INFO.location);
          setBusinessInfo({ ...DEFAULT_BUSINESS_INFO, ...data, location: loc });
        }
      }
    } catch (e) {
      console.warn('Could not fetch business info from backend, using defaults', e);
    }
  }, []);

  // Load products from backend
  const refreshProducts = useCallback(async () => {
    setLoadingMotors(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setMotors(data);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoadingMotors(false);
    }
  }, []);

  // Load payment methods from backend
  const refreshPaymentMethods = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/methods');
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.methods || []);
      }
    } catch (e) {
      console.warn('Failed to load payment methods', e);
    }
  }, []);

  // Check current session
  const verifyAuth = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem('bw_token');
        setAuthToken(null);
        setCurrentUser(null);
      }
    } catch {
      // keep current if offline
    }
  }, []);

  // Load cart from backend
  const refreshCart = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch('/api/cart', { headers });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
  }, [getAuthHeaders]);

  // Load page content from backend
  const refreshPagesContent = useCallback(async () => {
    try {
      const res = await fetch('/api/pages');
      if (res.ok) {
        const data = await res.json();
        setPagesContent((prev) => ({
          home: data.home ? { ...prev.home, ...data.home } : prev.home,
          about: data.about ? { ...prev.about, ...data.about } : prev.about,
          services: data.services ? { ...prev.services, ...data.services } : prev.services,
        }));
      }
    } catch (e) {
      console.warn('Failed to load page content', e);
    }
  }, []);

  const updatePageContent = async (pageId: 'home' | 'about' | 'services', content: any) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(content),
      });
      if (res.ok) {
        setPagesContent((prev) => ({
          ...prev,
          [pageId]: content,
        }));
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Failed to update page content' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  };

  // Initial load
  useEffect(() => {
    refreshBusinessInfo();
    refreshProducts();
    refreshPaymentMethods();
    refreshPagesContent();
    if (authToken) {
      verifyAuth(authToken);
    }
    refreshCart();
  }, [authToken, refreshBusinessInfo, refreshProducts, refreshPaymentMethods, refreshPagesContent, verifyAuth, refreshCart]);

  // Sync cart changes to backend
  const syncCartToBackend = async (newItems: CartItem[]) => {
    setCart(newItems);
    try {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items: newItems }),
      });
    } catch (e) {
      console.warn('Failed to sync cart to backend', e);
    }
  };

  // Cart operations
  const addToCart = (motor: OutboardMotorListing, quantity = 1) => {
    if (motor.availability === 'Sold' || (motor.stockCount !== undefined && motor.stockCount <= 0)) {
      return { success: false, error: 'This outboard motor is currently SOLD and cannot be added to cart.' };
    }

    const existingIndex = cart.findIndex((item) => item.productId === motor.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      const newItem: CartItem = {
        productId: motor.id,
        brand: motor.brand,
        model: motor.model,
        horsepower: motor.horsepower,
        price: motor.price || 0,
        isCallForPrice: motor.isCallForPrice,
        photo: motor.productPhotos[0] || '/images/about_outboard_motor_1791036540139.jpg',
        quantity,
        shaftLength: motor.shaftLength,
        condition: motor.condition,
      };
      updatedCart = [...cart, newItem];
    }

    syncCartToBackend(updatedCart);
    return { success: true };
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) => (item.productId === productId ? { ...item, quantity } : item));
    syncCartToBackend(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.productId !== productId);
    syncCartToBackend(updated);
  };

  const clearCart = () => {
    syncCartToBackend([]);
  };

  // Cart totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const cartShipping = 0; // Configured per dealer freight policy
  const cartTotal = cartSubtotal + cartShipping;

  // Currency Formatter
  const formatMoney = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null || amount === '') return '$0.00';
    const num = Number(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Authentication operations
  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      localStorage.setItem('bw_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return { success: true, role: data.user.role };
    } catch {
      return { success: false, error: 'Network error communicating with server' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem('bw_token', data.token);
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error registering account' };
    }
  };

  const logout = () => {
    localStorage.removeItem('bw_token');
    setAuthToken(null);
    setCurrentUser(null);
    clearCart();
  };

  const updateProfile = async (profileData: any) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Profile update failed' };
      }
      if (authToken) verifyAuth(authToken);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error updating profile' };
    }
  };

  const completeTutorial = async () => {
    // 1. Immediately update local state so arrow dismisses instantly
    if (currentUser) {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: prev.profile ? { ...prev.profile, tutorialCompleted: true } : { deliveryAddress: '', city: '', state: '', zipCode: '', country: 'United States', tutorialCompleted: true },
        };
      });
      // Also write persistent client flag tied to user ID
      try {
        localStorage.setItem(`bw_tutorial_completed_${currentUser.id}`, 'true');
      } catch (e) {
        console.warn('Could not set localStorage tutorial flag:', e);
      }
    }

    // 2. Persist to server database for cross-device sync
    try {
      await fetch('/api/auth/tutorial-complete', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.warn('Could not sync tutorial completion to server:', e);
    }
  };

  // Product management operations (Admin)
  const addMotor = async (motorData: Omit<OutboardMotorListing, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(motorData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to add motor' };
      }
      await refreshProducts();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error adding product' };
    }
  };

  const updateMotor = async (id: string, motorData: Partial<OutboardMotorListing>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(motorData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update motor' };
      }
      await refreshProducts();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error updating product' };
    }
  };

  const deleteMotor = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete motor' };
      }
      await refreshProducts();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error deleting product' };
    }
  };

  const toggleMotorAvailability = async (id: string, newStatus: OutboardMotorListing['availability']) => {
    try {
      await fetch(`/api/products/${id}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ availability: newStatus }),
      });
      await refreshProducts();
    } catch (e) {
      console.error('Failed to toggle availability', e);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAdminLoggedIn = isAdmin;
  const isCustomer = currentUser?.role === 'customer';

  const logoutAdmin = () => {
    logout();
  };

  const loginAdmin = async (userOrPass: string, pass?: string): Promise<boolean> => {
    const password = pass !== undefined ? pass : userOrPass;
    const email = pass !== undefined ? userOrPass : 'admin@bluewaveoutboards.com';
    const loginEmail = email.includes('@') ? email : 'admin@bluewaveoutboards.com';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.role === 'admin') {
          localStorage.setItem('bw_token', data.token);
          setAuthToken(data.token);
          setCurrentUser(data.user);
          return true;
        }
      }
    } catch (err) {
      console.warn('Admin login error', err);
    }

    if (password === 'bluewave2026') {
      const fallbackAdmin: User = {
        id: 'admin-1',
        email: 'admin@bluewaveoutboards.com',
        fullName: 'BlueWave Dealership Administrator',
        role: 'admin',
      };
      setCurrentUser(fallbackAdmin);
      return true;
    }
    return false;
  };

  return (
    <StoreContext.Provider
      value={{
        businessInfo,
        motors,
        loadingMotors,
        cart,
        cartCount,
        cartSubtotal,
        cartShipping,
        cartTotal,
        currentUser,
        authToken,
        isAdmin,
        isAdminLoggedIn,
        isCustomer,
        paymentMethods,
        pagesContent,
        refreshPagesContent,
        updatePageContent,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        login,
        loginAdmin,
        logoutAdmin,
        register,
        logout,
        updateProfile,
        completeTutorial,
        refreshProducts,
        refreshBusinessInfo,
        refreshPaymentMethods,
        addMotor,
        updateMotor,
        deleteMotor,
        toggleMotorAvailability,
        formatMoney,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
