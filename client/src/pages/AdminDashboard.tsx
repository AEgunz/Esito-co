import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, List, Users, ShoppingCart, Truck, PieChart, MessageSquare, MapPin } from 'lucide-react';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminDelivery from './admin/AdminDelivery';
import AdminStats from './admin/AdminStats';
import AdminCustomers from './admin/AdminCustomers';
import AdminCategories from './admin/AdminCategories';
import AdminReviews from './admin/AdminReviews';
import AdminAmeex from './admin/AdminAmeex';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'ADMIN') {
          setIsAdmin(true);
        } else {
          navigate('/');
        }
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Verifying Admin Access...</p>
        </div>
    </div>
  );

  if (!isAdmin) return null;

  const menuItems = [
    { name: 'Overview', icon: PieChart, path: '/admin' },
    { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'AMEEX Shipping', icon: Truck, path: '/admin/ameex' },
    { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
    { name: 'Delivery Fees', icon: MapPin, path: '/admin/delivery' },
    { name: 'Categories', icon: List, path: '/admin/categories' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:block sticky top-0 h-screen">
        <div className="p-10">
          <Link to="/">
            <img src="/logo.png" alt="Estilo-co" className="h-16 md:h-20 w-auto object-contain" />
          </Link>
        </div>
        <nav className="px-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
                <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold ${
                    isActive ? 'bg-black text-white shadow-xl shadow-gray-200' : 'text-gray-400 hover:text-black hover:bg-gray-50'
                }`}
                >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-sm uppercase tracking-widest">{item.name}</span>
                </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-10 left-0 right-0 px-10">
            <div className="p-6 bg-blue-50 rounded-[24px] border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold text-blue-900">System Online</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/customers" element={<AdminCustomers />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/ameex" element={<AdminAmeex />} />
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
