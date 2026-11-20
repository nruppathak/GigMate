import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  project_id: { type: String, ref: 'Project', default: null },
  sender_id: { type: String, ref: 'User', required: true },
  receiver_id: { type: String, ref: 'User', required: true },
  message: { type: String, required: true },
  attachment_url: { type: String, default: null },
  attachment_name: { type: String, default: null },
  read: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      ret.created_at = ret.createdAt;
      return ret;
    }
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      ret.created_at = ret.createdAt;
      return ret;
    }
  }
});

export const Message = mongoose.model('Message', messageSchema);
