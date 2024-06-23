import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import dbConnect from "@/lib/dbConnect";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";


export async function PUT(
    request: Request,
    { params }: { params: { threadId: string } }
  ) {
    await dbConnect();
  
    try {
      const threadId = params.threadId;
  
      const session = await getServerSession(authOptions);
      const _user: User = session?.user;
  
      if (!session || !_user) {
        return new Response(
          JSON.stringify({ success: false, message: "Not authenticated" }),
          { status: 401 }
        );
      }
  
      const userId = new mongoose.Types.ObjectId(_user._id);
  
      // Check if user exists and is verified
      const user = await UserModel.findById({ _id: userId });
      if (!user || !user.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User does not exist or is not verified",
          }),
          { status: 400 }
        );
      }
  
      const thread = await ThreadModel.findById({ _id: threadId });
  
      if (!thread || thread.ownerId.toString() !== userId.toString()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Post not found or not authorized",
          }),
          { status: 400 }
        );
      }
  
      const formData = await request.formData();
      const file = formData.get("image") as File;
      const imageUrlToReplace = formData.get("imageUrlToReplace") as string; // Get the URL of the image to be replaced
  
      if (!file || !imageUrlToReplace) {
        return new Response(
          JSON.stringify({ success: false, message: "No file or image URL provided" }),
          { status: 400 }
        );
      }
  
      // Upload image to Cloudinary
      const fileBuffer = await file.arrayBuffer();
      const mimeType = file.type;
      const encoding = "base64";
      const base64Data = Buffer.from(fileBuffer).toString("base64");
      const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;
  
      const uploadResult = await uploadToCloudinary(fileUri, file.name);
      if (!uploadResult.success) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Error uploading image",
          }),
          { status: 500 }
        );
      }
  
      const newImageUrl = uploadResult.result?.secure_url;
  
      // Update the specific image URL in the thread.images array
      const updatedImages = (thread.images as string[]).map((img: string) =>
        img === imageUrlToReplace ? newImageUrl : img
      );
  
      // Update the thread with the new images array
      thread.images = updatedImages as string[];
      await thread.save();
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Post updated successfully",
          data: thread,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating post:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error updating post",
        }),
        { status: 500 }
      );
    }
  }