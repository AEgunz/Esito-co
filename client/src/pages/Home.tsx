import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Box, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

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
              className="text-6xl md:text-8xl font-bold tracking-tight text-gray-900 leading-[1.1]"
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

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 py-24 border-t border-gray-50">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { icon: Heart, title: 'Keychains', desc: 'Heart, Circle & Rectangle shapes.' },
            { icon: Box, title: 'Photo Blocks', desc: 'Elegant 3D MDF blocks.' },
            { icon: Award, title: 'Plaques', desc: 'Luxurious display plaques.' }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
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
