import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function DELETE(
  request: Request,
  { params }: { params: { postId: string } }
) {
  await dbConnect();

  try {
    const postId = params.postId;
    const { communityId } = await request.json();

    const thread = await ThreadModel.findById(postId);
    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Thread does not exist",
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

    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return new Response(
        JSON.stringify({ success: false, message: "Community does not exist" }),
        { status: 404 }
      );
    }

    const isAdmin = community.admin.some(
      (adminId) => adminId.toString() === ownerId.toString()
    );
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, message: "User is not an admin" }),
        { status: 403 }
      );
    }

    const deletedPost = await ThreadModel.findByIdAndDelete(postId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting post",
      }),
      { status: 500 }
    );
  }
}
