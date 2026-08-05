import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, MapPin, User, Truck, RefreshCw,
  ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, Smartphone, AlertCircle,
  Upload, Trash2, Ruler, X, Sparkles
} from 'lucide-react';
import api, { SERVER_URL } from '../api/axios';

const Editor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

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
  const [customPhotos, setCustomPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${SERVER_URL}${cleanUrl}`;
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/upload', data);
      setCustomPhotos(prev => [...prev, res.data.url]);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      alert('Please fill all details');
      return;
    }

    if (product?.requiresCustomPhotos && customPhotos.length < product.photoCount) {
      alert(`Upload ${product.photoCount} photos first`);
      return;
    }

    const shippingFee = formData.city ? (Number(deliveryCities?.find((c:any) => c.city === formData.city)?.fee) || 30) : 30;
    const subtotal = Number(product.price) * quantity;

    setIsSubmitting(true);
    try {
      await api.post('/orders', {
        items: [{
          productId: product.id,
          quantity,
          price: Number(product.price),
          selectedSize,
          selectedColor,
          customerPhoto: product.requiresCustomPhotos ? JSON.stringify(customPhotos) : activeImage
        }],
        totalAmount: subtotal + shippingFee,
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
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Syncing Product...</p>
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
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]">{product.name}</h1>
            <div className="flex items-center gap-4 pt-2">
              <span className="text-3xl font-black text-blue-600">{Number(product.price).toFixed(0)} DH</span>
              {product.oldPrice && <span className="text-xl text-gray-300 line-through font-bold">{Number(product.oldPrice).toFixed(0)} DH</span>}
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              {product.size && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Size</label>
                    <button onClick={() => setIsSizeGuideOpen(true)} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                      <Ruler className="h-3 w-3" /> Guide
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color</label>
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

            {product.requiresCustomPhotos && (
              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex gap-3 shadow-sm">
                    <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-blue-900 leading-relaxed">
                        <span className="font-black uppercase block mb-1 tracking-widest text-[9px] text-blue-600 italic">Personalized Design</span>
                        يرجى رفع صورتك الشخصية. فريقنا سيقوم بتحويلها إلى تصميم احترافي وإرسالها لك للتأكيد قبل الطباعة.
                    </p>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Upload Your Photos ({customPhotos.length}/{product.photoCount})</label>
                  {customPhotos.length > 0 && <button onClick={() => setCustomPhotos([])} className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1"><Trash2 className="h-3 w-3" /> Clear</button>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {customPhotos.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                      <button onClick={() => setCustomPhotos(customPhotos.filter((_, i) => i !== idx))} className="absolute inset-0 bg-red-600/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  ))}
                  {customPhotos.length < product.photoCount && (
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition relative overflow-hidden">
                      {isUploading ? <RefreshCw className="h-5 w-5 animate-spin text-blue-600" /> : <Upload className="h-5 w-5 text-gray-300" />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-gray-50">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
              <div className="flex items-center gap-6 bg-gray-50 w-fit p-1.5 rounded-2xl border border-gray-100">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black">-</button>
                <span className="w-6 text-center font-black">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black">+</button>
              </div>
            </div>
          </div>

          <div className="bg-black p-8 md:p-10 rounded-[48px] shadow-2xl space-y-8 border border-white/5">
            <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-3 tracking-tighter"><Truck className="h-5 w-5 text-blue-500" /> Fast Shipping Info</h3>
            <div className="grid gap-4">
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <div className="relative">
                <select className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold cursor-pointer appearance-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option value="" className="bg-gray-900">Select City...</option>
                    {deliveryCities?.map((c:any) => <option key={c.id} value={c.city} className="bg-gray-900">{c.city}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronRight className="h-4 w-4 rotate-90" /></div>
              </div>
              <textarea className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder="Address" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            {/* Order Summary Calculation */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Subtotal ({quantity}x)</span>
                  <span className="text-white font-black">{(Number(product.price) * quantity).toFixed(0)} DH</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">Shipping Fee</span>
                  <span className="text-white font-black">{formData.city ? (deliveryCities?.find((c:any) => c.city === formData.city)?.fee || 30) : 0} DH</span>
               </div>
               <div className="h-px bg-white/10 my-2" />
               <div className="flex justify-between items-center">
                  <span className="text-blue-500 font-black uppercase tracking-widest text-xs">Total to Pay</span>
                  <span className="text-2xl font-black text-white">
                    {((Number(product.price) * quantity) + (formData.city ? (Number(deliveryCities?.find((c:any) => c.city === formData.city)?.fee) || 30) : 0)).toFixed(0)} DH
                  </span>
               </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black text-xl hover:bg-blue-700 transition shadow-xl uppercase flex items-center justify-center gap-3 active:scale-95">
              {isSubmitting ? <RefreshCw className="h-6 w-6 animate-spin" /> : <>Confirm Order <ArrowRight className="h-6 w-6" /></>}
            </button>
            <p className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">Double check your info before confirming</p>
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
