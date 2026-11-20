import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  client_id: { type: String, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget_type: { type: String, enum: ['fixed', 'hourly'], required: true },
  budget_amount: { type: Number, required: true },
  duration: { type: String, required: true },
  experience_level: { type: String, default: 'Entry / Student-friendly' },
  perks: { type: String },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'closed'], default: 'open' },
  skills: [{ type: String }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      return ret;
    }
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      return ret;
    }
  }
});

export const Project = mongoose.model('Project', projectSchema);
