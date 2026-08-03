import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { generatePdf, getInvoiceHtml } from '../utils/pdfGenerator.js';

export const downloadInvoicePdf = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).populate('clientId');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const html = getInvoiceHtml(invoice);
        const pdf = await generatePdf(html);

        res.contentType("application/pdf");
        res.send(pdf);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInvoice = async (req, res) => {
    try {
        const {
            invoiceNumber, invoiceDate, dueDate, reference,
            customerDetails, items, companyDetails, paymentInstructions
        } = req.body;

        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        const totalAmount = subtotal;

        let client = await Client.findOne({ userId: req.user._id, name: customerDetails.name });

        if (!client) {
            client = new Client({
                ...customerDetails,
                userId: req.user._id
            });
            await client.save();
        } else {
            Object.assign(client, customerDetails);
            await client.save();
        }

        const invoice = new Invoice({
            userId: req.user._id,
            clientId: client._id,
            invoiceNumber,
            invoiceDate,
            dueDate,
            reference,
            companyDetails,
            customerDetails,
            items,
            subtotal,
            totalAmount,
            paymentInstructions
        });

        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoices = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { userId: req.user._id };

        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { 'customerDetails.name': { $regex: search, $options: 'i' } }
            ];
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 }).populate('clientId');
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).populate('clientId');
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const {
            invoiceNumber, invoiceDate, dueDate, reference,
            customerDetails, items, companyDetails, paymentInstructions, status
        } = req.body;

        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        const totalAmount = subtotal;

        let client = await Client.findOne({ userId: req.user._id, name: customerDetails.name });
        if (!client) {
            client = new Client({ ...customerDetails, userId: req.user._id });
            await client.save();
        } else {
            Object.assign(client, customerDetails);
            await client.save();
        }

        const invoice = await Invoice.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            {
                clientId: client._id,
                invoiceNumber, invoiceDate, dueDate, reference,
                customerDetails, items, companyDetails, paymentInstructions,
                subtotal, totalAmount, status
            },
            { new: true }
        ).populate('clientId');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAllInvoices = async (req, res) => {
    try {
        await Invoice.deleteMany({ userId: req.user._id });
        res.json({ message: 'All invoices deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
