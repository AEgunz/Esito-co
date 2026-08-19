import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { TrendingUp, TrendingDown, Wallet, Plus, Trash2, Calendar, RefreshCw, AlertCircle, ShoppingBag, Send } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const AdminFinances = () => {
  const queryClient = useQueryClient();
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'Supplies', date: new Date().toISOString().split('T')[0] });
  const [incomeForm, setIncomeForm] = useState({ description: '', amount: '', category: 'Offline Sale', date: new Date().toISOString().split('T')[0] });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => (await api.get('/finance/summary')).data
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data: any) => api.post('/finance/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      setExpenseForm({ description: '', amount: '', category: 'Supplies', date: new Date().toISOString().split('T')[0] });
    }
  });

  const addIncomeMutation = useMutation({
    mutationFn: (data: any) => api.post('/finance/income', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      setIncomeForm({ description: '', amount: '', category: 'Offline Sale', date: new Date().toISOString().split('T')[0] });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/expenses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance-summary'] })
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/finance/income/${id}`),
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
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Income (Products)</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-gray-900">{Number(summary?.totalIncome || 0).toFixed(0)} DH</p>
                    <span className="text-[9px] font-bold text-gray-400">({summary?.ordersIncome} Web + {summary?.totalManualIncome} Manual)</span>
                </div>
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

      {/* Forms Section */}
      <div className="grid lg:grid-cols-2 gap-10">
          {/* Log Income Form */}
          <div className="bg-emerald-50/20 p-10 rounded-[48px] border border-emerald-100 space-y-8">
              <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 text-emerald-700"><Plus className="h-5 w-5" /> Log Manual Income</h2>
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest ml-1">Source / Description</label>
                      <input className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="e.g. In-store sale, Partner commission..." value={incomeForm.description} onChange={e => setIncomeForm({...incomeForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest ml-1">Amount (DH)</label>
                          <input type="number" className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold" placeholder="0.00" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest ml-1">Category</label>
                          <select className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold appearance-none" value={incomeForm.category} onChange={e => setIncomeForm({...incomeForm, category: e.target.value})}>
                              <option value="Offline Sale">Offline Sale</option>
                              <option value="Service">Special Service</option>
                              <option value="Investment">Investment</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest ml-1">Date</label>
                      <input type="date" className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-emerald-500 font-bold" value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} />
                  </div>
              </div>
              <button
                onClick={() => addIncomeMutation.mutate(incomeForm)}
                disabled={!incomeForm.description || !incomeForm.amount || addIncomeMutation.isPending}
                className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl disabled:opacity-50"
              >
                {addIncomeMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'Record Income'}
              </button>
          </div>

          {/* Log Expense Form */}
          <div className="bg-red-50/20 p-10 rounded-[48px] border border-red-100 space-y-8">
              <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 text-red-700"><Plus className="h-5 w-5" /> Log Expense</h2>
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-red-600/50 uppercase tracking-widest ml-1">Description</label>
                      <input className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-red-500 font-bold" placeholder="e.g. FB Ads, 10 Blank T-shirts..." value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-red-600/50 uppercase tracking-widest ml-1">Amount (DH)</label>
                          <input type="number" className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-red-500 font-bold" placeholder="0.00" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-red-600/50 uppercase tracking-widest ml-1">Category</label>
                          <select className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-red-500 font-bold appearance-none" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                              <option value="Supplies">Supplies / Stock</option>
                              <option value="Marketing">Marketing / Ads</option>
                              <option value="Shipping">Shipping Costs</option>
                              <option value="Operation">Rent / Electricity</option>
                              <option value="Other">Other</option>
                          </select>
                      </div>
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-black text-red-600/50 uppercase tracking-widest ml-1">Date</label>
                      <input type="date" className="w-full px-6 py-4 rounded-2xl bg-white border-none outline-none focus:ring-2 focus:ring-red-500 font-bold" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} />
                  </div>
              </div>
              <button
                onClick={() => addExpenseMutation.mutate(expenseForm)}
                disabled={!expenseForm.description || !expenseForm.amount || addExpenseMutation.isPending}
                className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-red-700 transition shadow-xl disabled:opacity-50"
              >
                {addExpenseMutation.isPending ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'Record Expense'}
              </button>
          </div>
      </div>

      {/* History Tables */}
      <div className="grid lg:grid-cols-2 gap-10">
          {/* Income History */}
          <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-emerald-50/20">
                  <h2 className="text-xl font-black uppercase italic text-emerald-700">Income History</h2>
                  <div className="bg-white px-4 py-1 rounded-full border border-emerald-100 font-bold text-[10px] text-emerald-600 uppercase">{(summary?.manualIncomes?.length || 0) + (summary?.ordersIncome > 0 ? 1 : 0)} Groups</div>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-gray-50/50">
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description / Source</th>
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                              <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                              <th className="px-8 py-4 w-10"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                          {/* Orders Income (Auto-calculated) */}
                          <tr className="bg-blue-50/10">
                              <td className="px-8 py-6">
                                  <p className="font-black text-gray-900 flex items-center gap-2"><ShoppingBag className="h-3.5 w-3.5 text-blue-500" /> Website Orders (Net)</p>
                                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Excl. Shipping Fees</p>
                              </td>
                              <td className="px-8 py-6"><p className="text-xs font-bold text-gray-400">All Time</p></td>
                              <td className="px-8 py-6 text-right"><p className="font-black text-emerald-500">+{Number(summary?.ordersIncome).toFixed(0)} DH</p></td>
                              <td className="px-8 py-6"></td>
                          </tr>
                          {/* Manual Incomes */}
                          {summary?.manualIncomes?.map((inq: any) => (
                              <tr key={inq.id} className="hover:bg-gray-50/50 transition-colors group">
                                  <td className="px-8 py-6">
                                      <p className="font-black text-gray-900">{inq.description}</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{inq.category}</p>
                                  </td>
                                  <td className="px-8 py-6">
                                      <p className="text-xs font-bold text-gray-500 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(inq.date).toLocaleDateString()}</p>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                      <p className="font-black text-emerald-500">+{Number(inq.amount).toFixed(0)} DH</p>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                      <button onClick={() => {if(confirm('Delete record?')) deleteIncomeMutation.mutate(inq.id)}} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {summary?.manualIncomes?.length === 0 && summary?.ordersIncome === 0 && <div className="p-20 text-center text-gray-300 font-black italic uppercase">No income recorded</div>}
              </div>
          </div>

          {/* Expenses History */}
          <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-red-50/20">
                  <h2 className="text-xl font-black uppercase italic text-red-700">Expense History</h2>
                  <div className="bg-white px-4 py-1 rounded-full border border-red-100 font-bold text-[10px] text-red-600 uppercase">{summary?.expenses?.length || 0} Records</div>
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
                                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{ex.category}</p>
                                  </td>
                                  <td className="px-8 py-6">
                                      <p className="text-xs font-bold text-gray-500 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {new Date(ex.date).toLocaleDateString()}</p>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                      <p className="font-black text-red-500">-{Number(ex.amount).toFixed(0)} DH</p>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                      <button onClick={() => {if(confirm('Delete record?')) deleteExpenseMutation.mutate(ex.id)}} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
  );
};

export default AdminFinances;
