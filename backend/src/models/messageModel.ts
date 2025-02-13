import mongoose, { Schema } from 'mongoose';
import { IMessageDocument } from '../interfaces/IChat.types';

const messageSchema = new Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  content: { type: String, trim: true },
  chat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chat' 
  },
  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const getMessageModel = (connection: mongoose.Connection) => {
  return connection.model<IMessageDocument>('Message', messageSchema);
};