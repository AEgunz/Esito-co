import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Upload, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

const AdminTemplates = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', type: 'rectangle', imageUrl: '' });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => (await api.get('/templates')).data
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-templates'] });
      setNewTemplate({ name: '', type: 'rectangle', imageUrl: '' });
      alert('Template saved successfully!');
    },
    onError: (error: any) => {
      console.error(error);
      alert('Failed to save template: ' + (error.response?.data?.message || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-templates'] })
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/upload', data);
      setNewTemplate({ ...newTemplate, imageUrl: res.data.url, name: file.name.split('.')[0] });
    } catch (error) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">Loading Library...</div>;

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Design Templates</h1>
        <p className="text-gray-500 font-medium">Manage transparent PNG masks for your MDF products.</p>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-8">
        {!newTemplate.imageUrl ? (
            <>
                <div className="bg-blue-50 p-6 rounded-[32px] text-blue-600">
                    <Upload className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black">Upload New Template</h3>
                    <p className="text-gray-400 max-w-sm mx-auto font-medium">
                        Size: <span className="text-black font-bold">1000x1000px</span> | Format: <span className="text-black font-bold">PNG</span>
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl disabled:opacity-50"
                >
                    {isUploading ? 'Uploading...' : 'Select Files'}
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/png" onChange={handleFileUpload} />
            </>
        ) : (
            <div className="w-full max-w-md space-y-6">
                <div className="aspect-square bg-gray-50 rounded-[32px] border-2 border-dashed border-blue-200 overflow-hidden relative">
                    <img src={getImageUrl(newTemplate.imageUrl)} className="w-full h-full object-contain" />
                    <button onClick={() => setNewTemplate({...newTemplate, imageUrl: ''})} className="absolute top-4 right-4 bg-black text-white p-2 rounded-full shadow-lg"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input className="col-span-2 px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" placeholder="Template Name" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} />
                    <select className="col-span-2 px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold appearance-none" value={newTemplate.type} onChange={e => setNewTemplate({...newTemplate, type: e.target.value})}>
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="heart">Heart</option>
                    </select>
                </div>
                <button
                    onClick={() => addMutation.mutate(newTemplate)}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-100"
                >
                    <Check className="h-5 w-5" /> Save Template
                </button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {templates?.map((tpl: any) => (
            <motion.div
                layout
                key={tpl.id}
                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative group hover:shadow-xl transition-all"
            >
                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-50">
                    <img src={getImageUrl(tpl.imageUrl)} className="w-full h-full object-contain" />
                </div>
                <div className="mt-4 flex justify-between items-center px-1">
                    <div>
                        <p className="font-black text-gray-900 text-sm truncate max-w-[100px]">{tpl.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tpl.type}</p>
                    </div>
                    <button
                        onClick={() => {if(confirm('Delete?')) deleteMutation.mutate(tpl.id)}}
                        className="text-gray-300 hover:text-red-500 transition"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminTemplates;
