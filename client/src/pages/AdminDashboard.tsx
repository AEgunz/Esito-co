import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, List, Users, ShoppingCart, Truck, PieChart, MessageSquare, MapPin, Tag, Mail, LogOut, LayoutDashboard, Globe, ChevronDown, Wallet, Home } from 'lucide-react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../api/axios';

// Pages
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminDelivery from './admin/AdminDelivery';
import AdminStats from './admin/AdminStats';
import AdminCustomers from './admin/AdminCustomers';
import AdminCategories from './admin/AdminCategories';
import AdminReviews from './admin/AdminReviews';
import AdminAmeex from './admin/AdminAmeex';
import AdminCoupons from './admin/AdminCoupons';
import AdminMessages from './admin/AdminMessages';
import AdminFinances from './admin/AdminFinances';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [liveVisitors, setLiveVisitors] = useState(0);

  useEffect(() => {
    const checkAdmin = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/login');
        return;
      }

      try {
        const userData = JSON.parse(userStr);
        if (userData && userData.role === 'ADMIN') {
          setIsAdmin(true);
        } else {
          navigate('/');
        }
      } catch (e) {
        console.error('Admin Check Error:', e);
        navigate('/login');
      }
      setLoading(false);
    };

    checkAdmin();

    // Socket for live tracking - with error handling
    let socket: any;
    try {
        socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 3
        });
        socket.on('live-count', (count: number) => {
            setLiveVisitors(count);
        });
    } catch (err) {
        console.error('Socket Error:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Dashboard...</p>
        </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10 text-center">
        <div className="space-y-4">
            <h1 className="text-2xl font-black uppercase italic">Access Denied</h1>
            <p className="text-gray-500">You do not have permission to view this page.</p>
            <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs">Back to Home</button>
        </div>
    </div>
  );

  const menuItems = [
    { name: 'Back to Shop', icon: Home, path: '/' },
    { name: 'Overview', icon: PieChart, path: '/admin' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'AMEEX Shipping', icon: Truck, path: '/admin/ameex' },
    { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
    { name: 'Promo Codes', icon: Tag, path: '/admin/coupons' },
    { name: 'Inbox', icon: Mail, path: '/admin/messages' },
    { name: 'Finances', icon: Wallet, path: '/admin/finance' },
    { name: 'Delivery Fees', icon: MapPin, path: '/admin/delivery' },
    { name: 'Categories', icon: List, path: '/admin/categories' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-start">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:block sticky top-0 h-screen shrink-0 flex flex-col">
        <div className="p-10 shrink-0">
          <Link to="/">
            <img src="/logo.png" alt="Estilo-co" className="h-16 md:h-20 w-auto object-contain" />
          </Link>
        </div>
        <nav className="px-6 space-y-1 overflow-y-auto flex-1 custom-scrollbar pb-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
                <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-4 px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold ${
                    isActive ? 'bg-black text-white shadow-xl shadow-gray-200' : 'text-gray-400 hover:text-black hover:bg-gray-50'
                }`}
                >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-xs uppercase tracking-widest">{item.name}</span>
                </Link>
            );
          })}
        </nav>

        <div className="p-8 space-y-3 shrink-0 border-t border-gray-50 bg-white">
            <div className="p-4 bg-emerald-50 rounded-[20px] border border-emerald-100 flex justify-between items-center">
                <div className="space-y-0.5 text-start">
                    <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">Live Visitors</p>
                    <p className="text-xl font-black text-emerald-900 leading-none">{liveVisitors}</p>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="p-4 bg-blue-50 rounded-[20px] border border-blue-100 text-start">
                <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-blue-900 uppercase">System Online</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto text-start">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/customers" element={<AdminCustomers />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/ameex" element={<AdminAmeex />} />
          <Route path="/coupons" element={<AdminCoupons />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="/finance" element={<AdminFinances />} />
          <Route path="/delivery" element={<AdminDelivery />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/orders/:id" element={<AdminOrderDetail />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
