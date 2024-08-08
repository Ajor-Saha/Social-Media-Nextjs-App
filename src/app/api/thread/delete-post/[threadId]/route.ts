import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import CommunityModel from "@/model/Community";
import LikeModel from "@/model/Like";
import NotificationModel from "@/model/Notification";
import SavedModel from "@/model/Saved";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function DELETE(
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
      const user = await UserModel.findById(userId);
      if (!user?.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User does not exist or is not verified",
          }),
          { status: 400 }
        );
      }
  
      // Check if thread exists and user is the owner
      const thread = await ThreadModel.findById(threadId);
      if (!thread) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Thread not found",
          }),
          { status: 404 }
        );
      }
  
      if (thread.ownerId.toString() !== userId.toString()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User is not the owner of the thread",
          }),
          { status: 403 }
        );
      }


    const liked = await LikeModel.deleteMany({ thread: threadId });

    const commented = await CommentModel.deleteMany({ thread: threadId });
    
    const notification = await NotificationModel.deleteMany({ threadId });
    

    await CommunityModel.updateMany(
      { threads: threadId },
      { $pull: { threads: threadId }}
    )
    
    // Finally, delete the thread
    await ThreadModel.deleteOne({ _id: thread });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thread deleted successfully",
      }),
      { status: 200 }
    );
    } catch (error) {
      console.error("Error deleting thread:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error deleting thread",
        }),
        { status: 500 }
      );
    }
  }