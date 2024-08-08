import mongoose, { Document, Schema } from "mongoose";

interface Like extends Document {
  likeBy: mongoose.Types.ObjectId;
  thread: mongoose.Types.ObjectId;
  comment: mongoose.Types.ObjectId;
}

const LikeSchema: Schema<Like> = new mongoose.Schema({
  likeBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  },
}, {timestamps: true});

const LikeModel =
  (mongoose.models.Like as mongoose.Model<Like>) ||
  mongoose.model<Like>("Like", LikeSchema);

export default LikeModel;
