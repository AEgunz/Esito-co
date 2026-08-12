import { useQuery } from '@tanstack/react-query';
import api, { SERVER_URL } from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LayoutGrid, Square, Grid2X2, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Shop = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState<any>(null);
  const [mobileCols, setMobileCols] = useState(2); // Default to 2 for better browsing

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

  // Auto-select first category if none selected
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

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
    : allProducts || [];

  if (catsLoading || productsLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Main Categories Tabs */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-gray-100 pb-6">
          {categories?.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubCategory(null);
                setSelectedChildCategory(null);
              }}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                selectedCategory?.id === cat.id
                ? 'bg-black text-white shadow-2xl scale-105'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sub-Categories (Level 2 Tabs) */}
        <AnimatePresence mode="wait">
          {subCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <button
                onClick={() => { setSelectedSubCategory(null); setSelectedChildCategory(null); }}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  !selectedSubCategory ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                }`}
              >
                {t('shop.allCategories')}
              </button>
              {subCategories.map((sub: any) => (
                <button
                  key={sub.id}
                  onClick={() => { setSelectedSubCategory(sub); setSelectedChildCategory(null); }}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedSubCategory?.id === sub.id ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header Info & Layout Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black tracking-tighter uppercase italic text-gray-900">{selectedCategory?.name}</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{filteredProducts.length} {t('shop.shapes')} Available</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => setMobileCols(1)}
              className={`p-2.5 rounded-xl transition-all ${mobileCols === 1 ? 'bg-black text-white shadow-lg' : 'text-gray-300 hover:text-gray-900'}`}
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileCols(2)}
              className={`p-2.5 rounded-xl transition-all ${mobileCols === 2 ? 'bg-black text-white shadow-lg' : 'text-gray-300 hover:text-gray-900'}`}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* Child Categories (Level 3 - Tags) */}
      <AnimatePresence>
        {availableChildCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-10"
          >
            {availableChildCategories.map((child: any) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildCategory(selectedChildCategory?.id === child.id ? null : child)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedChildCategory?.id === child.id ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {child.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className={`grid ${mobileCols === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-10`}>
        {filteredProducts?.map((product: any, i: number) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

              <div className={`${mobileCols === 2 ? 'px-1' : 'px-4'} space-y-2`}>
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
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-40 text-center space-y-4">
            <p className="text-gray-200 font-black text-4xl uppercase tracking-tighter italic">No Items Found</p>
            <button onClick={() => { setSelectedSubCategory(null); setSelectedChildCategory(null); }} className="text-blue-600 font-black uppercase text-xs tracking-widest underline">Show All {selectedCategory?.name}</button>
        </div>
      )}
    </div>
  );
};

export default Shop;
