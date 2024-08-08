import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import NotificationModel from "@/model/Notification";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  await dbConnect();

  try {
    const threadId = params.threadId;
    const { content } = await request.json();

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
    if (!user || !user.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Check if thread exists
    const thread = await ThreadModel.findById(threadId);
    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Thread does not exist",
        }),
        { status: 404 }
      );
    }

    // Create new comment
    const comment = new CommentModel({
      content,
      thread: threadId,
      owner: userId,
    });

    await comment.save();

    // Update thread's comment count
    thread.comments += 1;
    await thread.save();

    const notification = NotificationModel.create({
      name: `${user.username} Commented on your post`,
      ownerId: thread.ownerId,
      threadId: thread._id,
      userId: user._id
    })



    return new Response(
      JSON.stringify({
        success: true,
        message: "Comment added successfully",
        data: comment,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error adding comment",
      }),
      { status: 500 }
    );
  }
}
