import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    client: { type: String, required: true },
    amount: { type: Number, required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);