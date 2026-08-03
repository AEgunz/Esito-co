import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { User, Mail, Calendar, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminCustomers = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/auth/users')).data // Need to add this endpoint
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Customers...</div>;

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Customer Base</h1>
        <p className="text-gray-500 font-medium">View and manage registered users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users?.map((user: any, i: number) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={user.id}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all space-y-6"
          >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600">
                    <User className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="font-black text-gray-900 text-lg">{user.name}</h3>
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{user.role}</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                    <Mail className="h-4 w-4" /> {user.email}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-tighter">
                    <Hash className="h-3 w-3" /> {user.id}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminCustomers;
