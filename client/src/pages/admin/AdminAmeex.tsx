import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Package, Search, Truck, Info, RefreshCw, Trash2, List, MapPin, CheckSquare, Square, FileText, Printer, X, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAmeex = () => {
  const queryClient = useQueryClient();
  const [searchCode, setSearchCode] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [selectedForNote, setSelectedForNote] = useState<string[]>([]);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  // Pickup Form State
  const [pickupData, setPickupData] = useState({ cityId: '', address: '', phone: '', note: '' });
  const [citySearch, setCitySearch] = useState('');
  const [isCityListOpen, setIsCityListOpen] = useState(false);

  const { data: deliveryCities } = useQuery({
    queryKey: ['admin-delivery'],
    queryFn: async () => {
        const res = await api.get('/delivery');
        return Array.isArray(res.data) ? res.data : [];
    }
  });

  const { data: parcels, isLoading: listLoading } = useQuery({
    queryKey: ['ameex-parcels'],
    queryFn: async () => (await api.post('/ameex/list', { length: '50' })).data
  });

  const filteredCities = useMemo(() => {
    if (!citySearch) return [];
    return deliveryCities?.filter((c: any) =>
        c.city.toLowerCase().includes(citySearch.toLowerCase())
    ).slice(0, 5);
  }, [citySearch, deliveryCities]);

  const selectedCityName = useMemo(() => {
    return deliveryCities?.find((c: any) => c.id === pickupData.cityId)?.city || '';
  }, [pickupData.cityId, deliveryCities]);

  const infoMutation = useMutation({
    mutationFn: (code: string) => api.get(`/ameex/info?parcelCode=${code}`),
    onSuccess: (res) => setSelectedParcel(res.data)
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
        const addRes = await api.post('/ameex/notes/add');
        const ref = addRes.data.ref || addRes.data.message?.match(/Ref : ([\w\d]+)/)?.[1];
        if (!ref) throw new Error('Could not get Note Reference');
        await api.post(`/ameex/notes/add-parcels?ref=${ref}`, { parcels: selectedForNote });
        return ref;
    },
    onSuccess: (ref) => {
        setSelectedForNote([]);
        alert(`Delivery Note Created: ${ref}`);
        window.open(`https://api.ameex.app/customer/Delivery/DeliveryNotes/Print/Type/Labels?Ref=${ref}&LabelType=Label_100_100`, '_blank');
    },
    onError: (err: any) => alert(err.message || 'Failed to create note')
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

  const pickupMutation = useMutation({
    mutationFn: () => {
        const cityObj = deliveryCities?.find((c: any) => c.id === pickupData.cityId);
        return api.post('/ameex/pickup/add', {
            city: cityObj?.ameexId || '1',
            address: pickupData.address,
            phone: pickupData.phone,
            note: pickupData.note
        });
    },
    onSuccess: (res) => {
        if (res.data.status === false) {
            alert('AMEEX Error: ' + res.data.message);
        } else {
            setIsPickupModalOpen(false);
            alert('Pickup Request Sent Successfully!');
        }
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.message || err.message}`)
  });

  const toggleSelect = (code: string) => {
    setSelectedForNote(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  return (
    <div className="space-y-10 pb-20 text-start">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-start">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">AMEEX Shipping</h1>
          <p className="text-gray-400 font-medium">Manage parcels and create Delivery Notes</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => setIsPickupModalOpen(true)}
            className="bg-white text-black border-2 border-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition shadow-md flex items-center gap-2"
          >
            <Truck className="h-5 w-5" /> Request Pickup
          </button>
          {selectedForNote.length > 0 && (
              <button
                onClick={() => createNoteMutation.mutate()}
                disabled={createNoteMutation.isPending}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition shadow-xl flex items-center gap-2"
              >
                {createNoteMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><FileText className="h-4 w-4" /> Create Note ({selectedForNote.length})</>}
              </button>
          )}
          <div className="relative flex-1 md:w-80">
            <input
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-blue-600 font-bold transition-all shadow-sm"
              placeholder="Search Parcel Code..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
               <h2 className="text-xl font-black uppercase italic flex items-center gap-2"><List className="h-5 w-5 text-blue-600" /> All Parcels</h2>
               <button onClick={() => queryClient.invalidateQueries({ queryKey: ['ameex-parcels'] })} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><RefreshCw className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 w-10"></th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code / Order</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receiver</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parcels?.data?.map((parcel: any) => (
                    <tr key={parcel.code} className={`hover:bg-gray-50/50 transition-colors group ${selectedForNote.includes(parcel.code) ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        <button onClick={() => toggleSelect(parcel.code)} className="text-gray-300 hover:text-blue-600 transition-colors">
                            {selectedForNote.includes(parcel.code) ? <CheckSquare className="h-5 w-5 text-blue-600" /> : <Square className="h-5 w-5" />}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-gray-900">{parcel.code}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Order: #{parcel.order_num}</p>
                      </td>
                      <td className="px-8 py-6 text-start">
                        <p className="font-bold text-gray-700">{parcel.receiver}</p>
                        <p className="text-[10px] font-medium text-gray-400">{parcel.phone}</p>
                      </td>
                      <td className="px-8 py-6 text-start">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          parcel.statut === 'Livre' ? 'bg-green-100 text-green-600' :
                          parcel.statut === 'Annule' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {parcel.statut}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
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

        <div className="lg:col-span-1 text-start">
            {selectedParcel ? (
              <div className="bg-black text-white p-10 rounded-[48px] shadow-2xl sticky top-24 space-y-8 border border-white/5 text-start">
                <div className="flex justify-between items-start">
                  <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <button onClick={() => setSelectedParcel(null)} className="text-gray-500 hover:text-white p-2">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-2 text-start">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Parcel Details</p>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{selectedParcel.code}</h3>
                </div>
                <div className="space-y-6 text-start">
                  <div className="grid gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 text-start">
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
                    <div className="flex items-center gap-4 text-start">
                      <div className="bg-white/10 p-2.5 rounded-xl"><RefreshCw className="h-4 w-4 text-gray-400" /></div>
                      <div className="text-start">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Status</p>
                        <p className="text-sm font-bold text-blue-400">{selectedParcel.statut}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                   <button
                     onClick={() => window.open(`https://api.ameex.app/customer/Delivery/DeliveryNotes/Print/Type/Labels?Ref=${selectedParcel.code}&LabelType=Label_100_100`, '_blank')}
                     className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition flex items-center justify-center gap-2"
                   >
                     <Printer className="h-4 w-4" /> Print Label
                   </button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] bg-gray-50 rounded-[48px] border border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <Truck className="h-16 w-16 text-gray-200" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Select a parcel to view details or select multiple to create a Delivery Note</p>
              </div>
            )}
        </div>
      </div>

      <AnimatePresence>
        {isPickupModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPickupModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10 space-y-8 text-start">
                <div className="flex justify-between items-center text-start">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Pickup Request</h2>
                    <button onClick={() => setIsPickupModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="h-6 w-6 text-gray-400" /></button>
                </div>
                <div className="space-y-4 text-start">
                    <div className="space-y-2 relative text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pickup City</label>
                        <div className="relative">
                            <input
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                                placeholder={selectedCityName || "Search City..."}
                                value={citySearch}
                                onChange={(e) => { setCitySearch(e.target.value); setIsCityListOpen(true); }}
                                onFocus={() => setIsCityListOpen(true)}
                            />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                        <AnimatePresence>
                            {isCityListOpen && citySearch.length >= 1 && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-[120] left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-2xl py-2">
                                    {filteredCities?.map((c: any) => (
                                        <button key={c.id} onClick={() => { setPickupData({...pickupData, cityId: c.id}); setCitySearch(c.city); setIsCityListOpen(false); }} className="w-full text-left px-6 py-3 hover:bg-blue-50 font-bold text-sm transition-colors flex justify-between items-center">
                                            <span>{c.city}</span>
                                            <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">ID: {c.ameexId || '1'}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pickup Address</label>
                        <textarea className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" rows={2} placeholder="Warehouse address..." value={pickupData.address} onChange={e => setPickupData({...pickupData, address: e.target.value})} />
                    </div>
                    <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="06XXXXXXXX" value={pickupData.phone} onChange={e => setPickupData({...pickupData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Note (Optional)</label>
                        <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Any instructions..." value={pickupData.note} onChange={e => setPickupData({...pickupData, note: e.target.value})} />
                    </div>
                </div>
                <button
                  onClick={() => pickupMutation.mutate()}
                  disabled={pickupMutation.isPending || !pickupData.cityId || !pickupData.address || !pickupData.phone}
                  className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {pickupMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'Confirm Pickup Request'}
                </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAmeex;
