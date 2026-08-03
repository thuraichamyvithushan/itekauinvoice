import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Layout from '../layouts/Layout';
import { User, Building, MapPin, Phone, Globe, Hash, Save, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/utils';

const Profile = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        abn: '',
        acn: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        bsb: ''
    });

    useEffect(() => {
        if (user?.companyProfile) {
            setFormData({
                name: user.companyProfile.name || '',
                address: user.companyProfile.address || '',
                phone: user.companyProfile.phone || '',
                email: user.companyProfile.email || '',
                website: user.companyProfile.website || '',
                abn: user.companyProfile.abn || '',
                acn: user.companyProfile.acn || '',
                bankName: user.companyProfile.bankName || '',
                accountName: user.companyProfile.accountName || '',
                accountNumber: user.companyProfile.accountNumber || '',
                bsb: user.companyProfile.bsb || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await api.put('/auth/profile', { companyProfile: formData });
            setUser(res.data);
            setMessage('Profile updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        {
            title: 'Company Information',
            icon: Building,
            fields: [
                { name: 'name', type: 'text', placeholder: 'Company Name', icon: Building },
                { name: 'phone', type: 'text', placeholder: 'Phone Number', icon: Phone },
                { name: 'email', type: 'text', placeholder: 'Business Email', icon: Globe },
                { name: 'website', type: 'text', placeholder: 'Website (Optional)', icon: Globe },
                { name: 'abn', type: 'text', placeholder: 'ABN', icon: Hash },
                { name: 'acn', type: 'text', placeholder: 'ACN', icon: Hash },
                { name: 'address', type: 'textarea', placeholder: 'Full Address', icon: MapPin },
            ]
        },
        {
            title: 'Bank Details',
            icon: Hash,
            fields: [
                { name: 'bankName', type: 'text', placeholder: 'Bank Name', icon: Building },
                { name: 'accountName', type: 'text', placeholder: 'Account Name', icon: User },
                { name: 'accountNumber', type: 'text', placeholder: 'Account Number', icon: Hash },
                { name: 'bsb', type: 'text', placeholder: 'BSB', icon: Hash },
            ]
        }
    ];

    return (
        <Layout>
            <div className="space-y-8 pb-32 max-w-4xl mx-auto px-4 sm:px-0">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-white transition-colors mb-4 group">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </button>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Profile Settings</h1>
                        <p className="text-slate-500 font-medium">Manage your business brand and billing information.</p>
                    </div>
                </div>

                {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-emerald-400">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-bold">{message}</span>
                    </motion.div>
                )}

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-primary rounded-2xl text-red-400 font-bold">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-surface-200 border border-outline p-8 rounded-[2.5rem] space-y-8"
                        >
                            <div className="flex items-center space-x-3 text-primary">
                                <section.icon className="h-5 w-5" />
                                <h2 className="text-lg font-black uppercase tracking-widest">{section.title}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.fields.map((field) => (
                                    <div key={field.name} className={cn("relative group", field.name === 'address' && "md:col-span-2")}>
                                        <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        {field.name === 'address' ? (
                                            <textarea
                                                name={field.name}
                                                rows="3"
                                                placeholder={field.placeholder}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 font-medium transition-all"
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                            />
                                        ) : (
                                            <input
                                                name={field.name}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 font-medium transition-all"
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-primary to-red-700 text-white font-black rounded-2xl shadow-[0_8px_30px_rgb(242,0,0,0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <Save className="h-5 w-5 mr-2" />
                            )}
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default Profile;
