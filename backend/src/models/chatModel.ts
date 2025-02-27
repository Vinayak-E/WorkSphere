import mongoose, { Schema } from 'mongoose';
import { IChatDocument } from '../interfaces/IChat.types';

const chatSchema = new Schema({
  name: { type: String, trim: true },
  isGroupChat: { type: Boolean, default: false },
  users: [{ 
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'users.userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['Employee', 'Company']
    }
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupAdmin: {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'groupAdmin.adminModel'
    },
    adminModel: {
      type: String,
      enum: ['Employee', 'Company'] 
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const getChatModel = (connection: mongoose.Connection) => {
  return connection.model<IChatDocument>('Chat', chatSchema);
};


