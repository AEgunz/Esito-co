import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Printer, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="Esito-co"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
                <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-black uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}
                >
                    {link.name}
                </Link>
            ))}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="bg-gray-50 text-gray-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2 border border-gray-100"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin Panel
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4 bg-gray-50 pl-4 pr-2 py-1.5 rounded-full border border-gray-100">
                <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Hi, {user.name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="bg-white text-gray-400 hover:text-red-500 p-2 rounded-full transition shadow-sm"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-400 hover:text-black p-2 transition">
                <User className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
