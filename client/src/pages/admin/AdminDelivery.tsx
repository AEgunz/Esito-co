import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Trash2, MapPin, Truck, Hash, RefreshCw, FileDown } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const AdminDelivery = () => {
  const queryClient = useQueryClient();
  const [newFee, setNewFee] = useState({ city: '', fee: '', ameexId: '' });
  const [isImporting, setIsImporting] = useState(false);

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

  const importAllCities = async () => {
      if(!confirm('This will import all 300+ cities and their fees. Continue?')) return;
      setIsImporting(true);
      try {
          await api.post('/delivery/seed');
          queryClient.invalidateQueries({ queryKey: ['admin-delivery'] });
          alert('Success! All cities imported.');
      } catch (err) {
          alert('Import failed. Check console.');
      } finally {
          setIsImporting(false);
      }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Map...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Logistics Mapping</h1>
            <p className="text-gray-500 font-medium">Link cities to AMEEX IDs and set delivery fees.</p>
        </div>
        <button
            onClick={importAllCities}
            disabled={isImporting}
            className="bg-blue-600 text-white px-8 py-4 rounded-[22px] flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl disabled:opacity-50"
        >
            {isImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><FileDown className="h-4 w-4" /> Import All Cities</>}
        </button>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City Name</label>
            <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input className="w-full pl-11 pr-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" placeholder="Casablanca" value={newFee.city} onChange={e => setNewFee({...newFee, city: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AMEEX ID</label>
            <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input className="w-full pl-11 pr-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" placeholder="e.g. 1" value={newFee.ameexId} onChange={e => setNewFee({...newFee, ameexId: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fee (DH)</label>
            <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" type="number" value={newFee.fee} onChange={e => setNewFee({...newFee, fee: e.target.value})} />
          </div>
          <button onClick={() => upsertMutation.mutate(newFee)} className="bg-black text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition shadow-lg">Add Mapping</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">City</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">AMEEX ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Fee</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fees?.map((fee: any) => (
                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-black text-gray-900 capitalize">{fee.city}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-[10px]">#{fee.ameexId || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <p className="font-bold text-gray-600">{Number(fee.fee).toFixed(0)} DH</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => deleteMutation.mutate(fee.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDelivery;
