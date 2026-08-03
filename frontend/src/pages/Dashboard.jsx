import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout from '../layouts/Layout';
import { Search, Plus, FileText, Download, Edit, Eye, TrendingUp, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../utils/utils';

const Dashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async (search = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/invoices?search=${search}`);
            setInvoices(res.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInvoices(searchTerm);
    };

    const handleDeleteAll = async () => {
        if (window.confirm('CRITICAL: This will permanently delete ALL invoices. Are you sure?')) {
            try {
                await api.delete('/invoices/delete/all');
                setInvoices([]);
            } catch (error) {
                alert('Failed to delete all invoices');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.delete(`/invoices/${id}`);
                setInvoices(invoices.filter(inv => inv._id !== id));
            } catch (error) {
                alert('Failed to delete invoice');
            }
        }
    };

    const handleStatusCycle = async (invoice) => {
        const statuses = ['Draft', 'Sent', 'Paid'];
        const currentIndex = statuses.indexOf(invoice.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        try {
            const res = await api.put(`/invoices/${invoice._id}`, { ...invoice, status: nextStatus });
            setInvoices(invoices.map(inv => inv._id === invoice._id ? res.data : inv));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleDownload = async (id, number) => {
        try {
            const response = await api.get(`/invoices/${id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download PDF');
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Paid': return { color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', icon: TrendingUp };
            case 'Overdue': return { color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', icon: AlertCircle };
            case 'Sent': return { color: 'bg-primary/10 text-primary border border-primary/20', icon: Clock };
            default: return { color: 'bg-slate-500/10 text-slate-400 border border-slate-500/20', icon: FileText };
        }
    };

    const filteredInvoices = filter === 'All'
        ? invoices
        : invoices.filter(inv => inv.status?.toLowerCase() === filter.toLowerCase());

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <div className="space-y-8 px-4 sm:px-0 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black text-white tracking-tighter">Dashboard</h1>
                        <p className="text-slate-500 font-medium">Manage your business finances with ease.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleDeleteAll}
                            className="inline-flex items-center px-8 py-4 bg-surface-300 border border-outline text-slate-400 font-black rounded-2xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 active:scale-95 group"
                        >
                            <Trash2 className="h-5 w-5 mr-2" />
                            Delete All
                        </button>
                        <Link
                            to="/invoices/new"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-red-700 text-white font-black rounded-2xl shadow-[0_8px_30px_rgb(242,0,0,0.3)] transition-all hover:scale-105 active:scale-95 group"
                        >
                            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                            Create Invoice
                        </Link>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Revenue', value: formatCurrency(invoices.reduce((a, b) => a + b.totalAmount, 0)) },
                        { label: 'Pending', value: formatCurrency(invoices.filter(i => i.status !== 'Paid').reduce((a, b) => a + b.totalAmount, 0)) },
                        { label: 'Total Invoices', value: invoices.length },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-surface-200 border border-outline p-8 rounded-[2rem]"
                        >
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className="text-4xl font-black text-white tracking-tight">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:flex-1 no-scrollbar">
                        {['All', 'Draft', 'Sent', 'Paid'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-10 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap tracking-widest",
                                    filter === f
                                        ? "bg-primary text-white shadow-xl shadow-primary/20"
                                        : "bg-surface-300 border border-outline text-slate-500 hover:text-white hover:border-slate-700"
                                )}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full pl-14 pr-6 py-4 bg-surface-200 border border-outline rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>

                {/* Invoice Grid */}
                {loading ? (
                    <div className="flex justify-center p-20 text-slate-400">
                        <Clock className="h-8 w-8 animate-spin mr-3" />
                        <span className="text-xl font-bold">Synchronizing...</span>
                    </div>
                ) : (
                    <motion.div
                        key={filter}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => {
                                    const status = getStatusInfo(invoice.status);
                                    return (
                                        <motion.div
                                            key={invoice._id}
                                            variants={item}
                                            layout
                                            className={cn(
                                                "bg-surface-200 border transition-all rounded-[2rem] overflow-hidden flex flex-col h-full group",
                                                invoice.status === 'Draft' ? "border-primary/20 hover:border-primary/50" : "border-outline hover:border-slate-800"
                                            )}
                                        >
                                            <div className="p-8 space-y-6 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div className="p-4 bg-primary/10 rounded-2xl">
                                                        <FileText className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <button
                                                        onClick={() => handleStatusCycle(invoice)}
                                                        className={cn("px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all hover:scale-105 active:scale-95 tracking-widest", status.color)}
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        {invoice.status.toUpperCase()}
                                                    </button>
                                                </div>

                                                <div className="space-y-1">
                                                    <Link to={`/invoices/view/${invoice._id}`} className="text-xl font-black text-white hover:text-primary transition-colors tracking-tight">
                                                        {invoice.invoiceNumber}
                                                    </Link>
                                                    <p className="text-slate-500 font-bold text-sm">
                                                        {invoice.customerDetails.name}
                                                    </p>
                                                </div>

                                                <div className="pt-6 border-t border-outline flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Amount</p>
                                                        <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(invoice.totalAmount)}</p>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 font-bold">
                                                        Due {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="px-8 py-6 bg-surface-100/50 flex justify-between items-center mt-auto border-t border-outline">
                                                <div className="flex gap-2">
                                                    <Link to={`/invoices/edit/${invoice._id}`} className="p-3 bg-surface-300 rounded-xl text-slate-400 hover:text-white transition-colors" title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(invoice._id)}
                                                        className="p-3 bg-surface-300 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex gap-3">
                                             
                                                    <Link to={`/invoices/view/${invoice._id}`} className="inline-flex items-center px-6 py-3 bg-primary text-white text-xs font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20" title="Preview">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        VIEW
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-20 text-center bg-surface-200 border border-outline rounded-[2rem]"
                                >
                                    <FileText className="h-16 w-16 text-slate-800 mx-auto mb-4" />
                                    <p className="text-slate-500 font-black tracking-tight uppercase text-sm">No {filter !== 'All' ? filter.toLowerCase() : ''} invoices found</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
