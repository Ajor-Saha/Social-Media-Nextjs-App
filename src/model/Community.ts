import mongoose, { Document, Schema } from "mongoose";

interface Community extends Document {
  name: string;
  description: string;
  threads: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId[];
  coverImage: string;
  about: string;
}


const CommunitySchema: Schema<Community> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    threads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    coverImage: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
  },
  { timestamps: true }
);

const CommunityModel =
  (mongoose.models.Community as mongoose.Model<Community>) ||
  mongoose.model<Community>("Community", CommunitySchema);

export default CommunityModel;
