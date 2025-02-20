import mongoose, { Schema } from 'mongoose';
import { IChatDocument } from '../interfaces/IChat.types';

const chatSchema = new Schema({
  name: { type: String, trim: true },
  isGroupChat: { type: Boolean, default: false },
  users: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee'
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const getChatModel = (connection: mongoose.Connection) => {
  return connection.model<IChatDocument>('Chat', chatSchema);
};


