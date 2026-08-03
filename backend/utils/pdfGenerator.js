import puppeteer from 'puppeteer';
import { format } from 'date-fns';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to encode file image to base64
const base64Encode = (file) => {
    try {
        if (fs.existsSync(file)) {
            const bitmap = fs.readFileSync(file);
            return Buffer.from(bitmap).toString('base64');
        }
        return null;
    } catch (e) {
        console.error('Error loading image:', file, e);
        return null;
    }
};

export const generatePdf = async (html) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
        format: 'A4',
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
        printBackground: true,
        scale: 0.8
    });
    await browser.close();
    return pdf;
};

export const getInvoiceHtml = (invoice) => {
    const {
        invoiceNumber, invoiceDate, dueDate, reference,
        companyDetails, customerDetails, items, totalAmount, paymentInstructions, status
    } = invoice;

    const formatDate = (dateStr) => dateStr ? format(new Date(dateStr), 'dd MMM yyyy') : 'N/A';
    const formatCur = (amount) => amount.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });

    const cName = companyDetails?.name || 'iTEK Solutions PVT LTD';
    const cAddress = companyDetails?.address || '130,\nUniversity Drive,\nCallaghan';
    const cPhone = companyDetails?.phone || '(04) 5066 2270';
    const cEmail = companyDetails?.email || 'e-mail here';
    const cWebsite = companyDetails?.website || 'web site here';

    // Paths to assets - now using backend local assets for Vercel compatibility
    const logoPath = path.resolve(__dirname, '../assets/logo/iteks.png');
    const visaPath = path.resolve(__dirname, '../assets/icons/visa.svg');
    const mcPath = path.resolve(__dirname, '../assets/icons/mastercard.svg');
    const amexPath = path.resolve(__dirname, '../assets/icons/american-express.svg');

    const logoBase64 = base64Encode(logoPath);
    const visaBase64 = base64Encode(visaPath);
    const mcBase64 = base64Encode(mcPath);
    const amexBase64 = base64Encode(amexPath);

    const logoSrc = logoBase64 ? `data:image/png;base64,${logoBase64}` : '';
    const visaSrc = visaBase64 ? `data:image/svg+xml;base64,${visaBase64}` : '';
    const mcSrc = mcBase64 ? `data:image/svg+xml;base64,${mcBase64}` : '';
    const amexSrc = amexBase64 ? `data:image/svg+xml;base64,${amexBase64}` : '';

    // Scissors SVG
    const scissorsSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#020617" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/>
  </svg>
  `;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            color: #000; 
            line-height: 1.5; 
            padding: 0; 
            margin: 0; 
            -webkit-print-color-adjust: exact; 
        }
        .page { 
            padding: 48px; 
            padding-bottom: 384px; /* Space for payment slip */
            position: relative; 
            min-height: 1250px; 
            background: white; 
            overflow: hidden; 
        }

        /* Utility Colors */
        .text-slate-950 { color: #020617; }
        .text-slate-900 { color: #0f172a; }
        .text-slate-800 { color: #1e293b; }
        .text-slate-700 { color: #334155; }
        .text-slate-600 { color: #475569; }
        .text-slate-500 { color: #64748b; }
        .text-slate-400 { color: #94a3b8; }
        .text-primary { color: #f20000; }
        .border-slate-900 { border-color: #0f172a; }
        .border-slate-700 { border-color: #334155; }
        .border-slate-200 { border-color: #e2e8f0; }
        .border-slate-50 { border-color: #f8fafc; }

        /* Helpers */
        .font-light { font-weight: 300; }
        .font-normal { font-weight: 400; }
        .font-medium { font-weight: 500; }
        .font-bold { font-weight: 700; }
        .font-black { font-weight: 900; }
        .uppercase { text-transform: uppercase; }
        .tracking-tight { letter-spacing: -0.025em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .text-xs { font-size: 12px; }
        .text-sm { font-size: 14px; }
        .text-base { font-size: 16px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-end { justify-content: flex-end; }
        .space-y-1 > * + * { margin-top: 4px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .space-y-4 > * + * { margin-top: 16px; }
        
        /* Layout */
        .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 64px; }
        
        /* Invoice Title Section */
        .invoice-title { font-size: 48px; line-height: 1; color: black; margin-bottom: 48px; }
        .bill-to { padding-left: 128px; }

        /* Meta Section */
        .logo-img { height: 64px; width: auto; }
        .meta-container { display: flex; justify-content: flex-end; gap: 48px; margin-top: 32px; }
        .meta-labels { text-align: left; font-size: 10px; display: flex; flex-direction: column; gap: 16px; }
        .meta-values { text-align: left; font-size: 11px; color: #475569; font-weight: 500; line-height: 1.6; }

        /* Table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { 
            text-align: left; 
            padding: 8px 0; 
            font-size: 12px; 
            font-weight: 700; 
            color: #0f172a; 
            border-bottom: 1px solid black; 
        }
        td { 
            padding: 16px 0; 
            font-size: 11px; 
            color: #334155; 
            border-bottom: 1px solid #f8fafc; 
            vertical-align: top;
        }
        tr:last-child td { border-bottom: none; }
        .td-amount { font-weight: 700; color: #0f172a; }

        /* Totals */
        .totals-section { 
            display: flex; 
            justify-content: flex-end; 
            padding: 8px; 
            border-top: 1px solid #334155; 
            margin-bottom: 48px; 
        }
        .total-box { width: 256px; display: flex; justify-content: space-between; align-items: center; }
        .total-label { font-size: 12px; font-weight: 700; color: #0f172a; }
        .total-value { font-size: 14px; font-weight: 900; color: #020617; }

        /* Bottom Grid */
        .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding-bottom: 96px; }
        .payment-info { font-size: 11px; color: #475569; font-weight: 500; }
        .methods { display: flex; gap: 16px; margin-top: 16px; align-items: center; }
        .method-icon { height: 24px; width: auto; }
        
        /* Payment Advice Slip */
        .advice-slip { 
            position: absolute; 
            bottom: 40px; 
            left: 48px; 
            right: 48px; 
        }
        .dashed-line { 
            border-top: 2px dashed #0f172a; 
            padding-top: 16px; 
            position: relative; 
        }
        .scissors-icon { 
            position: absolute; 
            top: -10px; 
            left: 0; 
            background: white; 
            padding-right: 4px;
        }
        .slip-title { font-size: 36px; font-weight: 300; color: #1e293b; margin-bottom: 48px; }
        
        .slip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }
        .slip-to { display: flex; gap: 48px; font-size: 11px; }
        .slip-details { font-size: 12px; display: flex; flex-direction: column; gap: 4px; }
        
        .slip-row { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 1px solid #e2e8f0; 
            padding: 6px 0; 
        }
        .slip-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .slip-value { font-size: 11px; font-weight: 900; color: #0f172a; letter-spacing: -0.025em; }
        
        .amount-enclosed { margin-top: 24px; border-top: 1px solid #0f172a; padding-top: 24px; }
        .amount-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px; }
        .amount-input { border-bottom: 2px solid #0f172a; width: 192px; height: 24px; }
        .amount-hint { font-size: 10px; color: #94a3b8; font-style: italic; text-align: right; font-weight: 500; }

      </style>
    </head>
    <body>
      <div class="page">
        <!-- Main Layout Grid -->
        <div class="header-grid">
            <!-- Top Left -->
            <div>
                <h1 class="invoice-title font-light tracking-tight">INVOICE</h1>
                <div class="bill-to space-y-1">
                    <p class="font-bold text-sm text-slate-700">${customerDetails?.name || 'Name Here'}</p>
                    <p class="text-xs text-slate-500" style="white-space: pre-line; max-width: 300px; line-height: 1.5;">${customerDetails?.address || 'Company Address Here'}</p>
                </div>
            </div>

            <!-- Top Right -->
            <div class="text-right">
                <div class="flex justify-end mb-8">
                    ${logoSrc ? `<img src="${logoSrc}" class="logo-img" />` : ''}
                </div>

                <div class="meta-container">
                    <!-- Meta Labels -->
                    <div class="meta-labels">
                        <div>
                            <p class="font-bold text-slate-800">Invoice Date</p>
                            <p class="text-slate-500">${formatDate(invoiceDate)}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-800">Invoice Number</p>
                            <p class="text-slate-500">${invoiceNumber}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-800">Reference</p>
                            <p class="text-slate-500">${reference || 'PT'}</p>
                        </div>
                        <div>
                            <p class="font-bold text-slate-800">ABN</p>
                            <p class="text-slate-500">${companyDetails?.abn || '96 678 973 085'}</p>
                        </div>
                    </div>

                    <!-- Company Details -->
                    <div class="meta-values">
                        <p class="font-bold text-slate-900">${cName}</p>
                        <p style="white-space: pre-line;">${cAddress}</p>
                        <p>${cPhone}</p>
                        <p>${cEmail}</p>
                        <p>${cWebsite}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Table -->
        <table>
            <thead>
                <tr>
                    <th class="uppercase tracking-wider">Description</th>
                    <th class="text-center uppercase tracking-wider">Quantity</th>
                    <th class="text-right uppercase tracking-wider">Unit Price</th>
                    <th class="text-right uppercase tracking-wider">Amount AUD</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td class="td-desc">${item.description || 'Item here'}</td>
                        <td class="text-center">${item.quantity || 'xxx.x'}</td>
                        <td class="text-right">${formatCur(item.unitPrice || 0)}</td>
                        <td class="text-right td-amount">${formatCur(item.total || 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <div class="total-box">
                <span class="total-label uppercase tracking-widest">TOTAL AUD</span>
                <span class="total-value">${formatCur(totalAmount)}</span>
            </div>
        </div>

        <!-- Bottom Payment Grid -->
        <div class="bottom-grid">
            <div class="payment-info space-y-2">
                <p class="font-bold text-slate-900 text-xs">Due Date: ${formatDate(dueDate)}</p>
                <p>We accept payment by bank transfer or card.</p>
                <div style="padding-top: 8px;">
                    <p class="font-bold text-slate-900">Bank Details:</p>
                    <p>Account name: ${cName}</p>
                    <p>Account Number: ${paymentInstructions?.accountNumber || 'Here'}</p>
                    <p>BSB: ${paymentInstructions?.bsb || 'Here'}</p>
                </div>
                <p class="italic text-slate-500" style="padding-top: 16px;">Please quote your invoice number as reference.</div>
            
                <div class="methods">
                    ${visaSrc ? `<img src="${visaSrc}" class="method-icon" />` : ''}
                    ${mcSrc ? `<img src="${mcSrc}" class="method-icon" />` : ''}
                    ${amexSrc ? `<img src="${amexSrc}" class="method-icon" />` : ''}
                </div>
                <p class="text-primary font-bold underline cursor-pointer" style="margin-top: 16px;">View and pay online now</p>
            </div>
        </div>

        <!-- Payment Advice Slip -->
        <div class="advice-slip">
            <div class="dashed-line">
                <div class="scissors-icon">${scissorsSvg}</div>
                <h2 class="slip-title uppercase tracking-tight">PAYMENT ADVICE</h2>

                <div class="slip-grid">
                    <div class="slip-to">
                        <span class="font-bold text-slate-900" style="margin-top: 4px;">To:</span>
                        <div class="meta-values">
                            <p class="font-black text-slate-950">${customerDetails?.name || 'Name Here'}</p>
                            <p style="white-space: pre-line;">${cAddress}</p>
                            <p>${cPhone}</p>
                            <p>${cEmail}</p>
                            <p>${cWebsite}</p>
                        </div>
                    </div>

                    <div class="slip-details">
                        <div class="slip-row">
                            <span class="slip-label">Customer</span>
                            <span class="slip-value">${customerDetails?.name || 'Name here'}</span>
                        </div>
                        <div class="slip-row">
                            <span class="slip-label">Invoice Number</span>
                            <span class="slip-value">${invoiceNumber}</span>
                        </div>
                        <div class="slip-row">
                            <span class="slip-label">Amount</span>
                            <span class="slip-value">${formatCur(totalAmount)}</span>
                        </div>
                        <div class="slip-row" style="border-bottom: none;">
                            <span class="slip-label">Due Date</span>
                            <span class="slip-value">${formatDate(dueDate)}</span>
                        </div>

                        <div class="amount-enclosed">
                            <div class="amount-row">
                                <span class="uppercase tracking-wider font-black text-slate-900" style="font-size: 10px;">Amount Enclosed</span>
                                <div class="amount-input"></div>
                            </div>
                            <p class="amount-hint">Enter the amount your are paying above</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </body>
    </html>
  `;
};
