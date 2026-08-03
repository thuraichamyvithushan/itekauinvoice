import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { Lock, ArrowRight, Loader2, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/reset-password', { token, password });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-surface-200 border border-outline p-10 rounded-[2.5rem] shadow-2xl text-center">
                    <p className="text-red-400 font-bold">Invalid reset token.</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-black text-white tracking-tight">Reset Password</h1>
                        <p className="text-slate-500 font-medium">Enter your new password below</p>
                    </div>

                    {message ? (
                        <div className="text-center space-y-6">
                            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] space-y-3">
                                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                                <p className="text-sm text-emerald-400 font-bold">{message}</p>
                            </div>
                            <p className="text-slate-500 text-sm">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border-l-4 border-primary rounded-r-xl">
                                    <p className="text-sm text-red-400 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="New Password"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 transition-all font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Confirm New Password"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 transition-all font-medium"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
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
                                        <span>Reset Password</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
