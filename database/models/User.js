import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: '$2a$10$wS2zXz1bX1v1x1y1z1w1ueqg4m5Y6U7I8O9P0A1S2D3F4G5H6J7K' }, // default hash for 'password123'
  role: { type: String, enum: ['student', 'client'], required: true },
  avatar: { type: String },
  headline: { type: String },
  bio: { type: String },
  college: { type: String },
  major: { type: String },
  grad_year: { type: Number },
  hourly_rate: { type: Number, default: 20 },
  availability_hours: { type: Number, default: 15 },
  resume_url: { type: String, default: null },
  resume_name: { type: String, default: null },
  rating_avg: { type: Number, default: 5.0 },
  rating_count: { type: Number, default: 0 },
  completed_projects_count: { type: Number, default: 0 },
  skills: [{
    skill_name: { type: String, required: true },
    level: { type: String, default: 'Intermediate' }
  }],
  portfolios: [{
    id: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    project_url: { type: String },
    github_url: { type: String },
    image_url: { type: String },
    tags: { type: String },
    created_at: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.password;
      return ret;
    }
  },
  toObject: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.password;
      return ret;
    }
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
