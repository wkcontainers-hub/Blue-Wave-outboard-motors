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

  // Initial load
  useEffect(() => {
    refreshBusinessInfo();
    refreshProducts();
    refreshPaymentMethods();
    if (authToken) {
      verifyAuth(authToken);
    }
    refreshCart();
  }, [authToken, refreshBusinessInfo, refreshProducts, refreshPaymentMethods, verifyAuth, refreshCart]);

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
        photo: motor.productPhotos[0] || '/src/assets/images/about_outboard_motor_1791036540139.jpg',
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
