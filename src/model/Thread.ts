import mongoose, { Document, Schema } from "mongoose";

export interface Thread extends Document {
  ownerId: mongoose.Types.ObjectId;
  description: string;
  images: string[];
  videos: string[];
  tag: mongoose.Types.ObjectId;
  isPublished: boolean;
  likes: number;
  comments: number;
}

const ThreadSchema: Schema<Thread> = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  videos: [
    {
      type: String,
    },
  ],
  tag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  
  isPublished: {
    type: Boolean,
    default: true,
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  }
}, {timestamps: true});

const ThreadModel =
  (mongoose.models.Thread as mongoose.Model<Thread>) ||
  mongoose.model<Thread>("Thread", ThreadSchema);

export default ThreadModel;
