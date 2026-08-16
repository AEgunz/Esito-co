import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Plus, Trash2, Tag, Percent, Calendar, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '',
    minOrderAmount: '', expiryDate: '', usageLimit: ''
  });

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => (await api.get('/coupons')).data
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setFormData({
        code: '', discountType: 'PERCENTAGE', discountValue: '',
        minOrderAmount: '', expiryDate: '', usageLimit: ''
      });
      alert('Coupon created successfully!');
    },
    onError: (err: any) => alert(err.response?.data?.message || 'Error creating coupon')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Coupons...</div>;

  return (
    <div className="space-y-12 text-start">
      <div className="space-y-2 text-start">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic flex items-center gap-3"><Tag className="h-8 w-8 text-blue-600" /> Promo Codes</h1>
          <p className="text-gray-500 font-medium">Create and manage discounts for your customers.</p>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-10 text-start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-start">
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coupon Code</label>
            <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold uppercase" placeholder="SUMMER20" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Type</label>
            <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (DH)</option>
            </select>
          </div>
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Discount Value</label>
            <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" type="number" placeholder="20" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} />
          </div>
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Min Order (DH)</label>
            <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" type="number" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: e.target.value})} />
          </div>
          <div className="space-y-2 text-start">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
            <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 transition font-bold" type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
          </div>
          <button onClick={() => createMutation.mutate(formData)} className="bg-black text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition shadow-lg">Create Coupon</button>
        </div>

        <div className="overflow-x-auto text-start">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Used</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-black text-gray-900">{c.code}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-[10px] uppercase">
                        {c.discountType === 'PERCENTAGE' ? `${Number(c.discountValue)}% OFF` : `${Number(c.discountValue)} DH OFF`}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                        <p className="font-bold text-gray-900">{c.usedCount}</p>
                        {c.usageLimit && <p className="text-[8px] text-gray-400">Limit: {c.usageLimit}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-gray-500">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => {if(confirm('Delete coupon?')) deleteMutation.mutate(c.id)}} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons?.length === 0 && <div className="p-20 text-center text-gray-300 font-bold uppercase italic text-xs">No coupons created yet</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
