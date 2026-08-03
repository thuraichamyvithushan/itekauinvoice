import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
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
                <div className="bg-surface-200 border border-outline p-10 rounded-[2.5rem] shadow-2xl space-y-10">
                    <div className="text-center space-y-3">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-5 bg-gradient-to-br from-primary to-red-700 rounded-3xl shadow-xl shadow-primary/20 mb-2"
                        >
                            <FileText className="h-8 w-8 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 font-medium">Streamline your billing process</p>
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

                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-100 border border-outline outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end pr-2">
                                <Link to="/forgot-password" size="sm" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                                    Forgot password?
                                </Link>
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
                                    <span>Sign In</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
