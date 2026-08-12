import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, MapPin, User, Truck, RefreshCw,
  ChevronLeft, ChevronRight, ShoppingBag, ArrowRight, AlertCircle,
  Ruler, X, Star, MessageSquare, Upload, Type
} from 'lucide-react';
import api, { SERVER_URL } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const Editor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, addToCart, cartTotal, cartCount, clearCart } = useCart();
  const { t } = useTranslation();

  // State
  const [activeImage, setActiveImage] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '', note: '' });
  const [citySearch, setCitySearch] = useState('');
  const [isCityListOpen, setIsCityListOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customPhotos, setCustomPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '', userName: '' });
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

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

  const filteredCities = citySearch.length >= 1
    ? deliveryCities?.filter((c: any) => c.city.toLowerCase().includes(citySearch.toLowerCase()))
    : [];

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await api.get(`/products/${productId}`);
      return res.data;
    },
    enabled: !!productId
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    const baseUrl = SERVER_URL === 'http://localhost:5000' && window.location.hostname !== 'localhost'
      ? `https://${window.location.hostname.replace('www.', '').replace('estilo-co.ma', 'esito-co-production.up.railway.app')}`
      : SERVER_URL;

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${cleanUrl}`;
  };

  useEffect(() => {
    if (product) {
      const images: string[] = [];
      if (product.image) images.push(getImageUrl(product.image));

      if (product.images) {
        try {
          const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          if (Array.isArray(parsed)) {
            parsed.forEach((img: any) => images.push(getImageUrl(img)));
          }
        } catch (e) {
          if (typeof product.images === 'string') {
            product.images.split(',').forEach((img: string) => images.push(getImageUrl(img.trim())));
          }
        }
      }

      const uniqueImages = Array.from(new Set(images.filter(Boolean))) as string[];
      setGallery(uniqueImages);
      if (!activeImage) setActiveImage(uniqueImages[0] || '');

      if (!selectedSize && product.size) setSelectedSize(product.size.split(',')[0].trim());

      if (!selectedColor && product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
          const firstColor = product.colors[0];
          setSelectedColor(firstColor.hex || firstColor);
      }
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxPhotos = product?.photoCount || 1;
    const remainingSlots = maxPhotos - customPhotos.length;

    if (remainingSlots <= 0) {
        alert(`You can only upload up to ${maxPhotos} photos.`);
        return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const res = await api.post('/upload', uploadData);
        return res.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setCustomPhotos(prev => [...prev, ...urls]);
    } catch (error) {
      alert('Error uploading one or more photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToCart = () => {
    const requiredPhotos = product.photoCount || (product.requiresCustomPhotos ? 1 : 0);
    if (product.requiresCustomPhotos && customPhotos.length < requiredPhotos) {
        alert(`${t('editor.uploadRequired')} (${customPhotos.length}/${requiredPhotos})`);
        return;
    }

    addToCart({
      cartId: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: customPhotos[0] || activeImage,
      selectedSize,
      selectedColor,
      quantity,
      customText: customText,
      customPhotos: customPhotos // Pass all photos
    });

    alert(t('editor.addToCart') + ' ✅');
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.city || !formData.address) {
      alert('Please fill all details');
      return;
    }

    const requiredPhotos = product.photoCount || (product.requiresCustomPhotos ? 1 : 0);
    if (product.requiresCustomPhotos && customPhotos.length < requiredPhotos) {
        alert(`${t('editor.uploadRequired')} (${customPhotos.length}/${requiredPhotos})`);
        return;
    }

    const shippingFee = formData.city ? (Number(deliveryCities?.find((c:any) => c.city === formData.city)?.fee) || 30) : 30;

    const orderItems = cartCount > 0
      ? cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          customerPhoto: item.customPhotos ? JSON.stringify(item.customPhotos) : item.image,
          customText: item.customText
        }))
      : [{
          productId: product.id,
          quantity,
          price: Number(product.price),
          selectedSize,
          selectedColor,
          customerPhoto: customPhotos.length > 0 ? JSON.stringify(customPhotos) : activeImage,
          customText: customText
        }];

    const finalTotal = (cartCount > 0 ? cartTotal : (Number(product.price) * quantity)) + shippingFee;

    setIsSubmitting(true);
    try {
      const res = await api.post('/orders', {
        items: orderItems,
        totalAmount: finalTotal,
        deliveryFee: shippingFee,
        firstName: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        note: formData.note,
        email: 'customer@estilo-co.com'
      });

      // Color Helper
      const getColorInfo = (hex: string) => {
        const h = hex.toUpperCase();
        const mapping: any = {
          '#FFFFFF': { name: 'أبيض (White)', emoji: '⚪' },
          '#000000': { name: 'أسود (Black)', emoji: '⚫' },
          '#FF0000': { name: 'أحمر (Red)', emoji: '🔴' },
          '#0000FF': { name: 'أزرق (Blue)', emoji: '🔵' },
          '#008000': { name: 'أخضر (Green)', emoji: '🟢' },
          '#FFD700': { name: 'ذهبي / أصفر (Gold)', emoji: '🟡' },
          '#FFC0CB': { name: 'وردي (Pink)', emoji: '🌸' },
          '#C2A381': { name: 'بيج (Beige)', emoji: '🟤' },
          '#87CEEB': { name: 'سماوي (Sky Blue)', emoji: '💎' }
        };
        return mapping[h] || { name: hex, emoji: '🎨' };
      };

      // Format WhatsApp Message
      const whatsappNumber = "212693360625";
      let message = `*طلب جديد من Estilo-co*\n\n`;
      message += `*رقم الطلب:* #${newOrder.id.substring(0, 8)}\n`;
      message += `*الاسم:* ${formData.name}\n`;
      message += `*الهاتف:* ${formData.phone}\n`;
      message += `*المدينة:* ${formData.city}\n`;
      message += `*العنوان:* ${formData.address}\n`;
      if (formData.note) message += `*ملاحظة:* ${formData.note}\n`;
      message += `\n*المنتجات:*\n`;

      orderItems.forEach((item: any, index: number) => {
        const prodName = cartCount > 0 ? cart[index].name : product.name;

        // Get localized color name and emoji
        const colorInfo = getColorInfo(item.selectedColor || '');
        const colorDisplay = `${colorInfo.emoji} ${colorInfo.name}`;

        message += `📦 *${prodName}*\n`;
        message += `📏 *المقاس:* ${item.selectedSize}\n`;
        if (item.selectedColor) message += `🎨 *اللون:* ${colorDisplay}\n`;
        message += `🔢 *الكمية:* ${item.quantity}\n`;

        // Handle multiple photos in WhatsApp message
        try {
            const photos = JSON.parse(item.customerPhoto);
            if (Array.isArray(photos)) {
                photos.forEach((p, i) => {
                    message += `🖼️ *الصورة ${i+1}:* ${getImageUrl(p).replace('esito-co-production.up.railway.app', 'www.estilo-co.ma')}\n`;
                });
            } else {
                message += `🖼️ *الصورة:* ${getImageUrl(item.customerPhoto).replace('esito-co-production.up.railway.app', 'www.estilo-co.ma')}\n`;
            }
        } catch (e) {
            message += `🖼️ *الصورة:* ${getImageUrl(item.customerPhoto).replace('esito-co-production.up.railway.app', 'www.estilo-co.ma')}\n`;
        }

        if (item.customText) message += `📝 *الكتابة:* ${item.customText}\n`;
        message += `\n`;
      });

      message += `*المجموع الكلي:* ${finalTotal.toFixed(0)} DH\n\n`;

      // Add first image link again at the very end to help WhatsApp generate a preview
      const firstPhoto = orderItems[0]?.customerPhoto;
      if (firstPhoto) {
          try {
              const p = JSON.parse(firstPhoto);
              const url = Array.isArray(p) ? p[0] : firstPhoto;
              message += `${getImageUrl(url).replace('esito-co-production.up.railway.app', 'www.estilo-co.ma')}`;
          } catch(e) {
              message += `${getImageUrl(firstPhoto).replace('esito-co-production.up.railway.app', 'www.estilo-co.ma')}`;
          }
      }

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      alert('Order placed successfully! Redirecting to WhatsApp...');

      // Use window.location.href for better mobile compatibility
      window.location.href = whatsappUrl;

      clearCart();
      navigate('/order-success');
    } catch (error: any) {
      console.error('Order Error:', error);
      alert(`Error: ${error.response?.data?.message || 'Could not connect to server. Check your connection.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData.userName || !reviewData.comment) {
      alert('Please fill all review fields');
      return;
    }
    setIsReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        ...reviewData,
        productId: product.id
      });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      setReviewData({ rating: 5, comment: '', userName: '' });
      alert('Review submitted! Thank you.');
    } catch (error) {
      alert('Error submitting review');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <RefreshCw className="h-10 w-10 animate-spin text-blue-600 mb-4" />
      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">{t('common.loading')}</p>
    </div>
  );

  if (isError || !product) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="font-bold text-gray-800">Product Not Found</p>
      <button onClick={() => navigate('/shop')} className="mt-4 bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition">Back to Shop</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 px-4 md:py-12 md:px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 text-start">

        {/* Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex items-center justify-center group text-center">
            {activeImage ? (
               <Zoom>
                 <img src={activeImage} alt="Product" className="w-full h-full object-contain p-4 cursor-zoom-in" />
               </Zoom>
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
          <div className="space-y-3 text-start">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight uppercase italic">{product.name}</h1>

            {/* Quick Ratings Info */}
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="flex gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                ({product.reviews?.length || 0} {t('editor.reviews')})
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-4xl font-black text-blue-600">{Number(product.price).toFixed(0)} {t('common.dh')}</span>
              {product.oldPrice && <span className="text-2xl text-gray-300 line-through font-black">{Number(product.oldPrice).toFixed(0)} {t('common.dh')}</span>}
            </div>

            {/* Professional Description (Show only for non-custom products, mostly T-shirts) */}
            {!product.requiresCustomPhotos && (
              <div className="pt-4 space-y-4 text-start">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="bg-green-50 p-2 rounded-lg text-start">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-start">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.material')}</p>
                      <p className="text-xs font-bold text-gray-900">{t('editor.materialValue')}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="bg-blue-50 p-2 rounded-lg text-start">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-start">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.printQuality')}</p>
                      <p className="text-xs font-bold text-gray-900">{t('editor.printQualityValue')}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm text-start">
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="text-start">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.durability')}</p>
                      <p className="text-xs font-bold text-gray-900">{t('editor.durabilityValue')}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl flex items-center gap-3 shadow-sm text-start">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-start">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{t('editor.fitType')}</p>
                      <p className="text-xs font-bold text-gray-900">{t('editor.fitTypeValue')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Simple Description for Custom Products (Keychains, Mugs) */}
            {product.requiresCustomPhotos && (
              <div className="pt-4 text-start">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-8 text-start">
            <div className="grid sm:grid-cols-2 gap-8 text-start">
              {product.size && (
                <div className="space-y-3 text-start">
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
                <div className="space-y-3 text-start">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.color')}</label>
                  <div className="flex flex-wrap gap-2 text-start">
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

            {/* Customization Controls (If Product Requires) */}
            {product.requiresCustomPhotos && (
              <div className="space-y-6 pt-6 border-t border-gray-50">
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-start flex gap-3 animate-pulse">
                   <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                   <p className="text-[11px] font-black text-red-600 leading-relaxed italic">
                     {t('editor.customizationNote')}
                   </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Upload className="h-3 w-3" /> {t('editor.uploadPhoto')}</span>
                    <span className="text-blue-600">({customPhotos.length} / {product.photoCount || 1})</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {customPhotos.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                        <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setCustomPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    {customPhotos.length < (product.photoCount || 1) && (
                      <div className="relative aspect-square">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className={`w-full h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isUploading ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                        >
                          {isUploading ? (
                            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-gray-400 mb-1" />
                              <span className="text-[8px] font-black text-gray-500 uppercase">{t('common.add')}</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Type className="h-3 w-3" /> {t('editor.customText')}
                  </label>
                  <textarea
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all text-sm"
                    rows={2}
                    placeholder={t('editor.customTextPlaceholder')}
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 pt-6 border-t border-gray-50 text-start">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.quantity')} & {t('nav.cart')}</label>
              <div className="flex flex-wrap items-center gap-4 text-start">
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
        </div>
      </div>

      {/* NEW LAYOUT: Reviews on Left, Shipping on Right for PC */}
      <div className="max-w-7xl mx-auto mt-12 grid lg:grid-cols-2 gap-8 lg:gap-12 text-start">

        {/* Left Side: Reviews */}
        <div className="space-y-12 order-2 lg:order-1 text-start">
          <div className="flex items-center justify-between text-start">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-gray-900">
              <MessageSquare className="h-6 w-6 text-blue-600" /> {t('editor.reviews')}
            </h2>
            <div className="bg-white px-4 py-2 rounded-full border border-gray-100 font-bold text-xs shadow-sm">
              {product.reviews?.length || 0} {t('common.items')}
            </div>
          </div>

          <div className="space-y-6 text-start">
            {product.reviews?.length > 0 ? (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-4 text-start">
                  <div className="flex justify-between items-start text-start">
                    <div className="space-y-1 text-start">
                      <p className="font-black text-gray-900">{rev.userName}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium text-start">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-200">
                 <p className="text-gray-400 font-bold italic">{t('editor.noReviews')}</p>
              </div>
            )}

            {/* Add Review Form */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6 text-start">
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-gray-900">{t('editor.writeReview')}</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-start">
                   <div className="grid md:grid-cols-2 gap-4 text-start">
                      <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.name')}</label>
                        <input
                          className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                          placeholder={t('editor.name')}
                          value={reviewData.userName}
                          onChange={e => setReviewData({...reviewData, userName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.rating')}</label>
                        <div className="flex gap-1 text-start">
                          {[1,2,3,4,5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setReviewData({...reviewData, rating: num})}
                              className={`p-2 transition-all ${reviewData.rating >= num ? 'text-amber-400 scale-110' : 'text-gray-200'}`}
                            >
                              <Star className={`h-5 w-5 ${reviewData.rating >= num ? 'fill-current' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <div className="space-y-2 text-start">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('editor.comment')}</label>
                     <textarea
                       className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all"
                       rows={3}
                       placeholder={t('editor.comment')}
                       value={reviewData.comment}
                       onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                     />
                   </div>
                   <button
                     type="submit"
                     disabled={isReviewSubmitting}
                     className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition shadow-lg disabled:opacity-50"
                   >
                     {isReviewSubmitting ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : t('editor.submitReview')}
                   </button>
                </form>
             </div>
          </div>
        </div>

        {/* Right Side: Shipping Information (The Black Box) */}
        <div className="order-1 lg:order-2 text-start">
          <div className="bg-black p-8 md:p-10 rounded-[48px] shadow-2xl space-y-8 border border-white/5 sticky top-24 text-start">
            <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-3 tracking-tighter"><Truck className="h-5 w-5 text-blue-500" /> {t('editor.shippingInfo')}</h3>
            <div className="grid gap-4 text-start">
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.fullName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.phone')} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />

              <div className="relative text-start">
                <div className="relative">
                    <input
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner"
                        placeholder={formData.city || t('editor.city')}
                        value={citySearch}
                        onChange={(e) => {
                            setCitySearch(e.target.value);
                            setIsCityListOpen(true);
                        }}
                        onFocus={() => setIsCityListOpen(true)}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronRight className="h-4 w-4 rotate-90" /></div>
                </div>

                <AnimatePresence>
                    {isCityListOpen && citySearch.length >= 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-[60] left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl shadow-2xl py-2 custom-scrollbar"
                        >
                            {filteredCities?.length > 0 ? (
                                filteredCities.map((c: any) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData({...formData, city: c.city});
                                            setCitySearch(c.city);
                                            setIsCityListOpen(false);
                                        }}
                                        className="w-full text-left px-6 py-3 text-white hover:bg-blue-600 font-bold text-sm transition-colors flex justify-between items-center"
                                    >
                                        <span>{c.city}</span>
                                        <span className="text-[10px] text-gray-400 font-black">{Number(c.fee).toFixed(0)} DH</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-6 py-4 text-gray-500 font-bold text-xs italic">No cities found...</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>

              <textarea className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.address')} rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <input className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-inner" placeholder={t('editor.note')} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
            </div>

            {/* Order Summary Calculation */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3 text-start">
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
                  <span className="text-blue-500 font-black uppercase tracking-widest text-xs italic">Total</span>
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
              <p className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">{t('cart.payOnDelivery')}</p>
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
