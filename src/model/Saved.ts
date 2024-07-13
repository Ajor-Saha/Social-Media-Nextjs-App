import mongoose, { Document, Schema } from "mongoose";

interface Saved extends Document {
  ownerId: mongoose.Types.ObjectId;
  saved: mongoose.Types.ObjectId[];
  liked: mongoose.Types.ObjectId[];
}

const SavedSchema: Schema<Saved> = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    saved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
    liked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
  },
  { timestamps: true }
);

const SavedModel =
  (mongoose.models.Saved as mongoose.Model<Saved>) ||
  mongoose.model<Saved>("Saved", SavedSchema);

export default SavedModel;
