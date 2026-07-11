import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLE } from '../../shared/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      required: true,
      default: USER_ROLE.CANDIDATE,
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save, only if it changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index on role for fast platform-level count operations
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
