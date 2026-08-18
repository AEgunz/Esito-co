import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, ShoppingBag, Globe, ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { name: t('nav.corporate'), path: '/corporate' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 md:h-32 items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-black md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center group py-2">
              <img
                src="/logo.png"
                alt="Estilo-co"
                className="h-20 md:h-28 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>

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
            {/* V3 */}
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
              className="relative p-2 text-gray-400 hover:text-black transition group"
            >
              <ShoppingCart className="h-6 w-6 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                  className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg shadow-red-200"
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {cartCount}
                  </motion.span>
                </motion.span>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[120] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-lg font-black uppercase tracking-tighter ${location.pathname === link.path ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}
                  >
                    {link.name}
                  </Link>
                ))}

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-blue-600 border-t border-gray-100 pt-6"
                  >
                    <LayoutDashboard className="h-5 w-5" /> {t('nav.admin')}
                  </Link>
                )}
              </div>

              <div className="mt-auto border-t border-gray-100 pt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Language</p>
                    <div className="flex gap-4">
                      {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`text-sm font-bold ${i18n.language.startsWith(lang.code) ? 'text-blue-600 underline' : 'text-gray-400'}`}
                        >
                          {lang.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {user ? (
                   <button onClick={handleLogout} className="flex items-center gap-3 w-full bg-red-50 text-red-600 p-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors">
                      <LogOut className="h-4 w-4" /> Logout Account
                   </button>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 w-full bg-black text-white p-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors justify-center">
                    <User className="h-4 w-4" /> Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
