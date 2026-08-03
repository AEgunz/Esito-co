import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import { Plus, Pencil, Trash2, X, Upload, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', oldPrice: '', size: '',
    categoryId: '', subCategoryId: '', childCategoryId: '', image: '', images: [] as string[],
    colors: [] as {hex: string, image: string}[],
    requiresCustomPhotos: false, photoCount: 0
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get('/products')).data
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const availableSubCategories = useMemo(() => {
    if (!formData.categoryId || !categories) return [];
    return categories.find((c: any) => c.id === formData.categoryId)?.subCategories || [];
  }, [formData.categoryId, categories]);

  const availableChildCategories = useMemo(() => {
    if (!formData.subCategoryId || !availableSubCategories) return [];
    return availableSubCategories.find((s: any) => s.id === formData.subCategoryId)?.childCategories || [];
  }, [formData.subCategoryId, availableSubCategories]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
        const payload = { ...data };
        delete payload.categoryId;
        return editingId ? api.patch(`/products/${editingId}`, payload) : api.post('/products', payload);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        closeModal();
        alert('Success! Inventory updated.');
    },
    onError: (error: any) => alert('Error: ' + (error.response?.data?.message || error.message))
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  });

  const openModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);

      // Fix: Normalize colors to the new object format if they are just strings
      const rawColors = product.colors || [];
      const normalizedColors = rawColors.map((c: any) =>
        typeof c === 'string' ? { hex: c, image: '' } : c
      );

      setFormData({
        name: product.name, description: product.description || '',
        price: product.price, oldPrice: product.oldPrice || '', size: product.size || '',
        categoryId: product.childCategory?.subCategory?.categoryId || product.subCategory?.categoryId || '',
        subCategoryId: product.subCategoryId,
        childCategoryId: product.childCategoryId || '',
        image: product.image,
        images: product.images || [],
        colors: normalizedColors,
        requiresCustomPhotos: product.requiresCustomPhotos || false,
        photoCount: product.photoCount || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', oldPrice: '', size: '',
        categoryId: '', subCategoryId: '', childCategoryId: '',
        image: '', images: [], colors: [],
        requiresCustomPhotos: false, photoCount: 0
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/upload', data);
      if (isGallery) {
          setFormData({ ...formData, images: [...formData.images, res.data.url] });
      } else {
          setFormData({ ...formData, image: res.data.url });
      }
    } catch (error) { alert('Upload failed'); } finally { setIsUploading(false); }
  };

  if (productsLoading) return <div className="p-20 text-center animate-pulse font-bold text-gray-400">LOADING INVENTORY...</div>;

  return (
    <div className="space-y-10 px-4 lg:px-0 pb-20">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">Product Inventory</h1>
        <button onClick={() => openModal()} className="bg-black text-white px-10 py-4 rounded-[22px] flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-2xl">
          <Plus className="h-5 w-5" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {products?.map((product: any) => (
          <motion.div layout key={product.id} className="bg-white p-6 rounded-[44px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
            <div className="aspect-square rounded-[36px] overflow-hidden mb-6 bg-gray-50 border border-gray-50">
                <img src={getImageUrl(product.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            </div>
            <div className="space-y-4 px-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900 leading-none">{product.name}</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-tighter text-[9px] flex items-center gap-1">
                            {product.subCategory?.category?.name} <ChevronRight className="h-2 w-2" />
                            {product.subCategory?.name}
                            {product.childCategory && (
                                <>
                                    <ChevronRight className="h-2 w-2" />
                                    <span className="text-blue-500">{product.childCategory?.name}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-2xl font-black text-sm shadow-lg">{Number(product.price).toFixed(0)} DH</span>
                        {product.oldPrice && (
                            <span className="text-gray-400 text-[10px] line-through mt-1 font-bold">{Number(product.oldPrice).toFixed(0)} DH</span>
                        )}
                    </div>
                </div>
                <div className="pt-4 flex gap-3">
                    <button onClick={() => openModal(product)} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center justify-center gap-2 italic"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                    <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(product.id) }} className="w-16 bg-red-50 text-red-400 rounded-[20px] flex items-center justify-center hover:bg-red-600 hover:text-white transition"><Trash2 className="h-4 w-4" /></button>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-12 space-y-8 max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{editingId ? 'Edit Product' : 'New Product'}</h2>
                <div className="grid grid-cols-2 gap-6">

                    {/* Concept Toggle */}
                    <div className="col-span-2 space-y-4 bg-blue-50/20 p-6 rounded-[32px] border border-blue-100">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-blue-900 uppercase tracking-tight">Requires Customer Photos?</label>
                                <p className="text-[9px] text-blue-400 font-bold uppercase">Enable for custom T-shirts/Mugs</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, requiresCustomPhotos: !formData.requiresCustomPhotos})}
                                className={`w-14 h-8 rounded-full transition-all relative ${formData.requiresCustomPhotos ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${formData.requiresCustomPhotos ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        {formData.requiresCustomPhotos && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-blue-100 space-y-2">
                                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Number of Photos Needed</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold shadow-sm"
                                    value={formData.photoCount}
                                    onChange={e => setFormData({...formData, photoCount: parseInt(e.target.value) || 0})}
                                />
                            </motion.div>
                        )}
                    </div>

                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                        <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Category</label>
                        <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold appearance-none" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value, subCategoryId: '', childCategoryId: ''})}>
                            <option value="">Select...</option>
                            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub-Category</label>
                        <select disabled={!formData.categoryId} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold appearance-none disabled:opacity-30" value={formData.subCategoryId} onChange={e => setFormData({...formData, subCategoryId: e.target.value, childCategoryId: ''})}>
                            <option value="">Select...</option>
                            {availableSubCategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (DH)</label><input type="number" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Old Price</label><input type="number" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={formData.oldPrice} onChange={e => setFormData({...formData, oldPrice: e.target.value})} /></div>

                    <div className="col-span-2 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sizes</label>
                        <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            {['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Oversize'].map(s => {
                                const currentSizes = formData.size ? formData.size.split(',').map(x => x.trim()) : [];
                                const isSelected = currentSizes.includes(s);
                                return (
                                    <button key={s} type="button" onClick={() => {
                                        const newSizes = isSelected ? currentSizes.filter(x => x !== s) : [...currentSizes, s];
                                        setFormData({...formData, size: newSizes.join(', ')});
                                    }} className={`h-10 px-4 rounded-xl border-2 font-black text-[10px] transition-all ${isSelected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-400'}`}>{s}</button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="col-span-2 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color Options & Linked Images</label>
                        <div className="grid gap-4">
                            <div className="flex gap-3 flex-wrap p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner">
                                {['#FFFFFF', '#000000', '#FF0000', '#0000FF', '#008000', '#FFD700', '#FFC0CB', '#C2A381', '#87CEEB'].map(c => {
                                    const isSelected = formData.colors.some((col: any) => (col.hex || col) === c);
                                    return (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setFormData({...formData, colors: formData.colors.filter((col: any) => (col.hex || col) !== c)});
                                                } else {
                                                    setFormData({...formData, colors: [...formData.colors, {hex: c, image: ''}]});
                                                }
                                            }}
                                            className={`w-10 h-10 rounded-full border-4 transition-all ${isSelected ? 'border-blue-600 scale-110 shadow-lg' : 'border-white shadow-sm'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Mapping UI */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {formData.colors.map((colorObj: any, idx) => {
                                    const hex = colorObj.hex || colorObj;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-full border shadow-inner shrink-0" style={{ backgroundColor: hex }} />
                                            <div className="flex-1 min-w-0">
                                                {colorObj.image ? (
                                                    <div className="relative aspect-video rounded-xl overflow-hidden group">
                                                        <img src={getImageUrl(colorObj.image)} className="w-full h-full object-cover" />
                                                        <button onClick={() => {
                                                            const newColors = [...formData.colors];
                                                            newColors[idx] = { hex, image: '' };
                                                            setFormData({...formData, colors: newColors});
                                                        }} className="absolute inset-0 bg-red-600/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black text-[10px] uppercase">Remove Image</button>
                                                    </div>
                                                ) : (
                                                    <label className="h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                                                        <Upload className="h-4 w-4 text-gray-300" />
                                                        <span className="text-[8px] font-black uppercase text-gray-400 mt-1">Mockup Photo</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const data = new FormData();
                                                            data.append('image', file);
                                                            try {
                                                                const res = await api.post('/upload', data);
                                                                const newColors = [...formData.colors];
                                                                newColors[idx] = { hex, image: res.data.url };
                                                                setFormData({...formData, colors: newColors});
                                                            } catch (err) { alert('Upload failed'); }
                                                        }} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 space-y-2 pt-4 border-t border-gray-50">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Image</label>
                        {formData.image ? (
                            <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50"><img src={getImageUrl(formData.image)} className="w-full h-full object-cover" /><button onClick={() => setFormData({...formData, image: ''})} className="absolute top-4 right-4 bg-black text-white p-2.5 rounded-full shadow-lg"><X className="h-4 w-4" /></button></div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-[32px] bg-gray-50 cursor-pointer hover:bg-gray-100 transition group">{isUploading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" /> : <><Upload className="h-6 w-6 text-gray-300" /><span className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Main photo</span></>}<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                        )}
                    </div>

                    <div className="col-span-2 space-y-4 pt-4 border-t border-gray-50">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gallery (Additional Photos)</label>
                        <div className="grid grid-cols-4 gap-4">
                            {formData.images?.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                                    <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                    <button onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition group">
                                <Plus className="h-6 w-6 text-gray-300" />
                                <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, true)} />
                            </label>
                        </div>
                    </div>
                </div>
                <button onClick={() => saveMutation.mutate(formData)} disabled={!formData.subCategoryId || !formData.image || saveMutation.isPending} className="w-full bg-blue-600 text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl disabled:opacity-30">Save Product</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
