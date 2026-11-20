import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  project_id: { type: String, ref: 'Project', required: true },
  reviewer_id: { type: String, ref: 'User', required: true },
  reviewee_id: { type: String, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true }
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

export const Review = mongoose.model('Review', reviewSchema);
