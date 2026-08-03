import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import { Plus, Pencil, Trash2, X, Upload, ListTree, Layers, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [subFormData, setSubFormData] = useState({ name: '' });
  const [childFormData, setChildFormData] = useState({ name: '' });

  const { data: categories, isLoading, isError, error: fetchError } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get('/categories')).data
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editingId ? api.patch(`/categories/${editingId}`, data) : api.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
      alert('Success! Collection saved.');
    },
    onError: (error: any) => {
      console.error(error);
      alert('Error saving category: ' + (error.response?.data?.message || 'Something went wrong'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
    onError: () => alert('Failed to delete. Make sure it has no sub-categories first.')
  });

  const addSubMutation = useMutation({
    mutationFn: (data: any) => api.post('/categories/sub', { ...data, categoryId: selectedParentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsSubModalOpen(false);
      setSubFormData({name:''});
    },
    onError: (error: any) => alert('Error: ' + (error.response?.data?.message || 'Check if name already exists'))
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/sub/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  });

  const addChildMutation = useMutation({
    mutationFn: (data: any) => api.post('/categories/child', { ...data, subCategoryId: selectedParentId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setIsChildModalOpen(false); setChildFormData({name:''}); }
  });

  const deleteChildMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/child/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  });

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/upload', data);
      setFormData({ ...formData, image: res.data.url });
    } catch (error) { alert('Upload failed'); } finally { setIsUploading(false); }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Collections...</div>;
  if (isError) return (
    <div className="p-20 text-center text-red-500 bg-white rounded-[40px] shadow-xl max-w-2xl mx-auto mt-20 border border-red-50">
      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
      <p className="font-black text-xl uppercase tracking-tighter">Database Connection Error</p>
      <p className="text-sm font-medium mt-2 bg-red-50 p-4 rounded-2xl italic">
        {(fetchError as any)?.response?.data?.details || (fetchError as any)?.response?.data?.message || (fetchError as any).message}
      </p>
      <div className="flex gap-4 justify-center mt-8">
          <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition">Reload Page</button>
          <button onClick={() => queryClient.invalidateQueries({queryKey: ['admin-categories']})} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-blue-700 transition">Retry Query</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic tracking-tighter">Collections</h1>
        <button onClick={() => { setEditingId(null); setFormData({name:'', description:'', image:''}); setIsModalOpen(true); }} className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl uppercase text-xs tracking-widest">
          <Plus className="h-5 w-5" /> New Main Collection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {categories?.map((cat: any) => (
          <motion.div layout key={cat.id} className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-700">
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3 space-y-6">
                    <div className="aspect-[4/3] rounded-[40px] overflow-hidden bg-gray-50 border border-gray-50 relative group">
                        <img src={getImageUrl(cat.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingId(cat.id); setFormData({name: cat.name, description: cat.description || '', image: cat.image || ''}); setIsModalOpen(true); }} className="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg hover:bg-black hover:text-white transition"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(cat.id) }} className="p-3 bg-red-500 text-white rounded-2xl shadow-lg hover:bg-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <div className="space-y-2 px-2">
                        <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">{cat.name}</h3>
                        <p className="text-gray-400 text-sm font-medium">{cat.description}</p>
                        <button onClick={() => { setSelectedParentId(cat.id); setIsSubModalOpen(true); }} className="mt-4 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">+ Add Sub</button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/30 p-8 rounded-[48px] border border-gray-50">
                    {cat.subCategories?.map((sub: any) => (
                        <div key={sub.id} className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xl font-black text-gray-900 flex items-center gap-2"><ListTree className="h-5 w-5 text-blue-500" /> {sub.name}</h4>
                                <button onClick={() => {if(confirm('Delete sub-category?')) deleteSubMutation.mutate(sub.id)}} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Layers className="h-3 w-3" /> Types</span>
                                    <button onClick={() => { setSelectedParentId(sub.id); setIsChildModalOpen(true); }} className="text-[10px] font-bold text-blue-600 hover:underline uppercase">+ New Type</button>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {sub.childCategories?.map((child: any) => (
                                        <div key={child.id} className="bg-gray-50 px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-600 flex items-center gap-2 group/child">
                                            {child.name}
                                            <button onClick={() => {if(confirm('Delete type?')) deleteChildMutation.mutate(child.id)}} className="text-gray-300 hover:text-red-500 opacity-0 group-hover/child:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!cat.subCategories || cat.subCategories.length === 0) && (
                        <div className="col-span-full h-full flex flex-col items-center justify-center text-gray-300 gap-2 italic">
                            <ListTree className="h-8 w-8 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">No Sub-categories</p>
                        </div>
                    )}
                </div>
            </div>
          </motion.div>
        ))}
        {categories?.length === 0 && (
            <div className="p-40 text-center border-4 border-dashed border-gray-100 rounded-[80px] space-y-4">
                <Box className="h-20 w-20 text-gray-100 mx-auto" />
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm">Your store is empty. Start adding collections!</p>
            </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-12 space-y-8 max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
                <div className="space-y-6">
                    <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Category Name" />
                    <textarea className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description..." />
                    <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image</label>
                        {formData.image ? (
                            <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gray-50">
                                <img src={getImageUrl(formData.image)} className="w-full h-full object-cover" />
                                <button onClick={() => setFormData({...formData, image: ''})} className="absolute top-4 right-4 bg-black text-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform"><X className="h-4 w-4" /></button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition group">
                                {isUploading ? <RefreshCw className="h-8 w-8 animate-spin text-blue-500" /> : <><Upload className="h-6 w-6 text-gray-300 group-hover:text-blue-500 transition-colors" /><span className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Cover</span></>}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        )}
                    </div>
                </div>
                <button
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={saveMutation.isPending || !formData.name || !formData.image}
                  className="w-full bg-blue-600 text-white py-6 rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {saveMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Save Category'}
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSubModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSubModalOpen(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[48px] shadow-2xl p-10 space-y-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter">New Sub-Category</h2>
                <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={subFormData.name} onChange={e => setSubFormData({...subFormData, name: e.target.value})} placeholder="e.g. T-Shirts" />
                <button onClick={() => addSubMutation.mutate(subFormData)} className="w-full bg-black text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl">Add Sub</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChildModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChildModalOpen(false)} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-sm rounded-[48px] shadow-2xl p-10 space-y-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter">New Item Type</h2>
                <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={childFormData.name} onChange={e => setChildFormData({...childFormData, name: e.target.value})} placeholder="e.g. Anime" />
                <button onClick={() => addChildMutation.mutate(childFormData)} className="w-full bg-black text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl">Add Type</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
