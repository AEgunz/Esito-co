import { useQuery } from '@tanstack/react-query';
import api, { SERVER_URL } from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ArrowLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Shop = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<any>(null);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/600';
    if (url.startsWith('http')) return url;

    // Auto-detect server URL if VITE_SERVER_URL is missing
    const baseUrl = SERVER_URL === 'http://localhost:5000' && window.location.hostname !== 'localhost'
      ? `https://${window.location.hostname.replace('client', 'server')}`
      : SERVER_URL;

    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const { data: categories, isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const { data: allProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data
  });

  const subCategories = selectedCategory?.subCategories || [];

  const availableChildCategories = selectedSubCategory
    ? selectedSubCategory.childCategories || []
    : [];

  const filteredProducts = selectedCategory
    ? allProducts?.filter((p: any) => {
        // Must belong to the main category
        const belongsToMain = p.subCategory?.categoryId === selectedCategory.id;
        if (!belongsToMain) return false;

        // Filter by SubCategory if selected
        if (selectedSubCategory && p.subCategoryId !== selectedSubCategory.id) return false;

        // Filter by ChildCategory if selected
        if (selectedChildCategory && p.childCategoryId !== selectedChildCategory.id) return false;

        return true;
      })
    : [];

  if (catsLoading || productsLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter">{t('shop.title')}</h1>
              <p className="text-gray-400 font-medium text-lg italic">{t('shop.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {categories?.map((cat: any) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedCategory(cat)}
                  className="group relative aspect-[4/5] bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-left"
                >
                  <img
                    src={getImageUrl(cat.image)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                    alt={cat.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <h3 className="text-3xl font-black text-white tracking-tight mb-2">{cat.name}</h3>
                    <p className="text-gray-300 text-sm font-medium line-clamp-2 mb-6">{cat.description}</p>
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest">
                        {t('shop.explore')} <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="products-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-black transition font-black text-[10px] uppercase tracking-widest group mb-2"
                    >
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform rtl:rotate-180" /> {t('shop.back')}
                    </button>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">{selectedCategory.name}</h2>
                    <p className="text-gray-400 font-medium italic text-sm">{selectedCategory.description}</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-full border border-gray-100 flex items-center gap-3 w-fit">
                    <LayoutGrid className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredProducts.length} {t('shop.shapes')}</span>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
                {/* Level 2: Sub-Category Filter (T-shirts, Hoodies, etc) */}
                {subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { setSelectedSubCategory(null); setSelectedChildCategory(null); }}
                            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!selectedSubCategory ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'}`}
                        >
                            {t('shop.allCategories')}
                        </button>
                        {subCategories.map((sub: any) => (
                            <button
                                key={sub.id}
                                onClick={() => { setSelectedSubCategory(sub); setSelectedChildCategory(null); }}
                                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubCategory?.id === sub.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Level 3: Child-Category Filter (Anime, Oversize, etc) */}
                {availableChildCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 py-2 px-4 bg-gray-50/50 rounded-2xl border border-gray-100 inline-flex w-fit"
                    >
                        <button
                            onClick={() => setSelectedChildCategory(null)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!selectedChildCategory ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-400 hover:bg-blue-50'}`}
                        >
                            {t('shop.allTypes')}
                        </button>
                        {availableChildCategories.map((child: any) => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildCategory(child)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedChildCategory?.id === child.id ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                {child.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 pt-4">
              {filteredProducts?.map((product: any, i: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <Link to={`/product/${product.id}`} className="space-y-6 block">
                    <div className="aspect-square bg-white rounded-[40px] overflow-hidden relative border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-700 flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <span className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">{t('shop.shopNow')}</span>
                      </div>
                    </div>
                    <div className="px-4 flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-gray-900 leading-none">{product.name}</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-tighter text-[10px]">{product.size}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-blue-600">{Number(product.price).toFixed(0)} {t('common.dh')}</span>
                        {product.oldPrice && (
                            <span className="text-gray-400 text-xs line-through font-bold">{Number(product.oldPrice).toFixed(0)} {t('common.dh')}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                    <p className="text-gray-300 font-black text-2xl uppercase tracking-tighter italic">{t('shop.comingSoon')}</p>
                    <button onClick={() => setSelectedCategory(null)} className="text-blue-600 font-bold underline">{t('shop.tryAnother')}</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
