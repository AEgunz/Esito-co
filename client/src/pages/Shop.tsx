import { useQuery } from '@tanstack/react-query';
import api, { SERVER_URL } from '../api/axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LayoutGrid, Square, Grid2X2, ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Shop = () => {
  const { t } = useTranslation();
  const { categoryName } = useParams();
  const navigate = useNavigate();

  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<any>(null);
  const [mobileCols, setMobileCols] = useState(2);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/600';
    if (url.startsWith('http')) return url;
    const baseUrl = SERVER_URL === 'http://localhost:5000' && window.location.hostname !== 'localhost'
      ? `https://${window.location.hostname.replace('www.', '').replace('estilo-co.ma', 'esito-co-production.up.railway.app')}`
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

  // Derive selected category from URL with robust matching
  const selectedCategory = categories?.find((c: any) => {
    const dbName = decodeURIComponent(c.name).toLowerCase().trim().replace(/\s+/g, '-');
    const urlName = decodeURIComponent(categoryName || "").toLowerCase().trim().replace(/\s+/g, '-');
    return dbName === urlName;
  });

  // Reset filters when changing category
  useEffect(() => {
    setSelectedSubCategory(null);
    setSelectedChildCategory(null);
  }, [categoryName]);

  const handleCategoryClick = (cat: any) => {
    const slug = cat.name.toLowerCase().trim().replace(/\s+/g, '-');
    navigate(`/shop/${slug}`);
  };

  const subCategories = selectedCategory?.subCategories || [];
  const availableChildCategories = selectedSubCategory?.childCategories || [];

  const filteredProducts = selectedCategory
    ? allProducts?.filter((p: any) => {
        const belongsToMain = p.subCategory?.categoryId === selectedCategory.id;
        if (!belongsToMain) return false;
        if (selectedSubCategory && p.subCategoryId !== selectedSubCategory.id) return false;
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-20">
      <AnimatePresence mode="wait">
        {!categoryName || !selectedCategory ? (
          /* Step 1: Category Selection Grid */
          <motion.div
            key="categories-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-gray-900">{t('shop.title')}</h1>
              <p className="text-gray-400 font-medium text-lg italic">{t('shop.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {categories?.map((cat: any) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -8 }}
                  onClick={() => handleCategoryClick(cat)}
                  className="group relative aspect-[4/5] bg-white rounded-[48px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 text-left"
                >
                  <img
                    src={getImageUrl(cat.image)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                    alt={cat.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <h3 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">{cat.name}</h3>
                    <p className="text-gray-300 text-sm font-medium line-clamp-2 mb-6">{cat.description}</p>
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest bg-blue-600 w-fit px-6 py-3 rounded-full shadow-xl group-hover:bg-white group-hover:text-black transition-colors">
                        {t('shop.explore')} <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Step 2: Product View for Selected Category */
          <motion.div
            key={`products-${selectedCategory.id}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-8"
          >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 text-start">
                    <button
                        onClick={() => navigate('/shop')}
                        className="flex items-center gap-2 text-gray-400 hover:text-black transition font-black text-[10px] uppercase tracking-widest group bg-gray-50 px-4 py-2 rounded-full w-fit"
                    >
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform rtl:rotate-180" /> {t('shop.back')}
                    </button>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">{selectedCategory.name}</h2>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                    <button
                      onClick={() => setMobileCols(1)}
                      className={`p-2.5 rounded-xl transition-all ${mobileCols === 1 ? 'bg-white shadow-md text-black' : 'text-gray-300 hover:text-gray-600'}`}
                    >
                      <Square className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setMobileCols(2)}
                      className={`p-2.5 rounded-xl transition-all ${mobileCols === 2 ? 'bg-white shadow-md text-black' : 'text-gray-300 hover:text-gray-600'}`}
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <div className="px-3 flex items-center gap-2 text-start">
                      <LayoutGrid className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredProducts.length} {t('shop.shapes')}</span>
                    </div>
                </div>
            </div>

            {/* Filtering Tabs */}
            <div className="space-y-4 pt-6 border-t border-gray-100 text-start">
                {subCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { setSelectedSubCategory(null); setSelectedChildCategory(null); }}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!selectedSubCategory ? 'bg-black text-white shadow-xl scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}
                        >
                            {t('shop.allCategories')}
                        </button>
                        {subCategories.map((sub: any) => (
                            <button
                                key={sub.id}
                                onClick={() => { setSelectedSubCategory(sub); setSelectedChildCategory(null); }}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubCategory?.id === sub.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {availableChildCategories.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 py-3 px-5 bg-gray-50/50 rounded-3xl border border-gray-100 inline-flex"
                    >
                        <button
                            onClick={() => setSelectedChildCategory(null)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!selectedChildCategory ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t('shop.allTypes')}
                        </button>
                        {availableChildCategories.map((child: any) => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedChildCategory(child)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedChildCategory?.id === child.id ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                {child.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Products Grid */}
            <div className={`grid ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10`}>
              {filteredProducts?.map((product: any, i: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group"
                >
                  <Link to={`/product/${product.id}`} className="space-y-4 block">
                    <div className={`${mobileCols === 2 ? 'rounded-[24px]' : 'rounded-[40px]'} aspect-square bg-white overflow-hidden relative border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-700`}>
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s] ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition duration-700 flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <span className="bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">{t('shop.shopNow')}</span>
                      </div>
                    </div>

                    <div className={`${mobileCols === 2 ? 'px-1' : 'px-4'} space-y-2 text-start`}>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={`${mobileCols === 2 ? 'text-[11px]' : 'text-lg'} font-black text-gray-900 leading-tight truncate flex-1 uppercase italic`}>{product.name}</h3>
                        <span className={`${mobileCols === 2 ? 'text-[13px]' : 'text-xl'} font-black text-blue-600 shrink-0`}>{Number(product.price).toFixed(0)} {t('common.dh')}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-gray-50 pt-2">
                        <p className="text-gray-400 font-bold uppercase tracking-tighter text-[8px] truncate">
                          {product.size}
                        </p>
                        {product.colors && Array.isArray(product.colors) && product.colors.length > 0 && (
                          <div className="flex gap-0.5">
                            {product.colors.slice(0, 3).map((c: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: c.hex || c }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="py-40 text-center space-y-4">
                    <p className="text-gray-200 font-black text-4xl uppercase tracking-tighter italic">Coming Soon</p>
                    <button onClick={() => navigate('/shop')} className="text-blue-600 font-black uppercase text-xs tracking-widest underline">Try another category</button>
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
