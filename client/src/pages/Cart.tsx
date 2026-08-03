import { useCart } from '../hooks/useCart';
import { Trash2, ShoppingBag, MapPin, Phone, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Cart = () => {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    city: ''
  });

  const [deliveryFee, setDeliveryFee] = useState(30.00); // Default

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

  const grandTotal = total + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = localStorage.getItem('user');
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!formData.phone || !formData.address || !formData.city) {
      alert('Please fill in all shipping details');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization
        })),
        totalAmount: grandTotal,
        firstName: userData.name || 'Customer',
        lastName: '',
        email: userData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      };

      await api.post('/orders', orderData);
      alert('Order placed successfully!');
      clearCart();
      navigate('/');
    } catch (error) {
      alert('Error placing order');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShoppingBag className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="text-blue-600 font-bold hover:underline">Go shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" /> Shipping Information
            </h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  required
                  placeholder="Street name, Building number, Apartment..."
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Casablanca"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="06XXXXXXXX"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b">
               <h2 className="font-bold">Your Items</h2>
            </div>
            <ul className="divide-y">
              {cart.map((item, index) => (
                <li key={index} className="p-6 flex items-center gap-6">
                  <img src={item.image || 'https://via.placeholder.com/100'} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{(item.price * item.quantity).toFixed(2)} DH</p>
                    <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl border shadow-lg sticky top-24 space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{total.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Delivery Fee</span>
                <span>{deliveryFee.toFixed(2)} DH</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-2xl font-black text-gray-900">
                <span>Total</span>
                <span className="text-blue-600">{grandTotal.toFixed(2)} DH</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
