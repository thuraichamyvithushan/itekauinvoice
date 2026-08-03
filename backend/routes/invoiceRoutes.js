import express from 'express';
import {
    createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice, downloadInvoicePdf, deleteAllInvoices
} from '../controllers/invoiceController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/:id/download', downloadInvoicePdf);
router.post('/', createInvoice);
router.get('/', getInvoices);
router.delete('/delete/all', deleteAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
