import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, MapPin, Truck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Cart = () => {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: ''
  });

  const [deliveryFee, setDeliveryFee] = useState(30.00); // Default

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setFormData(prev => ({ ...prev, name: JSON.parse(user).name }));
    }
  }, []);

  useEffect(() => {
    const fetchFee = async () => {
      if (formData.city.length > 2) {
        try {
          const res = await api.get(`/delivery/${formData.city}`);
          if (res.data) {
            setDeliveryFee(Number(res.data.fee));
          }
        } catch (error) {
          setDeliveryFee(30.00);
        }
      }
    };
    const timer = setTimeout(fetchFee, 1000);
    return () => clearTimeout(timer);
  }, [formData.city]);

  const grandTotal = cartTotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.address || !formData.city || !formData.name) {
      alert('Please fill in all shipping details');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          customerPhoto: item.customPhotos ? JSON.stringify(item.customPhotos) : item.image
        })),
        totalAmount: grandTotal,
        deliveryFee: deliveryFee,
        firstName: formData.name,
        lastName: '',
        email: 'customer@estilo-co.com',
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      };

      await api.post('/orders', orderData);
      alert('Order placed successfully!');
      clearCart();
      navigate('/order-success');
    } catch (error) {
      alert('Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="text-blue-600 font-bold hover:underline font-black uppercase text-xs tracking-widest">Go shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8 tracking-tighter italic uppercase">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border shadow-sm space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <MapPin className="h-5 w-5 text-blue-600" /> Shipping Information
            </h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Street name, Building, Apartment..."
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casablanca"
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="06XXXXXXXX"
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50">
               <h2 className="font-black uppercase tracking-widest text-xs text-gray-400">Your Items</h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {cart.map((item) => (
                <li key={item.cartId} className="p-6 flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img src={item.image || 'https://via.placeholder.com/100'} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 leading-tight">{item.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Size: <span className="text-gray-900">{item.selectedSize}</span></p>
                        {item.selectedColor && (
                           <div className="flex items-center gap-1">
                             <p className="text-[10px] font-black text-gray-400 uppercase">Color:</p>
                             <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.selectedColor }} />
                           </div>
                        )}
                        <p className="text-[10px] font-black text-gray-400 uppercase">Qty: <span className="text-gray-900">{item.quantity}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600 mb-2">{(item.price * item.quantity).toFixed(0)} DH</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-full">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-black p-8 rounded-[40px] shadow-2xl sticky top-24 space-y-6 border border-white/5">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter border-b border-white/10 pb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="text-white font-black">{cartTotal.toFixed(0)} DH</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-gray-400 font-bold uppercase tracking-widest text-[10px]"><Truck className="h-4 w-4 text-blue-500" /> Delivery Fee</span>
                <span className="text-white font-black">{deliveryFee.toFixed(0)} DH</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-blue-500 font-black uppercase tracking-widest text-xs italic">Total</span>
                <span className="text-3xl font-black text-white">{grandTotal.toFixed(0)} DH</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-xl shadow-xl hover:bg-blue-700 transition transform active:scale-95 uppercase flex items-center justify-center gap-3"
            >
              {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin" /> : "Confirm Order"}
            </button>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-center text-xs font-black text-blue-500 uppercase tracking-[0.2em] italic">Fast delivery in 2-3 business days</p>
              <p className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">Pay on Delivery (Cash)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
