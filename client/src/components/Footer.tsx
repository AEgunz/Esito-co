import { Phone, Mail, MapPin, Instagram, Facebook, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white pt-20 pb-10 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <img src="/logo.png" alt="Estilo-co" className="h-16 w-auto brightness-0 invert" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs italic">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-xl hover:bg-blue-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-xl hover:bg-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-black uppercase tracking-tighter italic">{t('shop.title')}</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition text-sm font-bold uppercase">{t('nav.home')}</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition text-sm font-bold uppercase">{t('nav.shop')}</Link></li>
              <li><Link to="/cart" className="text-gray-400 hover:text-white transition text-sm font-bold uppercase">{t('nav.cart')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-lg font-black uppercase tracking-tighter italic">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://wa.me/212693360625"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="bg-white/5 p-2 rounded-lg group-hover:bg-green-600 transition-colors">
                    <Phone className="h-4 w-4 text-blue-500 group-hover:text-white" />
                  </div>
                  <span className="font-bold text-sm">0693-360625</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="bg-white/5 p-2 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-bold text-sm lowercase">contact@estilo-co.ma</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="bg-white/5 p-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <span className="font-bold text-sm">Casablanca, Morocco</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Note */}
          <div className="space-y-6">
            <h4 className="text-lg font-black uppercase tracking-tighter italic">Join Our Community</h4>
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600 transition font-bold text-sm"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 rounded-xl hover:bg-blue-700 transition">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
              Get early access to new collections and exclusive offers.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Estilo-co. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-gray-600 hover:text-white transition text-[9px] font-black uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-gray-600 hover:text-white transition text-[9px] font-black uppercase tracking-widest">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
