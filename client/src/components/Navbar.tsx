import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag, Globe, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const languages = [
    { code: 'fr', name: 'Français', flag: 'FR' },
    { code: 'ar', name: 'الدارجة', flag: 'MA' },
    { code: 'en', name: 'English', flag: 'US' },
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
    document.dir = code === 'ar' ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [location, i18n.language]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/shop' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="Estilo-co"
              className="h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex items-center gap-10">
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
                <LayoutDashboard className="h-4 w-4" /> {t('nav.admin')}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-tight text-gray-600">
                  {languages.find(l => l.code === i18n.language.split('-')[0])?.name || 'Lang'}
                </span>
                <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 min-w-[120px] z-[110]"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${i18n.language.startsWith(lang.code) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-400 hover:text-black transition"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-4 bg-gray-50 pl-4 pr-2 py-1.5 rounded-full border border-gray-100">
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
