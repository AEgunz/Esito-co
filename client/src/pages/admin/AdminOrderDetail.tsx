import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import { ArrowLeft, Download, User, MapPin, Phone, Mail, Image as ImageIcon, Calendar, ShoppingBag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => (await api.get(`/orders/all`)).data.find((o: any) => o.id === id)
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    const finalUrl = `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    return finalUrl;
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(getImageUrl(url));
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert('Could not download image. Try right-click > Save Image As.');
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading Details...</div>;
  if (!order) return <div className="p-20 text-center text-red-600">Order not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-black transition font-bold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter">Order Details</h1>
            <div className="flex items-center gap-4 text-gray-400 font-bold">
                <span className="uppercase tracking-widest text-sm">#{order.id.slice(0, 12)}</span>
                <span className="w-2 h-2 bg-gray-200 rounded-full"></span>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {new Date(order.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
        <div className="bg-blue-600 text-white px-8 py-4 rounded-[24px] shadow-xl shadow-blue-100 flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">Total Amount</span>
            <span className="text-3xl font-black">{Number(order.totalAmount).toFixed(0)} DH</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left: Customer & Address */}
        <div className="lg:col-span-1 space-y-8">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-black flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-600" /> Customer
                </h2>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                        <p className="font-black text-gray-900 text-lg">{order.firstName} {order.lastName}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone / WhatsApp</p>
                        <p className="font-black text-green-600 text-lg">{order.phone}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="font-medium text-gray-600">{order.email}</p>
                    </div>
                </div>
            </section>

            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-black flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" /> Shipping Info
                </h2>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">City</p>
                        <p className="font-black text-gray-900 text-lg">{order.city}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Address</p>
                        <p className="font-medium text-gray-600 leading-relaxed">{order.address}</p>
                    </div>
                </div>
            </section>
        </div>

        {/* Right: Items & Photos */}
        <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5 text-blue-600" /> Order Items
                    </h2>
                    <span className="bg-white px-4 py-1 rounded-full text-xs font-bold text-gray-400 border">{order.items.length} Items</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {order.items.map((item: any) => {
                        const isMultiPhoto = item.customerPhoto?.startsWith('[');
                        const photos = isMultiPhoto ? JSON.parse(item.customerPhoto) : [item.customerPhoto];
                        const mainPhotoUrl = photos[0] || '';

                        return (
                            <div key={item.id} className="p-8 flex flex-col md:flex-row gap-8 items-start hover:bg-blue-50/20 transition-colors">
                                <div className="w-full md:w-48 aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-lg bg-gray-100 relative group">
                                    <img src={getImageUrl(mainPhotoUrl)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a href={getImageUrl(mainPhotoUrl)} target="_blank" className="bg-white text-black p-3 rounded-full shadow-xl">
                                            <ImageIcon className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-gray-900">{item.product?.name}</h3>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Qty: {item.quantity} x {Number(item.price).toFixed(0)} DH</p>
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Size: {item.selectedSize || 'N/A'} | Color: {item.selectedColor || 'N/A'}</p>
                                        </div>
                                        {item.isSpecialDesign && (
                                            <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100">
                                                <Sparkles className="h-3 w-3" /> Special Design
                                            </div>
                                        )}
                                    </div>

                                    {isMultiPhoto ? (
                                        <div className="space-y-4">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Customer Uploaded Photos ({photos.length})</p>
                                            <div className="grid grid-cols-4 gap-4">
                                                {photos.map((img: string, idx: number) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                                                        <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <a href={getImageUrl(img)} target="_blank" className="bg-white p-2 rounded-lg"><ImageIcon className="h-4 w-4" /></a>
                                                            <button onClick={() => handleDownload(img, `photo-${idx}.png`)} className="bg-white p-2 rounded-lg"><Download className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const url = getImageUrl(item.customerPhoto);
                                                    if (url) window.open(url, '_blank');
                                                }}
                                                className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
                                            >
                                                <ImageIcon className="h-4 w-4" /> View Original Photo
                                            </button>
                                            <a
                                                href={getImageUrl(item.customerPhoto)}
                                                download={`order-${order.id.slice(0,8)}-design.png`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition"
                                            >
                                                <Download className="h-4 w-4" /> Download Photo
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
