import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, User, Upload, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';

const Corporate = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Corporate Order / Special Design',
    message: '',
    logoUrl: ''
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await api.post('/upload', data);
      setFormData({ ...formData, logoUrl: res.data.url });
    } catch (err) {
      alert('Logo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inquiries', formData);
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      alert('Error sending request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="bg-green-100 p-6 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Request Received!</h1>
        <p className="text-gray-500 max-w-md font-medium">Thank you for choosing Estilo-co. Our team will review your corporate request and contact you via phone or email shortly.</p>
        <button onClick={() => window.location.href = '/'} className="bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-5 py-2 rounded-full border border-blue-100">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-black text-blue-700 uppercase tracking-widest">B2B & Special Projects</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">Custom <span className="text-blue-600">Company</span> Apparel</h1>
            <p className="text-gray-400 text-lg font-medium max-w-xl mx-auto italic">Need t-shirts for your team or event? Upload your brand logo and tell us what you need. We deliver quality at scale.</p>
        </div>

        <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100 grid md:grid-cols-5">
            {/* Left Info Bar */}
            <div className="md:col-span-2 bg-black p-12 text-white space-y-12">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Get in Touch</h2>
                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl"><Phone className="h-5 w-5 text-blue-400" /></div>
                        <div><p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Call Us</p><p className="font-bold">+212 693-360625</p></div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 p-3 rounded-2xl"><Mail className="h-5 w-5 text-blue-400" /></div>
                        <div><p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Email Us</p><p className="font-bold">sales@estilo-co.ma</p></div>
                    </div>
                </div>
                <div className="pt-10">
                    <div className="p-6 bg-blue-600 rounded-3xl space-y-3">
                        <p className="font-black uppercase text-[10px] tracking-widest">Bulk Discount</p>
                        <p className="text-sm font-medium leading-relaxed">Orders over 20 pieces qualify for special corporate pricing. Inquire now for a quote.</p>
                    </div>
                </div>
            </div>

            {/* Right Form */}
            <form onSubmit={handleSubmit} className="md:col-span-3 p-12 space-y-8 text-start">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            <input required className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                            <input required type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="company@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="06XXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Company Logo</label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition group relative overflow-hidden">
                            {isUploading ? (
                                <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
                            ) : formData.logoUrl ? (
                                <div className="absolute inset-0 bg-white flex items-center justify-center gap-4 px-6">
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    <span className="font-bold text-xs truncate">{formData.logoUrl.split('/').pop()}</span>
                                    <button type="button" onClick={(e) => { e.preventDefault(); setFormData({...formData, logoUrl: ''})}} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-6 w-6 text-gray-300 group-hover:text-blue-600 transition-colors" />
                                    <span className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">PNG, JPG or PDF</span>
                                </>
                            )}
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleLogoUpload} />
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Description</label>
                        <textarea required className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" rows={4} placeholder="e.g. 50 Black Oversized T-shirts with white chest logo..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                    </div>
                </div>

                <button
                    disabled={isSubmitting || isUploading}
                    className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <><Send className="h-5 w-5" /> Send Request</>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);

export default Corporate;
