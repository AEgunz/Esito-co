import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar, Tag, RefreshCw, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const AdminFinances = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Supplies', date: new Date().toISOString().split('T')[0] });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => (await api.get('/finance/summary')).data
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/finance/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      setFormData({ description: '', amount: '', category: 'Supplies', date: new Date().toISOString().split('T')[0] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/expenses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance-summary'] })
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Calculating Balance...</div>;

  return (
    <div className="space-y-12 text-start">
      <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" /> Financial Hub
          </h1>
          <p className="text-gray-500 font-medium">Track your income, expenses, and real-time net profit.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100/50"><TrendingUp className="h-6 w-6" /></div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Income</p>
                <p className="text-3xl font-black text-gray-900">{Number(summary?.totalIncome || 0).toFixed(0)} DH</p>
            </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-100/50"><TrendingDown className="h-6 w-6" /></div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Expenses</p>
                <p className="text-3xl font-black text-gray-900">{Number(summary?.totalExpenses || 0).toFixed(0)} DH</p>
            </div>
        </div>
        <div className="bg-black p-8 rounded-[40px] shadow-2xl space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center relative z-10"><Wallet className="h-6 w-6" /></div>
            <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Net Profit</p>
                <p className={`text-3xl font-black ${summary?.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>{Number(summary?.netProfit || 0).toFixed(0)} DH</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
          {/* Add Expense Form */}
          <div className="lg:col-span-1">
              <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 sticky top-24">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2"><Plus className="h-5 w-5 text-blue-600" /> Log Expense</h2>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                          <input className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="e.g. FB Ads, 10 Blank T-shirts..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount (DH)</label>
                          <input type="number" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                          <select className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                              <option value="Supplies">Supplies / Stock</option>
                              <option value="Marketing">Marketing / Ads</option>
                              <option value="Shipping">Shipping Costs</option>
                              <option value="Operation">Rent / Electricity</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                          <input type="date" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                      </div>
                  </div>
                  <button
                    onClick={() => addMutation.mutate(formData)}
                    disabled={!formData.description || !formData.amount || addMutation.isPending}
                    className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-xl disabled:opacity-50"
                  >
                    {addMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'Record Expense'}
                  </button>
              </div>
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                      <h2 className="text-xl font-black uppercase italic">Expense History</h2>
                      <div className="bg-white px-4 py-1 rounded-full border border-gray-100 font-bold text-[10px] text-gray-400 uppercase">{summary?.expenses?.length || 0} Records</div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-gray-50/50">
                                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description / Category</th>
                                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                  <th className="px-8 py-4 w-10"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                              {summary?.expenses?.map((ex: any) => (
                                  <tr key={ex.id} className="hover:bg-gray-50/50 transition-colors group">
                                      <td className="px-8 py-6">
                                          <p className="font-black text-gray-900">{ex.description}</p>
                                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{ex.category}</p>
                                      </td>
                                      <td className="px-8 py-6">
                                          <p className="text-xs font-bold text-gray-500 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(ex.date).toLocaleDateString()}</p>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                          <p className="font-black text-red-500">-{Number(ex.amount).toFixed(0)} DH</p>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                          <button onClick={() => {if(confirm('Delete record?')) deleteMutation.mutate(ex.id)}} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      {summary?.expenses?.length === 0 && <div className="p-20 text-center text-gray-300 font-black italic uppercase">No expenses recorded</div>}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminFinances;
