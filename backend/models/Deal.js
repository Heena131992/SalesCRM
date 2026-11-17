import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: String, required: true },
    contactPerson: { type: String, default: '' },
    category: { type: String, required: true },
    value: { type: Number, required: true },
    stage: {
      type: String,
      enum: ['New Lead', 'Demo / Meeting', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'New Lead',
    },
    closeDate: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Deal', dealSchema);