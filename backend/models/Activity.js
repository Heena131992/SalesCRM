import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    client: { type: String, required: true },
    outcome: { type: String, required: true },
    callsCount: { type: Number, default: 0 },
    followUpDate: { type: String },
    status: { type: String, default: 'On Track' },
  },
  { timestamps: true }
);

export default mongoose.model('Activity', activitySchema);