import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['add', 'deduct'],
        required: true
    },
    message: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;
