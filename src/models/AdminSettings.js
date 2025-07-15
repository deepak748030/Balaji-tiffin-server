import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema({
    rotiPrice: {
        type: Number,
        required: true,
        default: 5 // ✅ Default cost per roti, admin can update later
    }
}, { timestamps: true });

const AdminSettings = mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema);
export default AdminSettings;
