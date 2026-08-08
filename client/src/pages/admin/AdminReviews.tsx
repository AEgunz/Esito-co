import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { MessageSquare, Trash2, Star, User, Package, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminReviews = () => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-all-reviews'],
    queryFn: async () => (await api.get('/reviews/all')).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-reviews'] });
      alert('Review deleted successfully');
    }
  });

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Reviews...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic">Reviews Management</h1>
        <p className="text-gray-400 font-medium">Moderate customer feedback across all products</p>
      </div>

      <div className="grid gap-6">
        {reviews?.map((review: any) => (
          <motion.div
            layout
            key={review.id}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{review.userName}</h3>
                    <div className="flex gap-1 text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                    <p className="text-gray-600 leading-relaxed font-medium">"{review.comment}"</p>
                </div>

                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                        <Package className="h-3.5 w-3.5" /> {review.product?.name}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                        <Calendar className="h-3.5 w-3.5" /> {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                </div>
              </div>

              <div className="flex items-start">
                <button
                  onClick={() => { if(confirm('Are you sure you want to delete this review?')) deleteMutation.mutate(review.id) }}
                  className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                  title="Delete Review"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {(!reviews || reviews.length === 0) && (
            <div className="p-40 text-center border-4 border-dashed border-gray-100 rounded-[80px] space-y-4">
                <MessageSquare className="h-20 w-20 text-gray-100 mx-auto" />
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm">No reviews found yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
