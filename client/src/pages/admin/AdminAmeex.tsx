import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Package, Search, Truck, Info, RefreshCw, Trash2, Edit, List, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAmeex = () => {
  const queryClient = useQueryClient();
  const [searchCode, setSearchCode] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const { data: parcels, isLoading: listLoading } = useQuery({
    queryKey: ['ameex-parcels'],
    queryFn: async () => (await api.post('/ameex/list', { length: '50' })).data
  });

  const infoMutation = useMutation({
    mutationFn: (code: string) => api.get(`/ameex/info?parcelCode=${code}`),
    onSuccess: (res) => setSelectedParcel(res.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (code: string) => api.delete(`/ameex/delete?parcelCode=${code}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ameex-parcels'] });
      alert('Parcel deleted successfully');
    }
  });

  const relaunchMutation = useMutation({
    mutationFn: (code: string) => api.get(`/ameex/relaunch?parcelCode=${code}`),
    onSuccess: () => alert('Parcel relaunched successfully')
  });

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">AMEEX Shipping</h1>
          <p className="text-gray-400 font-medium">Manage your AMEEX parcels and tracking</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-sm"
              placeholder="Enter Parcel Code..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={() => infoMutation.mutate(searchCode)}
            className="bg-black text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-lg"
          >
            Track
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Parcels List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
               <h2 className="text-xl font-black uppercase italic flex items-center gap-2"><List className="h-5 w-5 text-blue-600" /> Recent Parcels</h2>
               <button onClick={() => queryClient.invalidateQueries({ queryKey: ['ameex-parcels'] })} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><RefreshCw className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code / Order</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receiver</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parcels?.data?.map((parcel: any) => (
                    <tr key={parcel.code} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-black text-gray-900">{parcel.code}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Order: #{parcel.order_num}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-gray-700">{parcel.receiver}</p>
                        <p className="text-[10px] font-medium text-gray-400">{parcel.phone}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          parcel.statut === 'Livre' ? 'bg-green-100 text-green-600' :
                          parcel.statut === 'Annule' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {parcel.statut}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => infoMutation.mutate(parcel.code)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-black hover:text-white transition-all"><Info className="h-4 w-4" /></button>
                          <button onClick={() => relaunchMutation.mutate(parcel.code)} className="p-2 bg-blue-50 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><RefreshCw className="h-4 w-4" /></button>
                          <button onClick={() => {if(confirm('Delete parcel?')) deleteMutation.mutate(parcel.code)}} className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listLoading && <div className="p-20 text-center text-gray-300 font-bold uppercase tracking-widest animate-pulse">Loading Parcels...</div>}
            </div>
          </div>
        </div>

        {/* Selected Parcel Detail */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedParcel ? (
              <motion.div
                key={selectedParcel.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-black text-white p-10 rounded-[48px] shadow-2xl sticky top-24 space-y-8 border border-white/5"
              >
                <div className="flex justify-between items-start">
                  <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <button onClick={() => setSelectedParcel(null)} className="text-gray-500 hover:text-white p-2">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Parcel Details</p>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{selectedParcel.code}</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-2.5 rounded-xl"><Package className="h-4 w-4 text-gray-400" /></div>
                      <div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Receiver</p>
                        <p className="text-sm font-bold">{selectedParcel.receiver}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-2.5 rounded-xl"><MapPin className="h-4 w-4 text-gray-400" /></div>
                      <div>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Address</p>
                        <p className="text-sm font-bold">{selectedParcel.address}, {selectedParcel.city}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Parcel Tracking History</p>
                    <div className="space-y-4">
                        {/* Placeholder for tracking history if available in the API response */}
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              <div className="w-px h-full bg-white/10" />
                           </div>
                           <div>
                              <p className="text-xs font-bold">{selectedParcel.statut}</p>
                              <p className="text-[10px] text-gray-500">{selectedParcel.date}</p>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                   <button className="bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition">Print Label</button>
                   <button onClick={() => relaunchMutation.mutate(selectedParcel.code)} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition">Relaunch</button>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] bg-gray-50 rounded-[48px] border border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <Truck className="h-16 w-16 text-gray-200" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Select a parcel or search to view detailed tracking information</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

export default AdminAmeex;
