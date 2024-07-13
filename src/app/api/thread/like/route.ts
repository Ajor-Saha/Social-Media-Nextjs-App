import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import LikeModel from "@/model/Like";
import ThreadModel from "@/model/Thread";
import TagModel from "@/model/Tag";

export async function GET(request: Request) {
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

    if (!ThreadModel) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "ThreadModel not found",
        }),
        { status: 400 }
      );
    }

    if (!TagModel) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "TagModel not found",
        }),
        { status: 400 }
      );
    }

    const liked = await LikeModel.find({ likeBy: userId, thread: { $exists: true } })
      .populate({
        path: "thread",
        populate: [
          {
            path: "tag",
            select: "name",
          },
          {
            path: "ownerId",
            select: "username avatar",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!liked.length) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No liked posts found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Liked posts fetched successfully",
        data: liked.map((like) => like.thread),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching liked posts",
      }),
      { status: 500 }
    );
  }
}
