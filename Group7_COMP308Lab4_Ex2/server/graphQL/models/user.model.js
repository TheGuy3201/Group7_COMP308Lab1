import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, desc: "Unique username for each user" },
  email: { type: String, required: true, unique: true, desc: "Users email address" },
  password: { type: String, required: true, desc: "User password stored securely (hashed)." },
  role: { type: String, required: true, enum: ['player', 'admin'], default: 'player', desc: "Defines user permissions. Allowed values: 'player', 'admin'" },
  createdAt: { type: Date, default: Date.now, desc: "Timestamp for when the user was created" },
});

// Virtual getter for userId that returns _id as a string
userSchema.virtual('userId').get(function() {
  return this._id.toString();
});

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified or new
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);