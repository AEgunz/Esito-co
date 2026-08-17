import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, User, Upload, Send, CheckCircle, MessageSquare, RefreshCw, X, Landmark } from 'lucide-react';
import api from '../api/axios';

const Corporate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Corporate Order',
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
      alert('Upload failed');
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
    } catch (err) {
      alert('Error sending request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Request Received!</h1>
        <p className="text-gray-500 max-w-md mb-8">We will contact you shortly.</p>
        <button onClick={() => window.location.href = '/'} className="bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-4 text-start">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-gray-900">Custom <span className="text-blue-600">B2B</span> Solutions</h1>
            <p className="text-gray-400 font-medium max-w-xl mx-auto italic text-lg">High quality custom apparel for your business.</p>
        </div>

        <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100 grid md:grid-cols-5 text-start">
            <div className="md:col-span-2 bg-black p-12 text-white space-y-10 text-start">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Contact Info</h2>
                <div className="space-y-6 text-start">
                    <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-blue-400" />
                        <p className="font-bold">+212 693-360625</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <p className="font-bold">sales@estilo-co.ma</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="md:col-span-3 p-12 space-y-6 text-start">
                <div className="space-y-4 text-start">
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                        <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <input required type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                        <input required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo</label>
                        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition relative">
                            {isUploading ? <RefreshCw className="h-6 w-6 animate-spin text-blue-600" /> : <Upload className="h-6 w-6 text-gray-300" />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                    </div>
                    <div className="space-y-1 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                        <textarea required className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-600 font-bold" rows={3} placeholder="Tell us what you need" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                    </div>
                </div>

                <button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition">
                    {isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'Send Request'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Corporate;
