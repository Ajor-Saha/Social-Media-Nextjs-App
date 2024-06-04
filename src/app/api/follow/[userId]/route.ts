import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const followId = new mongoose.Types.ObjectId(_user._id);
    const targetUserId = new mongoose.Types.ObjectId(params.userId);

    // Find the authenticated user
    const currentUser = await UserModel.findById({ _id: followId });
    if (!currentUser) {
      return new Response(
        JSON.stringify({ success: false, message: "Authenticated user not found" }),
        { status: 404 }
      );
    }

    // Find the target user to follow/unfollow
    const targetUser = await UserModel.findById({ _id: targetUserId });
    if (!targetUser) {
      return new Response(
        JSON.stringify({ success: false, message: "User to follow not found" }),
        { status: 404 }
      );
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
      // Unfollow: Remove the target user from the following list of the current user
      currentUser.following = currentUser.following.filter(
        (id) => !id.equals(targetUserId)
      );

      // Remove the current user from the followers list of the target user
      targetUser.followers = targetUser.followers.filter(
        (id) => !id.equals(followId)
      );

      // Save both users
      await currentUser.save();
      await targetUser.save();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Successfully unfollowed the user",
        }),
        { status: 200 }
      );
    } else {
      // Follow: Add target user to the following list of the current user
      currentUser.following.push(targetUserId);

      // Add current user to the followers list of the target user
      targetUser.followers.push(followId);

      // Save both users
      await currentUser.save();
      await targetUser.save();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Successfully followed the user",
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error when toggling follow:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error when toggling follow",
      }),
      { status: 500 }
    );
  }
}
