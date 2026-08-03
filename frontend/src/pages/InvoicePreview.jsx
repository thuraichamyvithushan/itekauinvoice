import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../layouts/Layout';
import { Download, ArrowLeft, Loader2, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/utils';
import { useAuth } from '../context/AuthContext';
import iTek from "../assets/logo/itek.png"
import visa from "../assets/icons/visa.svg";
import mastercard from "../assets/icons/mastercard.svg";
import amex from "../assets/icons/american-express.svg";

const InvoicePreview = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        fetchInvoice();

        const handleResize = () => {
            if (window.innerWidth < 896) {
                const newScale = (window.innerWidth - 32) / 896;
                setScale(newScale);
            } else {
                setScale(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const res = await api.get(`/invoices/${id}`);
            setInvoice(res.data);
        } catch (error) {
            alert('Failed to fetch invoice');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const invoiceRef = useRef(null);

    const generateInvoicePdf = async () => {
        if (!invoiceRef.current) return null;

        const element = invoiceRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 896,
            onclone: (clonedDoc) => {
                const clonedContainer = clonedDoc.getElementById('scaling-container');
                if (clonedContainer) {
                    clonedContainer.style.transform = 'none';
                    clonedContainer.style.marginBottom = '0';
                    clonedContainer.style.width = '896px';
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdfHeight = Math.max(imgHeight, 297);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [imgWidth, pdfHeight]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        const linkElement = document.getElementById('payment-link');
        if (linkElement) {
            const linkRect = linkElement.getBoundingClientRect();
            const containerRect = element.getBoundingClientRect();

            const invScale = scale || 1;
            const scaleFactor = imgWidth / 896;
            const linkX = ((linkRect.left - containerRect.left) / invScale) * scaleFactor;
            const linkY = ((linkRect.top - containerRect.top) / invScale) * scaleFactor;
            const linkW = (linkRect.width / invScale) * scaleFactor;
            const linkH = (linkRect.height / invScale) * scaleFactor;

            pdf.link(linkX, linkY, linkW, linkH, { url: linkElement.href });
        }

        return pdf;
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const pdf = await generateInvoicePdf();
            if (pdf) {
                pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF');
        } finally {
            setDownloading(false);
        }
    };

    const handleSend = () => {
        const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.companyDetails?.name || 'iTEK Solutions'}`);
        const body = encodeURIComponent(`Hi ${invoice.customerDetails?.name},\n\nPlease find attached invoice ${invoice.invoiceNumber}.\n\nTotal Amount: ${formatCurrency(invoice.totalAmount)}\n\nThank you for your business!`);
        window.location.href = `mailto:${invoice.customerDetails?.email || ''}?subject=${subject}&body=${body}`;
    };

    if (loading) return <Layout><div className="flex justify-center p-20 text-slate-400 font-bold">Synchronizing Data...</div></Layout>;
    if (!invoice) return <Layout><div className="flex justify-center p-20">Invoice not found.</div></Layout>;

    const companyName = invoice.companyDetails?.name || 'iTEK Solutions PVT LTD';
    const companyAddress = invoice.companyDetails?.address || '130, University Drive,\nCallaghan';
    const companyPhone = invoice.companyDetails?.phone || '(04) 5066 2270';
    const companyEmail = invoice.companyDetails?.email || 'e-mail here';
    const companyWebsite = invoice.companyDetails?.website || 'iteksolutions.com.au';

    return (
        <Layout>
            <div className="space-y-8 pb-32 no-print-bg">
                <div className="sticky top-16 z-40 -mx- px-4 py-4 bg-surface-100/80 backdrop-blur-xl border-b border-outline mb-8 flex items-center justify-between no-print overflow-hidden">
                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                        <button onClick={() => navigate('/')} className="p-2.5 md:p-3 bg-surface-200 border border-outline hover:bg-surface-300 rounded-2xl transition-all flex-shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-lg md:text-2xl font-black text-white tracking-tight truncate">Preview</h1>
                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest truncate">{invoice.invoiceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center ml-2">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="px-4 md:px-8 py-2.5 md:py-3 bg-gradient-to-r from-primary to-red-700 hover:to-red-600 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            <span className="text-xs md:text-sm">{downloading ? 'PREPARING...' : 'DOWNLOAD PDF'}</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-hidden no-print flex justify-center">
                    <div
                        id="scaling-container"
                        className="transition-transform duration-300"
                        style={{
                            width: '896px',
                            minWidth: '896px',
                            transform: `scale(${scale})`,
                            transformOrigin: 'top center',
                            marginBottom: scale < 1 ? `-${(1 - scale) * 1400}px` : '0px'
                        }}
                    >
                        <motion.div
                            ref={invoiceRef}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-[896px] mx-auto printable-content bg-white text-black p-12 pb-24 shadow-2xl relative min-h-[1400px] font-sans"
                        >
                            <div className="grid grid-cols-2 gap-12 mb-24">
                                <div className="space-y-12">
                                    <h1 className="text-5xl font-light tracking-tight text-black">INVOICE</h1>
                                    <div className="pl-32 space-y-0.5">
                                        <p className="font-bold text-sm text-slate-700">{(invoice.clientId?.name || invoice.customerDetails?.name) || 'Name Here'}</p>
                                        <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed max-w-[300px]">
                                            {(invoice.clientId?.address || invoice.customerDetails?.address)}
                                        </p>

                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex justify-end mb-8">
                                        <img src={iTek} alt="iTEK SOLUTIONS" className="h-16 w-auto" />
                                    </div>

                                    <div className="flex justify-end space-x-12 mb-8">
                                        <div className="text-left text-[10px] space-y-4">
                                            <div>
                                                <p className="font-bold text-slate-800">Invoice Date</p>
                                                <p className="text-slate-500">{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : 'DD Jan 2026'}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">Invoice Number</p>
                                                <p className="text-slate-500">{invoice.invoiceNumber || 'INV-00001'}</p>
                                            </div>

                                            <div>
                                                <p className="font-bold text-slate-800">ABN</p>
                                                <p className="text-slate-500">{user?.companyProfile?.abn || invoice.companyDetails?.abn || '96 678 973 085'}</p>
                                            </div>
                                            {(invoice.companyDetails?.acn || user?.companyProfile?.acn) && (
                                                <div>
                                                    <p className="font-bold text-slate-800">ACN</p>
                                                    <p className="text-slate-500">{user?.companyProfile?.acn || invoice.companyDetails?.acn}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-left text-[11px] text-slate-600 leading-relaxed font-medium">
                                            <p className="font-bold text-slate-900">{companyName}</p>
                                            <p className="whitespace-pre-line">{companyAddress}</p>
                                            <p>{companyPhone}</p>
                                            <p>{companyEmail}</p>
                                            <p>{companyWebsite}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full mb-16">
                                <thead>
                                    <tr className="border-b border-black text-xs font-bold text-slate-900">
                                        <th className="text-left py-2 font-bold uppercase tracking-wider">Description</th>
                                        <th className="text-center py-2 font-bold uppercase tracking-wider">Quantity</th>
                                        <th className="text-right py-2 font-bold uppercase tracking-wider">Unit Price</th>
                                        <th className="text-right py-2 font-bold uppercase tracking-wider">Amount AUD</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] text-slate-700">
                                    {invoice.items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-50 last:border-0">
                                            <td className="py-4 align-top">{item.description || 'Item here'}</td>
                                            <td className="py-4 text-center align-top">{item.quantity || 'xxx.x'}</td>
                                            <td className="py-4 text-right align-top">{item.unitPrice ? formatCurrency(item.unitPrice) : 'x,xxx.xx'}</td>
                                            <td className="py-4 text-right align-top font-bold text-slate-900">{item.total ? formatCurrency(item.total) : 'x,xxx.xx'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end p-2 border-t border-slate-700 mb-20">
                                <div className="w-64 flex justify-between items-center text-xs font-bold">
                                    <span className="uppercase tracking-widest text-slate-900">TOTAL AUD</span>
                                    <span className="text-sm font-black text-slate-950">{formatCurrency(invoice.totalAmount)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-16 text-[11px] text-slate-600 font-medium pb-80
                            ">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="font-bold text-slate-900">Due Date: {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : 'DD Feb 2026'}</p>
                                        <p>We accept payment by Bank transfer or Card.</p>
                                        <div className="pt-2">
                                            <p className="font-bold text-slate-900">Bank Details:</p>
                                            <p>Bank: {invoice.paymentInstructions?.bankName || 'Here'}</p>
                                            <p>Account name: {invoice.paymentInstructions?.accountName || invoice.companyDetails?.name || 'Name Here'}</p>
                                            <p>Account Number: {invoice.paymentInstructions?.accountNumber || 'Here'}</p>
                                            <p>BSB: {invoice.paymentInstructions?.bsb || 'Here'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 pt-4">
                                        <img src={visa} alt="Visa" className="h-6 w-auto" />
                                        <img src={mastercard} alt="Mastercard" className="h-6 w-auto" />
                                        <img src={amex} alt="Amex" className="h-6 w-auto" />
                                    </div>
                                    <p className="text-primary font-bold underline cursor-pointer">
                                        <a
                                            id="payment-link"
                                            href={`https://buy.stripe.com/9B6eVdgwWglY6fv9k94ow02?__prefilled_amount=${Math.round(invoice.totalAmount * 100)}&client_reference_id=${invoice.invoiceNumber}&prefilled_email=${encodeURIComponent(invoice.clientId?.email || invoice.customerDetails?.email || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View and pay online now
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-12 right-12">
                                <div className="border-t-2 border-dashed border-slate-900 pt-4 relative">
                                    <div className="absolute -top-3 left-0 text-xl  no-print">
                                        <Scissors className="h-5 w-5 text-slate-950" />
                                    </div>
                                    <h2 className="text-4xl font-light text-slate-800 mb-12 tracking-tight uppercase">PAYMENT ADVICE</h2>

                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="flex space-x-12 text-[11px]">
                                            <span className="font-bold mt-1 text-slate-900">To:</span>
                                            <div className="space-y-1.5 font-medium text-slate-600">
                                                <p className="font-black text-slate-950 mb-1">{(invoice.clientId?.name || invoice.customerDetails?.name) || 'Name Here'}</p>
                                                <p className="whitespace-pre-line">{(invoice.clientId?.address || invoice.customerDetails?.address) || 'Customer Address Here'}</p>
                                                <p>{(invoice.clientId?.phone || invoice.customerDetails?.phone)}</p>
                                                <p>{(invoice.clientId?.email || invoice.customerDetails?.email)}</p>
                                                <p>{(invoice.clientId?.website || invoice.customerDetails?.website)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between border-b border-slate-200 py-1.5">
                                                <span className="font-bold text-slate-500 uppercase text-[9px]">Customer</span>
                                                <span className="font-black text-slate-900 tracking-tight">{(invoice.clientId?.name || invoice.customerDetails?.name) || 'Name here'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 py-1.5">
                                                <span className="font-bold text-slate-500 uppercase text-[9px]">Invoice Number</span>
                                                <span className="font-black text-slate-900 tracking-tight">{invoice.invoiceNumber || 'INV-00001'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 py-1.5">
                                                <span className="font-bold text-slate-500 uppercase text-[9px]">Amount</span>
                                                <span className="font-black text-slate-900 tracking-tight">{formatCurrency(invoice.totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-200 py-1.5">
                                                <span className="font-bold text-slate-500 uppercase text-[9px]">Due Date</span>
                                                <span className="font-black text-slate-900 tracking-tight">{invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : 'DD Feb 2026'}</span>
                                            </div>

                                            <div className="pt-6 border-t border-slate-900 mt-6">
                                                <div className="flex justify-between items-end mb-1 px-1">
                                                    <span className="font-black text-slate-900 uppercase text-[10px]">Amount Enclosed</span>
                                                    <div className="border-b-2 border-slate-900 w-48 h-6 flex justify-end font-black text-sm">{formatCurrency(invoice.totalAmount)}</div>
                                                </div>
                                                <p className="text-[10px] text-right text-slate-400 font-medium italic mt-2">Enter the amount your are paying above</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style>{`
        /* Override oklch for html2canvas compatibility */
        .printable-content, .printable-content * {
          color: #000000 !important;
          border-color: #e2e8f0 !important;
          background-color: transparent !important;
        }
        .printable-content {
          background-color: #ffffff !important;
        }

        .printable-content .text-slate-950 { color: #020617 !important; }
        .printable-content .text-slate-900 { color: #0f172a !important; }
        .printable-content .text-slate-800 { color: #1e293b !important; }
        .printable-content .text-slate-700 { color: #334155 !important; }
        .printable-content .text-slate-600 { color: #475569 !important; }
        .printable-content .text-slate-500 { color: #64748b !important; }
        .printable-content .text-slate-400 { color: #94a3b8 !important; }
        .printable-content .text-primary { color: #f20000 !important; }
        .printable-content .border-slate-900 { border-color: #0f172a !important; }
        .printable-content .border-slate-700 { border-color: #334155 !important; }
        .printable-content .border-slate-200 { border-color: #e2e8f0 !important; }
        .printable-content .border-slate-50 { border-color: #f8fafc !important; }
        .printable-content .bg-slate-50 { background-color: #f8fafc !important; }

        @media print {
          .no-print { display: none !important; }
          .printable-content { 
            box-shadow: none !important; 
            margin: 0 !important; 
            max-width: none !important; 
            width: 100% !important;
            padding: 20px !important;
            padding-bottom: 20px !important;
            border: none !important;
            background: white !important;
            border-radius: 0 !important;
          }
          .printable-content .glass {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }
          body { background: white !important; }
        }
      `}</style>
        </Layout>
    );
};

export default InvoicePreview;
