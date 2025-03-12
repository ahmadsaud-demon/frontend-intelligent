import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ChatRoom || mongoose.model('ChatRoom', chatRoomSchema);