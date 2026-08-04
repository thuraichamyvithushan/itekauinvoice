import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { connectDB, handleOptions, parseJsonBody, requireAuthUser, setCorsHeaders } from './_lib/authHelpers.js';

function getInvoiceSubpath(req) {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  return pathname.replace(/^\/api\/invoices\/?/, '').replace(/\/$/, '');
}

export default async function handler(req, res) {
  const applyCors = setCorsHeaders(res);
  applyCors(req.headers.origin);

  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    await connectDB();
    const user = await requireAuthUser(req);
    const subpath = getInvoiceSubpath(req);

    if (!subpath) {
      if (req.method === 'GET') {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const search = url.searchParams.get('search');
        const query = { userId: user._id };

        if (search) {
          query.$or = [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { 'customerDetails.name': { $regex: search, $options: 'i' } }
          ];
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 }).populate('clientId');
        return res.status(200).json(invoices);
      }

      if (req.method === 'POST') {
        const {
          invoiceNumber, invoiceDate, dueDate, reference,
          customerDetails, items, companyDetails, paymentInstructions
        } = await parseJsonBody(req);

        const subtotal = items.reduce((acc, item) => acc + item.total, 0);
        const totalAmount = subtotal;

        let client = await Client.findOne({ userId: user._id, name: customerDetails.name });

        if (!client) {
          client = new Client({
            ...customerDetails,
            userId: user._id
          });
          await client.save();
        } else {
          Object.assign(client, customerDetails);
          await client.save();
        }

        const invoice = new Invoice({
          userId: user._id,
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
        return res.status(201).json(invoice);
      }

      return res.status(405).json({ message: 'Method not allowed' });
    }

    if (subpath === 'delete/all') {
      if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      await Invoice.deleteMany({ userId: user._id });
      return res.status(200).json({ message: 'All invoices deleted successfully' });
    }

    const downloadMatch = subpath.match(/^([^/]+)\/download$/);
    if (downloadMatch) {
      if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
      }

      const invoice = await Invoice.findOne({ _id: downloadMatch[1], userId: user._id }).populate('clientId');
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const { generatePdf, getInvoiceHtml } = await import('../utils/pdfGenerator.js');
      const html = getInvoiceHtml(invoice);
      const pdf = await generatePdf(html);

      res.setHeader('Content-Type', 'application/pdf');
      return res.status(200).send(pdf);
    }

    const invoiceId = subpath;

    if (req.method === 'GET') {
      const invoice = await Invoice.findOne({ _id: invoiceId, userId: user._id }).populate('clientId');
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      return res.status(200).json(invoice);
    }

    if (req.method === 'PUT') {
      const {
        invoiceNumber, invoiceDate, dueDate, reference,
        customerDetails, items, companyDetails, paymentInstructions, status
      } = await parseJsonBody(req);

      const subtotal = items.reduce((acc, item) => acc + item.total, 0);
      const totalAmount = subtotal;

      let client = await Client.findOne({ userId: user._id, name: customerDetails.name });
      if (!client) {
        client = new Client({ ...customerDetails, userId: user._id });
        await client.save();
      } else {
        Object.assign(client, customerDetails);
        await client.save();
      }

      const invoice = await Invoice.findOneAndUpdate(
        { _id: invoiceId, userId: user._id },
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

      return res.status(200).json(invoice);
    }

    if (req.method === 'DELETE') {
      const invoice = await Invoice.findOneAndDelete({ _id: invoiceId, userId: user._id });
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      return res.status(200).json({ message: 'Invoice deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    const status = error.message === 'No token provided' || error.message === 'User not found' ? 401 : 500;
    return res.status(status).json({ message: status === 401 ? 'Please authenticate.' : error.message });
  }
}
