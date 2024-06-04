import mongoose, { Document, Schema } from "mongoose";

interface Tag extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string,
}

const TagSchema: Schema<Tag> = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  
});

const TagModel =
  (mongoose.models.Tag as mongoose.Model<Tag>) ||
  mongoose.model<Tag>("Tag", TagSchema);

export default TagModel;
