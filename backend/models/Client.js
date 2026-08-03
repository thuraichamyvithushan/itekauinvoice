import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    }
}, { timestamps: true });

clientSchema.index({ userId: 1, name: 1 }, { unique: true });

const Client = mongoose.model('Client', clientSchema);
export default Client;
