import mongoose, { Document, Schema } from "mongoose";

interface Notification extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  ownerId: mongoose.Types.ObjectId;
  threadId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
}

const NotificationSchema: Schema<Notification> = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
}, {timestamps: true});

const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<Notification>) ||
  mongoose.model<Notification>("Notification", NotificationSchema);

export default NotificationModel;
