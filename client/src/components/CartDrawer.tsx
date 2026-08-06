import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[1001] flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tighter">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold">Your cart is empty</p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/shop');
                    }}
                    className="bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartId} className="flex gap-4 group">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-black text-gray-900 truncate uppercase text-sm">{item.name}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Size: {item.selectedSize}</span>
                        {item.selectedColor && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Color:</span>
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-100">
                          <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="p-1 hover:text-blue-600 transition-colors"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="p-1 hover:text-blue-600 transition-colors"><Plus className="h-3 w-3" /></button>
                        </div>
                        <p className="font-black text-blue-600">{(item.price * item.quantity).toFixed(0)} DH</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">{cartTotal.toFixed(0)} DH</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full bg-black text-white py-5 rounded-[24px] font-black text-lg shadow-xl hover:bg-gray-800 transition transform active:scale-95 uppercase flex items-center justify-center gap-3"
                >
                  Checkout Now <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">Shipping calculated at checkout</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
