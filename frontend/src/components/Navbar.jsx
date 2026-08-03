import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, PlusCircle, LayoutDashboard, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/utils';
import logo from "../assets/logo/itek.png";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'New Invoice', path: '/invoices/new', icon: PlusCircle },
        { label: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="p-2 rounded-lg shadow-lg shadow-red-500/10 group-hover:scale-110 transition-transform">
                                <img
                                    src={logo}
                                    alt="iTek Solutions"
                                    className="h-10 w-auto sm:h-11 md:h-14 object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-black dark:from-red-500 dark:to-white">

                            </span>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-4">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={cn(
                                            "flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                                            isActive
                                                ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(242,0,0,0.1)]"
                                                : "text-slate-400 hover:text-white hover:bg-surface-300"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 mr-2" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-4 border-l border-outline ml-4 pl-4">
                            <Link to="/profile" className="flex flex-col items-end hover:text-primary transition-colors">
                                <span className="text-sm font-bold text-white leading-none mb-1 group-hover:text-primary">{user.companyProfile?.name || 'User'}</span>
                                <span className="text-[11px] text-slate-500 font-medium">Edit Profile</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-16 inset-x-0 glass border-b border-white/20 dark:border-slate-800/50 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center px-4 py-3 rounded-xl text-base font-medium",
                                        location.pathname === item.path
                                            ? "bg-red-500/10 text-primary dark:bg-red-500/20"
                                            : "text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </Link>
                            ))}
                            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center px-4 py-3">
                                    <div className="flex-1">
                                        <p className="text-base font-medium text-slate-900 dark:text-slate-100">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-red-500"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
