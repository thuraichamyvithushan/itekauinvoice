import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Mail, ArrowLeft, Loader2, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setResetToken('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            if (res.data.testToken) {
                setResetToken(res.data.testToken);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-surface-200 border border-outline p-10 rounded-[2.5rem] shadow-2xl space-y-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex p-5 bg-gradient-to-br from-primary to-red-700 rounded-3xl shadow-xl shadow-primary/20 mb-2">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Forgot Password?</h1>
                        <p className="text-slate-500 font-medium">Enter your email to get a reset link</p>
                    </div>

                    {message ? (
                        <div className="text-center space-y-6">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] space-y-3">
                                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                                <p className="text-sm text-emerald-400 font-bold">{message}</p>
                                {resetToken && (
                                    <p className="text-xs text-slate-500 mt-4 italic">Note: Real email sending is active. Check your inbox.</p>
                                )}
                            </div>
                            <Link
                                to="/login"
                                className="inline-flex items-center text-primary font-bold hover:underline"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border-l-4 border-primary rounded-r-xl">
                                    <p className="text-sm text-red-400 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-red-700 hover:to-red-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span>Send Reset Link</span>
                                )}
                            </button>

                            <p className="text-center font-medium">
                                <Link to="/login" className="text-slate-500 hover:text-white transition-colors flex items-center justify-center">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Login
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
