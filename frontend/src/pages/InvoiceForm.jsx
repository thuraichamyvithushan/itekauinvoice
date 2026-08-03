import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, Calculator, User, Building, MapPin, Banknote, Calendar, Clock, Hash, Tag, FileText, Loader2, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../utils/utils';

const InvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [clients, setClients] = useState([]);

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customerDetails: { name: '', address: '', email: '', phone: '', website: '' },
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        companyDetails: { name: '', address: '', phone: '', email: '', website: '', abn: '', acn: '', AmountEnclosed: '' },
        paymentInstructions: { bankName: '', accountName: '', accountNumber: '', bsb: '' },
        status: 'Draft'
    });

    useEffect(() => {
        fetchClients();
        const initForm = async () => {
            if (user && !id) {
                let nextNum = '001';
                try {
                    const res = await api.get('/invoices');
                    const count = res.data.length;
                    nextNum = String(count + 1).padStart(3, '0');
                } catch (e) {
                    console.error('Failed to fetch invoice count');
                }

                setFormData(prev => ({
                    ...prev,
                    invoiceNumber: `INV-${nextNum}`,
                    companyDetails: {
                        name: user.companyProfile?.name || '',
                        address: user.companyProfile?.address || '',
                        phone: user.companyProfile?.phone || '',
                        email: user.companyProfile?.email || user.email,
                        website: user.companyProfile?.website || '',
                        abn: user.companyProfile?.abn || '',
                        acn: user.companyProfile?.acn || '',
                        AmountEnclosed: user.companyDetails?.AmountEnclosed || ''
                    },
                    paymentInstructions: {
                        bankName: user.companyProfile?.bankName || '',
                        accountName: user.companyProfile?.accountName || '',
                        accountNumber: user.companyProfile?.accountNumber || '',
                        bsb: user.companyProfile?.bsb || ''
                    }
                }));
            }
        };
        initForm();

        if (id) {
            fetchInvoice();
        }
    }, [id, user]);

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (error) {
            console.error('Failed to fetch clients');
        }
    };

    const fetchInvoice = async () => {
        setFetching(true);
        try {
            const res = await api.get(`/invoices/${id}`);
            const inv = res.data;
            setFormData({
                ...formData,
                ...inv,
                customerDetails: {
                    ...formData.customerDetails,
                    ...inv.customerDetails
                },
                companyDetails: {
                    ...formData.companyDetails,
                    ...inv.companyDetails
                },
                paymentInstructions: {
                    ...formData.paymentInstructions,
                    ...inv.paymentInstructions
                },
                invoiceDate: new Date(inv.invoiceDate).toISOString().split('T')[0],
                dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
            });
        } catch (error) {
            alert('Failed to fetch invoice');
            navigate('/');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (field, value, section = null) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));

            if (field === 'name' && section === 'customerDetails') {
                const existingClient = clients.find(c => c.name.toLowerCase() === value.toLowerCase());
                if (existingClient) {
                    setFormData(prev => ({
                        ...prev,
                        customerDetails: {
                            name: existingClient.name,
                            address: existingClient.address || '',
                            email: existingClient.email || '',
                            phone: existingClient.phone || '',
                            website: existingClient.website || ''
                        }
                    }));
                }
            }
        } else {
            const updates = { [field]: value };

            if (field === 'invoiceDate') {
                const date = new Date(value);
                date.setDate(date.getDate() + 7);
                updates.dueDate = date.toISOString().split('T')[0];
            }

            setFormData(prev => ({ ...prev, ...updates }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
            const price = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
            newItems[index].total = qty * price;
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((acc, item) => acc + item.total, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await api.put(`/invoices/${id}`, formData);
            } else {
                await api.post('/invoices', formData);
            }
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Layout><div className="flex justify-center p-20 text-slate-400 font-bold">Synchronizing Data...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6 pb-32">
                {/* Sticky Header */}
                <div className="sticky top-16 z-40 -mx- px-4 py-4 bg-surface-100/80 backdrop-blur-xl border-b border-outline mb-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/')} className="p-3 bg-surface-200 border border-outline hover:bg-surface-300 rounded-2xl transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">{id ? 'Edit Invoice' : 'New Invoice'}</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{formData.invoiceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-primary to-red-700 hover:to-red-600 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span>{id ? 'UPDATE' : 'CREATE'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-200 border border-outline p-8 rounded-[2rem] space-y-8">
                            <div className="flex items-center space-x-3 text-primary">
                                <FileText className="h-5 w-5" />
                                <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">General Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Hash className="h-3 w-3" /> Invoice No</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        value={formData.invoiceDate}
                                        onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Clock className="h-3 w-3" /> Due Date</label>
                                    <input
                                        type="date"
                                        readOnly
                                        className="w-full px-4 py-3 bg-surface-200 border border-outline rounded-xl text-slate-400 font-bold outline-none cursor-not-allowed"
                                        value={formData.dueDate}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Hash className="h-3 w-3" /> ABN</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 96 678 973 085"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        value={formData.companyDetails.abn}
                                        onChange={(e) => handleInputChange('abn', e.target.value, 'companyDetails')}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Tag className="h-3 w-3" /> Status</label>
                                <select
                                    className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-200 border border-outline rounded-[2rem] overflow-hidden">
                            <div className="px-8 py-6 border-b border-outline flex justify-between items-center bg-surface-300/30">
                                <div className="flex items-center space-x-3 text-primary">
                                    <Tag className="h-5 w-5" />
                                    <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">Line Items</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:scale-110 transition-transform"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <AnimatePresence>
                                    {formData.items.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="grid grid-cols-12 gap-4 items-end bg-slate-800/20 p-4 rounded-2xl group"
                                        >
                                            <div className="col-span-12 md:col-span-6 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Graphic Design Services"
                                                    className="w-full px-4 py-2 bg-surface-100 border border-outline rounded-xl text-sm text-white font-medium outline-none focus:ring-2 focus:ring-primary/40"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Qty</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full px-4 py-2 bg-surface-100 border border-outline rounded-xl text-sm text-center text-white font-medium outline-none focus:ring-2 focus:ring-primary/40"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Price</label>
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    className="w-full px-4 py-2 bg-surface-100 border border-outline rounded-xl text-sm text-right text-white font-medium outline-none focus:ring-2 focus:ring-primary/40"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 flex items-center justify-between pb-2 pl-2">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                                                    <p className="text-sm font-black text-white">{formatCurrency(item.total)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1.5 text-slate-300 hover: transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-slate-400">
                                        <Calculator className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Total Calculation</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 font-medium">Grand Total (AUD)</p>
                                        <p className="text-4xl font-black text-primary">{formatCurrency(calculateSubtotal())}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-200 border border-outline p-8 rounded-[2rem] space-y-8">
                            <div className="flex items-center space-x-3 text-primary">
                                <User className="h-5 w-5" />
                                <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">Customer Details</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        list="client-list"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        placeholder="Enter customer name"
                                        value={formData.customerDetails.name}
                                        onChange={(e) => handleInputChange('name', e.target.value, 'customerDetails')}
                                    />
                                    <datalist id="client-list">
                                        {clients.map(client => (
                                            <option key={client._id} value={client.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Address</label>
                                    <textarea
                                        rows="2"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        placeholder="Enter customer address"
                                        value={formData.customerDetails.address}
                                        onChange={(e) => handleInputChange('address', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        placeholder="Enter customer email"
                                        value={formData.customerDetails.email}
                                        onChange={(e) => handleInputChange('email', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Phone_NO</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        placeholder="Enter customer phone"
                                        value={formData.customerDetails.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Website</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        placeholder="Enter customer Website"
                                        value={formData.customerDetails.website}
                                        onChange={(e) => handleInputChange('website', e.target.value, 'customerDetails')}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-surface-200 border border-outline p-8 rounded-[2rem] space-y-8">
                            <div className="flex items-center space-x-3 text-primary">
                                <Banknote className="h-5 w-5" />
                                <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">Payment Setup</h3>
                            </div>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        value={formData.paymentInstructions.bankName}
                                        onChange={(e) => handleInputChange('bankName', e.target.value, 'paymentInstructions')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                        value={formData.paymentInstructions.accountName}
                                        onChange={(e) => handleInputChange('accountName', e.target.value, 'paymentInstructions')}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BSB</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                            value={formData.paymentInstructions.bsb}
                                            onChange={(e) => handleInputChange('bsb', e.target.value, 'paymentInstructions')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acc No</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-surface-100 border border-outline rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-primary/40"
                                            value={formData.paymentInstructions.accountNumber}
                                            onChange={(e) => handleInputChange('accountNumber', e.target.value, 'paymentInstructions')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div >
        </Layout >
    );
};

export default InvoiceForm;
