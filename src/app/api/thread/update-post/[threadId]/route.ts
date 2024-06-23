import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
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
      const user = await UserModel.findById({ _id:userId });
      if (!user || !user.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User does not exist or is not verified",
          }),
          { status: 400 }
        );
      }
  
      const thread = await ThreadModel.findById({ _id:threadId });

      
      
  
      if (!thread || thread.ownerId.toString() !== userId.toString()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Post not found or not authorized",
          }),
          { status: 400 }
        );
      }
  
      // Extract tag and description from request body
      const { tag, description } = await request.json();
  
      // Update thread based on provided fields
      let updateFields: { [key: string]: any } = {};
      if (tag) {
        const existedTag = await TagModel.findOne({ name:tag });
        if (!existedTag) {
            const newTag = await TagModel.create({
                name: tag,
                ownerId: userId
            })
            updateFields.tag = newTag._id;
        }
        else {
            updateFields.tag = existedTag._id;
        }
      }

      if (description) updateFields.description = description;
  
      const updatedThread = await ThreadModel.findByIdAndUpdate(
        threadId,
        { $set: updateFields },
        { new: true }
      );
  
      if (!updatedThread) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Failed to update post",
          }),
          { status: 500 }
        );
      }
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Post updated successfully",
          data: updatedThread,
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