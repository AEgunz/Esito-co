import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { User, Mail, Calendar, Hash, Trash2, ShieldCheck, Shield, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/auth/users')).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('User deleted successfully');
    },
    onError: (error: any) => {
        alert(error.response?.data?.message || 'Error deleting user');
    }
  });

  const toggleRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) =>
        api.patch(`/auth/users/${id}`, { role: role === 'ADMIN' ? 'USER' : 'ADMIN' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Customers...</div>;

  return (
    <div className="space-y-12 text-start">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">Customer Base</h1>
            <p className="text-gray-500 font-medium">View and manage registered users and permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users?.map((user: any, i: number) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={user.id}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all space-y-6 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.role === 'ADMIN' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 text-lg">{user.name}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'text-blue-600' : 'text-gray-400'}`}>{user.role}</p>
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user.id !== currentUser.id && (
                        <>
                            <button
                                onClick={() => toggleRoleMutation.mutate({ id: user.id, role: user.role })}
                                className={`p-3 rounded-2xl transition-all ${user.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                title={user.role === 'ADMIN' ? "Downgrade to User" : "Make Admin"}
                            >
                                {toggleRoleMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : (user.role === 'ADMIN' ? <Shield className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />)}
                            </button>
                            <button
                                onClick={() => { if(confirm('Delete this user?')) deleteMutation.mutate(user.id) }}
                                className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                title="Delete User"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                    <Mail className="h-4 w-4" /> {user.email}
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                    <Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-tighter pt-2 border-t border-gray-50">
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
