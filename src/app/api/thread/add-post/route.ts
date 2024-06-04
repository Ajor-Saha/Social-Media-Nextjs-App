import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import { threadSchema } from "@/schemas/threadSchema";
import UserModel from "@/model/User";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import ThreadModel from "@/model/Thread";
import TagModel from "@/model/Tag";
import { UploadApiResponse } from "cloudinary";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const description = formData.get("description") as string;
    const files = formData.getAll("images") as File[];
    const tag = formData.get("tag") as string;

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const ownerId = new mongoose.Types.ObjectId(_user._id);

    // Check if user exists and is verified
    const user = await UserModel.findById({ _id: ownerId });
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Process and create tag
    let tagDocument = await TagModel.findOne({ name: tag });
    if (!tagDocument) {
      tagDocument = new TagModel({ name: tag, ownerId });
      await tagDocument.save();
    }
    const tagId = tagDocument._id as mongoose.Types.ObjectId;

    // Upload images to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const fileBuffer = await file.arrayBuffer();
      const mimeType = file.type;
      const encoding = "base64";
      const base64Data = Buffer.from(fileBuffer).toString("base64");
      const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

      return await uploadToCloudinary(fileUri, file.name);
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls = uploadResults
      .filter((res): res is { success: true; result: UploadApiResponse } => res.success)
      .map((res) => res.result.secure_url);

    // Create new thread
    const newThread = new ThreadModel({
      ownerId,
      description,
      images: imageUrls,
      tag: tagId,
      isPublished: true,
    });

    await newThread.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thread created successfully",
        thread: newThread,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating thread:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating thread",
      }),
      { status: 500 }
    );
  }
}
