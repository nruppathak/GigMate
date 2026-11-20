import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  project_id: { type: String, ref: 'Project', required: true },
  student_id: { type: String, ref: 'User', required: true },
  cover_letter: { type: String, required: true },
  bid_amount: { type: Number, required: true },
  delivery_timeline: { type: String, required: true },
  attachment_url: { type: String, default: null },
  attachment_name: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['pending', 'applied', 'under_review', 'shortlisted', 'accepted', 'rejected', 'declined', 'withdrawn', 'completed'], 
    default: 'pending' 
  },
  withdrawn_at: { type: Date, default: null },
  reviewed_at: { type: Date, default: null }
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

export const Application = mongoose.model('Application', applicationSchema);
