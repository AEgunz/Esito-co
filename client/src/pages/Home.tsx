import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Box, Award, Flame, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api, { SERVER_URL } from '../api/axios';

const Home = () => {
  const { t } = useTranslation();

  const { data: topSellers } = useQuery({
    queryKey: ['top-sellers'],
    queryFn: async () => {
        const res = await api.get('/products');
        return Array.isArray(res.data)
            ? res.data.filter((p: any) => p.salesCount > 0).sort((a: any, b: any) => b.salesCount - a.salesCount).slice(0, 4)
            : [];
    }
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    const baseUrl = window.location.hostname.includes('localhost') ? 'http://localhost:5000' : 'https://esito-co-production.up.railway.app';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="bg-white text-start">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="text-center space-y-8 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100"
            >
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">{t('home.badge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl md:text-9xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase italic"
            >
              {t('home.heroTitle')} <br />
              <span className="text-blue-600">Estilo-co</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed"
            >
              {t('home.heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center gap-6 pt-4 w-full"
            >
              <Link
                to="/shop"
                className="bg-black text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition flex items-center gap-2 group shadow-xl"
              >
                {t('home.cta')} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition rtl:rotate-180" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -z-10 blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-blue-400"></div>
        </div>
      </section>

      {/* Top Sellers Section */}
      {topSellers && topSellers.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-24 text-start">
            <div className="flex justify-between items-end mb-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-black text-amber-700 uppercase tracking-widest italic">Hottest Right Now</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-gray-900">Best Sellers</h2>
                </div>
                <Link to="/shop" className="hidden md:flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-[0.2em] hover:translate-x-2 transition-transform">
                    View Full Shop <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                {topSellers.map((product: any, i: number) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <Link to={`/product/${product.id}`} className="space-y-4 block">
                            <div className="relative aspect-square bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100 group-hover:shadow-2xl transition-all duration-700">
                                <img src={getImageUrl(product.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                                <div className="absolute top-4 right-4 z-10">
                                    <span className="bg-white/90 backdrop-blur-md text-black px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest shadow-sm">
                                        {product.salesCount} Sold
                                    </span>
                                </div>
                            </div>
                            <div className="px-2 space-y-1">
                                <h3 className="font-black text-gray-900 uppercase italic text-sm truncate">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-blue-600">{Number(product.price).toFixed(0)} DH</span>
                                    <div className="bg-gray-100 p-2 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
          </section>
      )}

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 py-24 border-t border-gray-50">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Award, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
            { icon: Box, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
            { icon: Heart, title: t('home.feature3Title'), desc: t('home.feature3Desc') }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-center"
            >
              <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <item.icon className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
