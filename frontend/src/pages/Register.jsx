import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, FileText, User, Building, MapPin, Phone, Globe, ArrowRight, Loader2, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
        address: '',
        phone: '',
        website: '',
        abn: '',
        acn: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        bsb: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({
                email: formData.email,
                password: formData.password,
                companyProfile: {
                    name: formData.companyName,
                    address: formData.address,
                    phone: formData.phone,
                    website: formData.website,
                    abn: formData.abn,
                    acn: formData.acn,
                    bankName: formData.bankName,
                    accountName: formData.accountName,
                    accountNumber: formData.accountNumber,
                    bsb: formData.bsb
                }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const inputFields = [
        { name: 'email', type: 'email', placeholder: 'Email Address', icon: Mail, section: 'auth' },
        { name: 'password', type: 'password', placeholder: 'Password', icon: Lock, section: 'auth' },
        { name: 'companyName', type: 'text', placeholder: 'Company Name', icon: Building, section: 'profile' },
        { name: 'phone', type: 'text', placeholder: 'Phone Number', icon: Phone, section: 'profile' },
        { name: 'website', type: 'text', placeholder: 'Website (Optional)', icon: Globe, section: 'profile' },
        { name: 'abn', type: 'text', placeholder: 'ABN (e.g. 96 678 973 085)', icon: Hash, section: 'profile' },
        { name: 'acn', type: 'text', placeholder: 'ACN (e.g. 123 456 789)', icon: Hash, section: 'profile' },
        { name: 'bankName', type: 'text', placeholder: 'Bank Name', icon: Building, section: 'bank' },
        { name: 'accountName', type: 'text', placeholder: 'Account Name', icon: User, section: 'bank' },
        { name: 'accountNumber', type: 'text', placeholder: 'Account Number', icon: Hash, section: 'bank' },
        { name: 'bsb', type: 'text', placeholder: 'BSB', icon: Hash, section: 'bank' },
        { name: 'address', type: 'textarea', placeholder: 'Company Address', icon: MapPin, section: 'profile' },
    ];

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="bg-surface-200 border border-outline p-8 md:p-12 rounded-[2.5rem] shadow-2xl space-y-10">
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-5 bg-gradient-to-br from-primary to-red-700 rounded-3xl shadow-xl shadow-primary/20 mb-2"
                        >
                            <FileText className="h-8 w-8 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
                        <p className="text-slate-500 font-medium">Join iTEK for professional invoicing</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-500/10 border-l-4 border-primary rounded-r-xl"
                            >
                                <p className="text-sm text-red-400 font-bold">{error}</p>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputFields.map((field) => (
                                <div key={field.name} className={cn("relative group", field.name === 'address' && "md:col-span-2")}>
                                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                    {field.name === 'address' ? (
                                        <textarea
                                            name={field.name}
                                            rows="2"
                                            placeholder={field.placeholder}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 font-medium transition-all"
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <input
                                            name={field.name}
                                            type={field.type}
                                            required={field.name !== 'website'}
                                            placeholder={field.placeholder}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 font-medium transition-all"
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-red-700 hover:to-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
