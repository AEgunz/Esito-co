import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import {
  Package, Search, Clock, CheckCircle, Truck,
  ChevronRight, AlertCircle, ShoppingBag, Calendar,
  Download, Trash2, Eye
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
        const res = await api.get('/orders/all');
        return Array.isArray(res.data) ? res.data : [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      alert('Order deleted successfully');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  });

  const exportToCSV = () => {
    if (!orders) return;
    const headers = ["Order ID", "Date", "Customer", "Phone", "Address", "Total (DH)", "City", "Note", "Items"];
    const rows = orders.map((o: any) => [
      o.id.substring(0, 8),
      new Date(o.createdAt).toLocaleDateString(),
      o.firstName,
      o.phone,
      o.address,
      Number(o.totalAmount).toFixed(0),
      o.city,
      o.items.map((i: any) => i.customText).filter(Boolean).join(' | ') || 'None',
      o.items.map((i: any) => i.product?.name).join(', ')
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map((e: any) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AMEEX_IMPORT_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredOrders = orders?.filter((o: any) => {
    const matchesFilter = filter === 'ALL' || o.status === filter;
    const matchesSearch = o.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.phone?.includes(searchTerm) ||
                          o.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'SHIPPED': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Orders...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">Orders Management</h1>
          <p className="text-gray-400 font-medium">Manage and track your customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-4 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-black transition shadow-sm"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl uppercase text-xs tracking-widest w-fit"
          >
            <Download className="h-4 w-4" /> Export for AMEEX
          </button>
        </div>
      </div>

      {isError && (
          <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4">
              <AlertCircle className="h-6 w-6" />
              <p className="font-bold">Error loading orders. Please check your connection or login again.</p>
          </div>
      )}

      <div className="flex flex-wrap gap-3 bg-white p-2 rounded-[28px] border border-gray-100 shadow-sm w-fit">
        {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === s ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
        <input
          className="w-full pl-14 pr-8 py-5 rounded-[32px] bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
          placeholder="Search by name, phone or order ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6">
        {filteredOrders?.map((order: any) => (
          <motion.div
            layout
            key={order.id}
            className="group bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
          >
            <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                  <ShoppingBag className="h-6 w-6 text-gray-300 group-hover:text-blue-500" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">#{order.id.substring(0, 8)}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{order.firstName} {order.lastName}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> {order.city}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <p className="text-2xl font-black text-gray-900">{Number(order.totalAmount).toFixed(0)} DH</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.items.length} Items</p>
              </div>

              <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                <button
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="p-4 bg-gray-50 text-gray-900 rounded-2xl hover:bg-black hover:text-white transition shadow-sm"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { if(confirm('Delete order?')) deleteMutation.mutate(order.id) }}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition shadow-sm"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="relative group/select">
                   <select
                     className="appearance-none bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest pr-10 cursor-pointer hover:bg-blue-700 transition"
                     value={order.status}
                     onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                   >
                     <option value="PENDING">PENDING</option>
                     <option value="CONFIRMED">CONFIRMED</option>
                     <option value="SHIPPED">SHIPPED</option>
                     <option value="DELIVERED">DELIVERED</option>
                     <option value="CANCELLED">CANCELLED</option>
                   </select>
                   <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 text-white pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders?.length === 0 && (
          <div className="p-20 text-center border-4 border-dashed border-gray-100 rounded-[60px] space-y-4">
             <AlertCircle className="h-16 w-16 text-gray-100 mx-auto" />
             <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No orders found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
