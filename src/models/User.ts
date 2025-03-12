import mongoose, { Model } from 'mongoose';

// Define the interface for a User document
interface IUser {
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'school_admin';
  created_at: Date;
}

// Create the schema
const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'school_admin'],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the model
const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);
export default User;