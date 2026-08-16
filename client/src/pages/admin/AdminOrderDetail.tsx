import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { SERVER_URL } from '../../api/axios';
import { ArrowLeft, Download, User, MapPin, Phone, Mail, Image as ImageIcon, Calendar, ShoppingBag, Sparkles, Truck, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => (await api.get(`/orders/all`)).data.find((o: any) => o.id === id)
  });

  const syncToAmeex = async () => {
      setIsSyncing(true);
      try {
          const citiesRes = await api.get('/delivery');
          const cityMap = Array.isArray(citiesRes.data) ? citiesRes.data : [];
          const cityData = cityMap.find((c: any) => c.city.toLowerCase() === order.city.toLowerCase());

          if (!cityData || !cityData.ameexId) {
              alert(`Error: City "${order.city}" has no AMEEX ID mapping.`);
              return;
          }

          const res = await api.post('/ameex/add', { ...order, city: cityData.ameexId });
          if (res.data.status) alert(`Success! AMEEX Tracking: ${res.data.tracking_code}`);
          else alert(`AMEEX Error: ${res.data.message}`);
      } catch (err: any) {
          alert(`Sync Failed: ${err.message}`);
      } finally {
          setIsSyncing(false);
      }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${SERVER_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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
    } catch (error) {
      alert('Download failed. Try Save Image As.');
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse font-black uppercase">Loading Details...</div>;
  if (!order) return <div className="p-20 text-center text-red-600 font-bold">Order not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 text-start">
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 text-gray-500 hover:text-black transition font-bold">
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-start">
        <div className="space-y-2 text-start">
            <h1 className="text-5xl font-black tracking-tighter italic uppercase">Order Details</h1>
            <div className="flex items-center gap-4 text-gray-400 font-bold">
                <span className="uppercase tracking-widest text-sm">#{order.id.slice(0, 8)}</span>
                <span className="w-2 h-2 bg-gray-200 rounded-full"></span>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {new Date(order.createdAt).toLocaleString()}
                </div>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={syncToAmeex} disabled={isSyncing} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] shadow-xl flex items-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition">
                {isSyncing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><Truck className="h-5 w-5" /> Send to AMEEX</>}
            </button>
            <div className="bg-black text-white px-8 py-4 rounded-[24px] shadow-xl flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Total Paid</span>
                <span className="text-2xl font-black">{Number(order.totalAmount).toFixed(0)} DH</span>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 text-start">
        <div className="lg:col-span-1 space-y-8 text-start">
            <section className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-start">
                <h2 className="text-xl font-black flex items-center gap-3"><User className="h-5 w-5 text-blue-600" /> Customer</h2>
                <div className="space-y-4 text-start">
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p><p className="font-black text-gray-900 text-lg">{order.firstName} {order.lastName}</p></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone / WhatsApp</p><p className="font-black text-green-600 text-lg">{order.phone}</p></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">City / Delivery</p><p className="font-black text-gray-900 text-lg uppercase italic">{order.city}</p></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Address</p><p className="font-medium text-gray-600 leading-relaxed">{order.address}</p></div>
                </div>
            </section>
        </div>

        <div className="lg:col-span-2 space-y-8 text-start">
            <section className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden text-start">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h2 className="text-xl font-black flex items-center gap-3"><ShoppingBag className="h-5 w-5 text-blue-600" /> Items & Photos</h2>
                    <span className="bg-white px-4 py-1 rounded-full text-[10px] font-black text-gray-400 border uppercase tracking-widest">{order.items.length} Products</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {order.items.map((item: any) => {
                        const isMultiPhoto = item.customerPhoto?.startsWith('[');
                        const photos = isMultiPhoto ? JSON.parse(item.customerPhoto) : (item.customerPhoto ? [item.customerPhoto] : []);
                        const hasCustomPhotos = photos.length > 0;
                        const displayPhoto = hasCustomPhotos ? photos[0] : item.product?.image;

                        return (
                            <div key={item.id} className="p-8 flex flex-col md:flex-row gap-8 items-start hover:bg-gray-50/50 transition-colors text-start">
                                <div className="w-full md:w-48 aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-lg bg-gray-100 relative group">
                                    <img src={getImageUrl(displayPhoto)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a href={getImageUrl(displayPhoto)} target="_blank" className="bg-white text-black p-3 rounded-full shadow-xl"><ImageIcon className="h-5 w-5" /></a>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-6 text-start">
                                    <div className="space-y-1 text-start">
                                        <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">{item.product?.name}</h3>
                                        <div className="flex gap-4">
                                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Qty: {item.quantity}</p>
                                            <p className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Size: {item.selectedSize || 'N/A'}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Color:</p>
                                                <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.selectedColor }} />
                                            </div>
                                        </div>
                                    </div>

                                    {hasCustomPhotos ? (
                                        <div className="space-y-4 text-start pt-4 border-t border-gray-50">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Customer Uploads ({photos.length})</p>
                                            <div className="grid grid-cols-4 gap-4">
                                                {photos.map((img: string, idx: number) => (
                                                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group">
                                                        <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <a href={getImageUrl(img)} target="_blank" className="bg-white p-2 rounded-lg"><ImageIcon className="h-4 w-4" /></a>
                                                            <button onClick={() => handleDownload(img, `customer-photo-${idx}.png`)} className="bg-white p-2 rounded-lg"><Download className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Standard Product (No Custom Photos)</p>
                                        </div>
                                    )}

                                    {item.customText && (
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-start">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Custom Text:</p>
                                            <p className="font-bold text-blue-900">"{item.customText}"</p>
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
