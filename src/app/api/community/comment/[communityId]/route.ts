import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import CommunityModel from "@/model/Community";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function POST(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  await dbConnect();

  try {
    const communityId = params.communityId;
    const { threadId, comment } = await request.json();

    const community = await CommunityModel.findById({ _id: communityId });
    if (!community) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Community does not exist",
        }),
        { status: 404 }
      );
    }

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

    const isMember = community.members.includes(ownerId);
    const isAdmin = community.admin.includes(ownerId);

    if (!isMember && !isAdmin) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User is not a member or admin of the community",
        }),
        { status: 403 }
      );
    }

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

    thread.comments += 1;

    await thread.save();

    const newComment = await CommentModel.create({
      content: comment,
      thread: thread._id,
      owner: user._id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Comment added successfully",
      }),
      { status: 200 }
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
