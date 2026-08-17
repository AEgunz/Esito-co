import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import { Mail, Phone, Calendar, Trash2, CheckCircle2, MessageSquare, Building2, Download, ExternalLink, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => (await api.get('/inquiries')).data
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/inquiries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] });
      setSelectedInquiry(null);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.patch(`/inquiries/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] })
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Inbox...</div>;

  return (
    <div className="space-y-10 pb-20 text-start">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 uppercase italic flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-600" /> Inbox
            </h1>
            <p className="text-gray-500 font-medium">Manage corporate inquiries and special design requests.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-4">
            {inquiries?.map((inq: any) => (
                <motion.div
                    layout
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className={`p-6 rounded-[32px] border cursor-pointer transition-all ${selectedInquiry?.id === inq.id ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' : 'bg-white text-gray-900 border-gray-100 shadow-sm hover:border-blue-200'}`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedInquiry?.id === inq.id ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-lg">{inq.name}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedInquiry?.id === inq.id ? 'text-gray-400' : 'text-gray-400'}`}>{inq.subject}</p>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <p className={`text-[9px] font-bold ${selectedInquiry?.id === inq.id ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(inq.createdAt).toLocaleDateString()}</p>
                            {inq.status === 'NEW' && <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
                        </div>
                    </div>
                </motion.div>
            ))}
            {inquiries?.length === 0 && <div className="p-20 text-center text-gray-300 font-black italic uppercase">No messages yet</div>}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
                {selectedInquiry ? (
                    <motion.div
                        key={selectedInquiry.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-2xl sticky top-24 space-y-8"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Inquiry Details</p>
                                <h2 className="text-2xl font-black text-gray-900">{selectedInquiry.name}</h2>
                            </div>
                            <button onClick={() => setSelectedInquiry(null)} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><X className="h-6 w-6 text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <a href={`mailto:${selectedInquiry.email}`} className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors">
                                <Mail className="h-4 w-4" /> <span className="font-bold text-sm">{selectedInquiry.email}</span>
                            </a>
                            <a href={`https://wa.me/212${selectedInquiry.phone.replace(/^0/, '')}`} target="_blank" className="flex items-center gap-3 text-green-600 hover:underline">
                                <Phone className="h-4 w-4" /> <span className="font-bold text-sm">{selectedInquiry.phone}</span>
                            </a>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message / Requirements</p>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{selectedInquiry.message}"</p>
                        </div>

                        {selectedInquiry.logoUrl && (
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Attached Logo</p>
                                <div className="relative aspect-square rounded-[32px] overflow-hidden border-4 border-gray-50 shadow-lg bg-gray-100 group">
                                    <img src={getImageUrl(selectedInquiry.logoUrl)} className="w-full h-full object-contain p-4" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a href={getImageUrl(selectedInquiry.logoUrl)} target="_blank" className="bg-white p-3 rounded-full text-black shadow-xl"><ExternalLink className="h-5 w-5" /></a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-50 flex gap-3">
                            <button onClick={() => {if(confirm('Delete message?')) deleteMutation.mutate(selectedInquiry.id)}} className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition">Delete</button>
                            <button onClick={() => updateStatusMutation.mutate({ id: selectedInquiry.id, status: 'READ' })} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition">Mark as Handled</button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="h-[400px] bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center space-y-4">
                        <Mail className="h-12 w-12 text-gray-200" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Select a message from the list to view details and attachments</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
