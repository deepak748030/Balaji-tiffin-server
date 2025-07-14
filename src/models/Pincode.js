import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const Pincode = mongoose.models.Pincode || mongoose.model('Pincode', pincodeSchema);
export default Pincode;
