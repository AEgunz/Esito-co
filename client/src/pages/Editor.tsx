import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, MapPin, User, Truck, RefreshCw,
  ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, AlertCircle,
  Ruler, X, Sparkles
} from 'lucide-react';
import api, { SERVER_URL } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const Editor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartTotal, cartCount } = useCart();
  const { t } = useTranslation();

  // State
  const [product, setProduct] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const { data: deliveryCities } = useQuery({
    queryKey: ['delivery-cities'],
    queryFn: async () => {
      try {
        const res = await api.get('/delivery');
        return Array.isArray(res.data) ? res.data : [];
      } catch (e) {
        return [];
      }
    }
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    // Auto-detect server URL if VITE_SERVER_URL is missing
    const baseUrl = SERVER_URL === 'http://localhost:5000' && window.location.hostname !== 'localhost'
      ? `https://${window.location.hostname.replace('www.', '').replace('estilo-co.ma', 'esito-co-production.up.railway.app')}`
      : SERVER_URL;

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

  useEffect(() => {
    if (!productId) {
      navigate('/shop');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${productId}`);
        const prod = res.data;

        if (!prod) {
          setFetchError("Product not found");
          return;
        }

        setProduct(prod);

        const images: string[] = [];
        if (prod.image) images.push(getImageUrl(prod.image));

        if (prod.images) {
          try {
            const parsed = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
            if (Array.isArray(parsed)) {
              parsed.forEach((img: any) => images.push(getImageUrl(img)));
            }
          } catch (e) {
            if (typeof prod.images === 'string') {
              prod.images.split(',').forEach((img: string) => images.push(getImageUrl(img.trim())));
            }
          }
        }

        const uniqueImages = Array.from(new Set(images.filter(Boolean))) as string[];
        setGallery(uniqueImages);
        setActiveImage(uniqueImages[0] || '');

        // Preload images
        uniqueImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });

        if (prod.size) setSelectedSize(prod.size.split(',')[0].trim());

        if (prod.colors && Array.isArray(prod.colors) && prod.colors.length > 0) {
            const firstColor = prod.colors[0];
            setSelectedColor(firstColor.hex || firstColor);
        }

        setFetchError(null);
      } catch (err: any) {
        console.error("Editor Load Error:", err);
        setFetchError("Failed to connect to server. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleAddToCart = () => {
    addToCart({
      cartId: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: activeImage,
      selectedSize,
      selectedColor,
      quantity
    });

    alert(t('editor.addToCart') + ' ✅');
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      alert('Please fill all details');
      return;
    }

    const shippingFee = formData.city ? (Number(deliveryCities?.find((c:any) => c.city === formData.city)?.fee) || 30) : 30;

    // Prepare items: Use cart items if exist, otherwise use current item
    const orderItems = cartCount > 0
      ? cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          customerPhoto: item.image
        }))
      : [{
          productId: product.id,
          quantity,
          price: Number(product.price),
          selectedSize,
          selectedColor,
          customerPhoto: activeImage
        }];

    const finalTotal = (cartCount > 0 ? cartTotal : (Number(product.price) * quantity)) + shippingFee;

    setIsSubmitting(true);
    try {
      await api.post('/orders', {
        items: orderItems,
        totalAmount: finalTotal,
        deliveryFee: shippingFee,
        firstName: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        email: 'customer@estilo-co.com'
      });
      navigate('/order-success');
    } catch (error) {
      alert('Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mb-4" />
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">{t('common.loading')}</p>
    </div>
  );

  if (fetchError || !product) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="font-bold text-gray-800">{fetchError || "Product Missing"}</p>
      <button onClick={() => navigate('/shop')} className="mt-4 bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition">Back to Shop</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 px-4 md:py-12 md:px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">

        {/* Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex items-center justify-center group">
            {activeImage ? (
               <img src={activeImage} alt="Product" className="w-full h-full object-contain p-4" />
            ) : (
               <div className="text-gray-300 font-bold uppercase text-xs">No Image</div>
            )}

            {gallery.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    const idx = gallery.indexOf(activeImage);
                    setActiveImage(gallery[idx > 0 ? idx - 1 : gallery.length - 1]);
                  }}
                  className="p-3 rounded-full bg-white shadow-xl pointer-events-auto hover:scale-110 transition-transform"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    const idx = gallery.indexOf(activeImage);
                    setActiveImage(gallery[idx < gallery.length - 1 ? idx + 1 : 0]);
                  }}
                  className="p-3 rounded-full bg-white shadow-xl pointer-events-auto hover:scale-110 transition-transform"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="flex flex-wrap justify-center gap-3">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8 text-start">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight uppercase italic">{product.name}</h1>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-4xl font-black text-blue-600">{Number(product.price).toFixed(0)} {t('common.dh')}</span>
              {product.oldPrice && <span className="text-2xl text-gray-300 line-through font-black">{Number(product.oldPrice).toFixed(0)} {t('common.dh')}</span>}
            </div>

            {/* Professional Description */}
            <div className="pt-4 space-y-4">
              <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
                {product.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.material')}</p>
                    <p className="text-xs font-bold text-gray-900">{t('editor.materialValue')}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.printQuality')}</p>
                    <p className="text-xs font-bold text-gray-900">{t('editor.printQualityValue')}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="bg-amber-50 p-2 rounded-lg">
                    <RefreshCw className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.durability')}</p>
                    <p className="text-xs font-bold text-gray-900">{t('editor.durabilityValue')}</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.fitType')}</p>
                    <p className="text-xs font-bold text-gray-900">{t('editor.fitTypeValue')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              {product.size && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.size')}</label>
                    <button onClick={() => setIsSizeGuideOpen(true)} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                      <Ruler className="h-3 w-3" /> {t('editor.guide')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.size.split(',').map((s: string) => (
                      <button key={s} onClick={() => setSelectedSize(s.trim())} className={`px-5 py-2.5 rounded-xl border-2 font-bold text-xs transition-all ${selectedSize === s.trim() ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>{s.trim()}</button>
                    ))}
                  </div>
                </div>
              )}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.color')}</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c: any, index: number) => {
                      const hex = c.hex || c;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedColor(hex);
                            if (c.image) setActiveImage(getImageUrl(c.image));
                            else if (gallery[index]) setActiveImage(gallery[index]);
                          }}
                          style={{ backgroundColor: hex }}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === hex ? 'border-blue-600 scale-125 shadow-xl ring-4 ring-blue-100' : 'border-white shadow-sm hover:scale-110'}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-50">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.quantity')} & {t('nav.cart')}</label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-6 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black">-</button>
                  <span className="w-6 text-center font-black">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black">+</button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[160px] bg-white text-blue-600 border-2 border-blue-600 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> {t('editor.addToCart')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-black p-8 md:p-10 rounded-[48px] shadow-2xl space-y-8 border border-white/5">
            <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-3 tracking-tighter"><Truck className="h-5 w-5 text-blue-500" /> {t('editor.shippingInfo')}</h3>
            <div className="grid gap-4">
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.fullName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.phone')} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <div className="relative text-start">
                <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold cursor-pointer appearance-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option value="" className="bg-gray-900">{t('editor.city')}</option>
                    {deliveryCities?.map((c:any) => <option key={c.id} value={c.city} className="bg-gray-900">{c.city}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronRight className="h-4 w-4 rotate-90" /></div>
              </div>
              <textarea className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.address')} rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            {/* Order Summary Calculation */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t('common.items')} in {t('nav.cart')}</span>
                  <span className="text-white font-black">{cartCount} {t('common.items')}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t('nav.cart')} {t('common.subtotal')}</span>
                  <span className="text-white font-black">{cartTotal.toFixed(0)} {t('common.dh')}</span>
               </div>
               {/* Show current item only if cart is empty or being added */}
               {cartCount === 0 && (
                 <div className="flex justify-between text-sm italic opacity-60 border-t border-white/5 pt-2">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Selected (x{quantity})</span>
                    <span className="text-white font-black">{(Number(product.price) * quantity).toFixed(0)} {t('common.dh')}</span>
                 </div>
               )}
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t('common.shipping')}</span>
                  <span className="text-white font-black">{formData.city ? (deliveryCities?.find((c:any) => c.city === formData.city)?.fee || 30) : 0} {t('common.dh')}</span>
               </div>
               <div className="h-px bg-white/10 my-2" />
               <div className="flex justify-between items-center">
                  <span className="text-blue-500 font-black uppercase tracking-widest text-xs">{t('common.total')}</span>
                  <span className="text-2xl font-black text-white">
                    {((cartCount > 0 ? cartTotal : (Number(product.price) * quantity)) + (formData.city ? (Number(deliveryCities?.find((c:any) => c.city === formData.city)?.fee) || 30) : 0)).toFixed(0)} {t('common.dh')}
                  </span>
               </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-xl hover:bg-blue-700 transition shadow-xl uppercase flex items-center justify-center gap-3 active:scale-95">
              {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin" /> : <>{t('editor.confirmOrder')} <ArrowRight className="h-6 w-6" /></>}
            </button>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-center text-xs font-black text-blue-500 uppercase tracking-[0.2em] italic">{t('editor.deliveryNote')}</p>
              <p className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('editor.checkInfo')}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 bg-black/80"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">Size Guide</h2>
                <button onClick={() => setIsSizeGuideOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[75vh]">
                <img
                  src="/size-guide.jpg"
                  alt="Guide"
                  className="w-full h-auto"
                />
              </div>
              <div className="p-6 bg-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Please follow measurements for the perfect fit</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Editor;
