import mongoose, { Document, Schema } from "mongoose";

interface Comment extends Document {
  content: string;
  thread: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // Optional field for nested comments
  children?: mongoose.Types.ObjectId[]; // Optional field for child comments
}

const CommentSchema: Schema<Comment> = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
}, { timestamps: true });

const CommentModel =
  (mongoose.models.Comment as mongoose.Model<Comment>) ||
  mongoose.model<Comment>("Comment", CommentSchema);

export default CommentModel;