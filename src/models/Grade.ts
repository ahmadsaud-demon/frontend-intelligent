import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  enrollment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
  },
  grade: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  comment: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Grade || mongoose.model('Grade', gradeSchema);