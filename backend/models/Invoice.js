import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 }
});

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    reference: String,
    companyDetails: {
        name: String,
        address: String,
        phone: String,
        email: String,
        website: String,
        abn: String
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    customerDetails: {
        name: String,
        address: String,
        email: String,
        phone: String,
        website: String
    },
    items: [invoiceItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'AUD'
    },
    paymentInstructions: {
        bankName: String,
        accountNumber: String,
        bsb: String
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Overdue'],
        default: 'Draft'
    }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
