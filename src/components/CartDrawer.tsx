import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { PageId } from './Header.tsx';
import { getSafeImageUrl, handleImageError } from '../utils/imageUrl.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { cart, cartCount, cartSubtotal, cartShipping, cartTotal, updateCartQty, removeFromCart, formatMoney } = useStore();

  if (!isOpen) return null;

  const handleProceedToCheckout = () => {
    onClose();
    onNavigate('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B1826] border-l border-white/10 shadow-2xl flex flex-col text-white">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#07111D]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0088FF]/15 text-[#0088FF] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
                  Your Marine Order Cart
                </h3>
                <span className="text-xs text-slate-400">
                  {cartCount} {cartCount === 1 ? 'outboard motor unit' : 'outboard motor units'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white font-['Cabinet_Grotesk'] mb-1">
                  Your cart is empty
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                  Browse our high-performance new and used inventory to find your next outboard motor.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('shop');
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0088FF]/30"
                >
                  Explore Inventory
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-3.5 rounded-xl bg-[#060D17] border border-white/10 flex gap-3.5 items-center group"
                >
                  {/* Photo */}
                  <img
                    src={getSafeImageUrl(item.photo)}
                    alt={item.model}
                    className="w-18 h-16 rounded-lg object-cover bg-[#091522] shrink-0 border border-white/10"
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="font-extrabold uppercase text-[#0088FF]">{item.brand}</span>
                      <span className="font-mono">{item.horsepower} HP</span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate font-['Cabinet_Grotesk']">
                      {item.model}
                    </h4>

                    <div className="text-xs font-bold text-white font-mono mt-1">
                      {item.isCallForPrice || !item.price ? 'Inquire for Quote' : formatMoney(item.price)}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 bg-[#0B1826] px-2 py-0.5 rounded border border-white/10">
                        <button
                          onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                          className="text-slate-400 hover:text-white"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold w-4 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                          className="text-slate-400 hover:text-white"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#07111D] space-y-4">
              {/* Order breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-mono font-semibold">{formatMoney(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#0088FF]" />
                    <span>Freight / Delivery</span>
                  </span>
                  <span className="text-emerald-400 font-mono">
                    {cartShipping === 0 ? 'Complimentary / Arranged' : formatMoney(cartShipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Estimated Total (USD)</span>
                  <span className="text-base text-[#0099FF] font-mono">{formatMoney(cartTotal)}</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-2.5 rounded-lg bg-[#0B1826] border border-white/5 flex items-center gap-2 text-[11px] text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#0088FF] shrink-0" />
                <span>Verified Dealership Warranty &bull; Insured Delivery</span>
              </div>

              {/* BUY NOW Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 px-6 rounded-lg bg-[#0088FF] hover:bg-[#0074DB] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#0088FF]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BUY NOW &bull; PROCEED TO PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
