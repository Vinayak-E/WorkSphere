import mongoose, { Schema } from 'mongoose';
import { IMessageDocument } from '../interfaces/IChat.types';

const messageSchema = new Schema(
  {
    sender: {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'sender.senderModel',
      },
      senderModel: {
        type: String,
        required: true,
        enum: ['Employee', 'Company'],
      },
    },
    content: { type: String, trim: true },
    mediaUrl: { type: String, default: null },
    type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const getMessageModel = (connection: mongoose.Connection) => {
  return connection.model<IMessageDocument>('Message', messageSchema);
};
