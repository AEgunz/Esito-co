import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Trash2, MapPin, Truck, Hash } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const AdminDelivery = () => {
  const queryClient = useQueryClient();
  const [newFee, setNewFee] = useState({ city: '', fee: '', ameexId: '' });

  const { data: fees, isLoading } = useQuery({
    queryKey: ['admin-delivery'],
    queryFn: async () => (await api.get('/delivery')).data
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => api.post('/delivery', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-delivery'] });
      setNewFee({ city: '', fee: '', ameexId: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/delivery/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-delivery'] })
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Loading Settings...</div>;

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Logistics Mapping</h1>
        <p className="text-gray-500 font-medium">Link cities to AMEEX IDs and set delivery fees.</p>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">City Name</label>
                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" placeholder="Casablanca" value={newFee.city} onChange={e => setNewFee({...newFee, city: e.target.value})} />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">AMEEX ID</label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                    <input className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" placeholder="e.g. 1" value={newFee.ameexId} onChange={e => setNewFee({...newFee, ameexId: e.target.value})} />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Fee (DH)</label>
                <input type="number" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" placeholder="30" value={newFee.fee} onChange={e => setNewFee({...newFee, fee: e.target.value})} />
            </div>
            <button
                onClick={() => upsertMutation.mutate(newFee)}
                disabled={!newFee.city || !newFee.fee}
                className="bg-black text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-xl h-[56px]"
            >
                Add Mapping
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fees?.map((fee: any) => (
          <motion.div layout key={fee.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <Truck className="h-6 w-6" />
                </div>
                <div>
                    <p className="font-black text-gray-900 capitalize">{fee.city}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">AMEEX ID: {fee.ameexId || 'N/A'} • {Number(fee.fee).toFixed(0)} DH</p>
                </div>
            </div>
            <button onClick={() => deleteMutation.mutate(fee.id)} className="p-3 text-gray-300 hover:text-red-500 transition"><Trash2 className="h-5 w-5" /></button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDelivery;
