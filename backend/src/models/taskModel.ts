import mongoose, { Document, Schema } from 'mongoose';
import { ITask } from '../interfaces/company/IProject.types';

export const TaskSchema = new Schema<ITask>({
  title: { type: String },
  description: { type: String },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Completed'],
    default: 'To Do',
  },
  deadline: Date,
  createdAt: { type: Date, default: Date.now },
  statusHistory: [{
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed'] },
    timestamp: { type: Date, default: Date.now },
    comment: { type: String }
  }]
});

const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;
