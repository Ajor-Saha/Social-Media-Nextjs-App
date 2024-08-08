import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import ThreadModel from "@/model/Thread";
import LikeModel from "@/model/Like";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import CommunityModel from "@/model/Community";
import NotificationModel from "@/model/Notification";

export async function POST(
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
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const communityId = url.searchParams.get("communityId");

    if (communityId) {
      const community = await CommunityModel.findById(communityId);

      if (!community) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Community does not exist",
          }),
          { status: 404 }
        );
      }

      if (!community.members.includes(userId)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User is not a member of this community",
          }),
          { status: 403 }
        );
      }
    }

    // Check if thread exists
    const thread = await ThreadModel.findById({ _id: threadId });
    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Thread does not exist",
        }),
        { status: 404 }
      );
    }

    // Check if the user already liked the thread
    const existingLike = await LikeModel.findOne({
      likeBy: userId,
      thread: threadId,
    });
    if (existingLike) {
      // Delete the existing like
      await LikeModel.deleteOne({ _id: existingLike._id });
      thread.likes -= 1; 

      return new Response(
        JSON.stringify({
          success: true,
          message: "Like removed successfully",
        }),
        { status: 200 }
      );
    } else {
      thread.likes += 1;
    }

    // Create a new like
    const newLike = new LikeModel({
      likeBy: userId,
      thread: threadId,
    });

    
    await thread.save();
    await newLike.save();

    if (!existingLike) {
      const notification = await NotificationModel.create({
        name: `${user.username} liked your post`,
        ownerId: thread.ownerId,
        threadId: thread._id,
        userId: user._id
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thread liked successfully",
        like: newLike,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error liking thread:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error liking thread",
      }),
      { status: 500 }
    );
  }
}




export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  await dbConnect();

  try {
    const threadId = params.threadId;

    // Check if thread exists
    const thread = await ThreadModel.findById({ _id: threadId });
    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Thread does not exist",
        }),
        { status: 404 }
      );
    }

    // Get the total like count for the thread
    const likeCount = await LikeModel.countDocuments({ thread: threadId });

    return new Response(
      JSON.stringify({
        success: true,
        likeCount,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting like count:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error getting like count",
      }),
      { status: 500 }
    );
  }
}
