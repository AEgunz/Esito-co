import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Clock, Sparkles } from 'lucide-react';

const AdminStats = () => {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
        const res = await api.get('/orders/all');
        return Array.isArray(res.data) ? res.data : [];
    }
  });

  const calculateTotalRevenue = () => {
      if (!orders || !Array.isArray(orders)) return '0';
      return orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0).toFixed(0);
  };

  const stats = [
    { label: 'Total Revenue', value: `${calculateTotalRevenue()} DH`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: Array.isArray(orders) ? orders.length : 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Pending Orders', value: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'PENDING').length : 0, icon: Clock, color: 'bg-orange-500' },
    { label: 'Delivered', value: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'DELIVERED').length : 0, icon: Package, color: 'bg-purple-500' },
  ];

  if (isLoading) return <div className="p-20 text-center animate-pulse font-bold text-gray-300 uppercase tracking-widest">Calculating Stats...</div>;

  if (isError) return (
      <div className="p-20 text-center space-y-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase italic">Dashboard Sync Error</h2>
            <p className="text-gray-500 max-w-md mx-auto">Database tables are missing. Please run <b>npx prisma db push</b> in Railway Terminal to fix this.</p>
          </div>
      </div>
  );

  return (
    <div className="space-y-12 text-start">
      <div className="space-y-2 text-start">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">Dashboard Overview</h1>
        <p className="text-gray-500 font-medium">Business performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-start">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-start"
          >
            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-100`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 text-start">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm h-64 flex flex-col justify-center items-center text-center space-y-4">
             <TrendingUp className="h-12 w-12 text-blue-100" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Growth Chart (Coming Soon)</p>
        </div>
        <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group text-start">
            <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-black italic uppercase">Technical Support</h3>
                <p className="text-gray-400 font-medium max-w-xs">Contact the developer for site updates or custom feature requests.</p>
                <a href="https://wa.me/212693360625" target="_blank" rel="noreferrer" className="inline-block bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Contact Developer</a>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
