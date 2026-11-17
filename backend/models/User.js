import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
    designation: { type: String, default: 'Account Executive' },
    territory: { type: String, default: 'North India' },
    quota: { type: Number, default: 500000 },
    status: { type: String, default: 'Offline' }, // 'Checked In' | 'Offline' | 'Online'
    workMode: { type: String, default: 'Offline' }, // 'Client Field Visit' | 'Office' | 'Remote'
    checkInTime: { type: Number, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);