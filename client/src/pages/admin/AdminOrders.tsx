import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import { Eye, Trash2, Calendar, Smartphone, User, Image as ImageIcon, Download, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => (await api.get('/orders/all')).data
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/orders/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PRINTING': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const exportToAmeex = () => {
    if (!orders || orders.length === 0) return;

    const headers = ["NUMERO DE COMMANDE", "DESTINATAIRE", "TELEPHONE", "ADRESSE", "PRIX", "VILLE", "COMMENTAIRE", "MARCHANDISE"];
    const rows = orders.map((o: any) => [
      o.id.slice(0, 8),
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
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AMEEX_IMPORT_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse font-bold text-gray-400">Loading Orders...</div>;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight">Recent Orders</h1>
            <p className="text-gray-500 font-medium">Manage and track your customer requests.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border shadow-sm flex gap-8 items-center">
            <button
                onClick={exportToAmeex}
                className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition flex items-center gap-2"
            >
                <Download className="h-4 w-4" /> Export for AMEEX
            </button>
            <div className="w-px h-8 bg-gray-100"></div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
                <p className="text-2xl font-black">{orders?.length || 0}</p>
            </div>
            <div className="w-px h-full bg-gray-100"></div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
                <p className="text-2xl font-black text-blue-600">
                    {orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0).toFixed(0)} DH
                </p>
            </div>
        </div>
      </div>

      <div className="grid gap-6">
        {orders?.map((order: any) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={order.id}
            className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-8">
              {/* Order ID & Date */}
              <div className="w-40 space-y-1">
                <p className="text-xs font-black text-gray-300 uppercase tracking-tighter">#{order.id.slice(0, 8)}</p>
                {order.trackingNumber && <p className="text-[10px] text-blue-500 font-black">TRK: {order.trackingNumber}</p>}
                <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Customer */}
              <div className="flex-1 min-w-[200px] space-y-1">
                <div className="flex items-center gap-2 font-black text-gray-900">
                    <User className="h-4 w-4 text-gray-400" /> {order.firstName}
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                    <Smartphone className="h-4 w-4 text-green-500" /> {order.phone}
                </div>
              </div>

              {/* Products/Photos Preview */}
              <div className="flex -space-x-3 overflow-hidden relative">
                {order.items.map((item: any) => (
                  <div key={item.id} className="w-14 h-14 rounded-2xl border-4 border-white overflow-hidden shadow-sm bg-gray-50 relative group">
                    <img src={getImageUrl(item.customerPhoto || item.product?.image)} className="w-full h-full object-cover" />
                    {item.isSpecialDesign && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-blue-600 drop-shadow-md" />
                        </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Amount */}
              <div className="w-32 text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total</p>
                <p className="text-xl font-black text-blue-600">{Number(order.totalAmount).toFixed(0)} DH</p>
              </div>

              {/* Status Selector */}
              <div className="w-44">
                <select
                    value={order.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                    className={`w-full px-4 py-2 rounded-xl font-bold text-sm border outline-none cursor-pointer transition-colors ${getStatusStyle(order.status)}`}
                >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PRINTING">PRINTING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                    to={`/admin/orders/${order.id}`}
                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:bg-black hover:text-white transition shadow-sm"
                >
                    <Eye className="h-5 w-5" />
                </Link>
                <button
                    onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(order.id) }}
                    className="p-3 bg-red-50 rounded-2xl text-red-400 hover:bg-red-600 hover:text-white transition shadow-sm"
                >
                    <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {orders?.length === 0 && <div className="p-20 text-center text-gray-400 font-bold border-2 border-dashed rounded-[40px]">No orders yet.</div>}
      </div>
    </div>
  );
};

export default AdminOrders;
