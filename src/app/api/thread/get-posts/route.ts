import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";
import CommunityModel from "@/model/Community";
import { getServerSession, User } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import LikeModel from "@/model/Like";
import CommentModel from "@/model/Comment";

export async function GET(request: Request) {
  await dbConnect();

  try {
    if (!TagModel) {
      throw new Error("TagModel is not registered");
    }

    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);
    const type = searchParams.get("type");

    if (
      !type ||
      (type !== "home" && type !== "foryou" && type !== "following")
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid type parameter",
        }),
        { status: 400 }
      );
    }

    if (type === "home") {
      // Fetch all threads excluding those associated with any community
      const communityThreads = await CommunityModel.find({})
        .select("threads")
        .exec();
      const threadIds = communityThreads.flatMap(
        (community) => community.threads
      );

      const threads = await ThreadModel.find({ _id: { $nin: threadIds } })
        .populate({
          path: "tag",
          select: "name",
        })
        .populate({
          path: "ownerId",
          select: "username avatar",
        })
        .sort({ createdAt: -1 })
        .exec();

      return new Response(
        JSON.stringify({
          success: true,
          threads,
          message: "Threads fetched successfully",
        }),
        { status: 200 }
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

    if (type === "following") {
      // Fetch threads created by users that the authenticated user is following
      const followingIds = user.following;

      if (followingIds.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User is not following anyone",
            data: [],
          }),
          { status: 400 }
        );
      }

      const threads = await ThreadModel.find({ ownerId: { $in: followingIds } })
        .populate({
          path: "tag",
          select: "name",
        })
        .populate({
          path: "ownerId",
          select: "username avatar",
        })
        .sort({ createdAt: -1 })
        .exec();

      return new Response(
        JSON.stringify({
          success: true,
          threads,
          message: "Threads from followed users fetched successfully",
        }),
        { status: 200 }
      );
    }

    if (type === "foryou") {
      // For "foryou" type
      // Find all likes and comments by the user
      const likedThreads = await LikeModel.find({ likeBy: userId }).select(
        "thread"
      );
      const commentedThreads = await CommentModel.find({
        owner: userId,
      }).select("thread");

      // Combine the threads from likes and comments
      const threadIds = new Set([
        ...likedThreads.map((like) => like.thread.toString()),
        ...commentedThreads.map((comment) => comment.thread.toString()),
      ]);

      if (threadIds.size === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No Post found",
            data: [],
          }),
          { status: 400 }
        );
      }

      // Find the owners of the threads
      const threads = await ThreadModel.find({
        _id: { $in: Array.from(threadIds) },
      }).select("ownerId");
      const ownerIds = new Set(
        threads.map((thread) => thread.ownerId.toString())
      );

      if (ownerIds.size === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No owner found",
            data: [],
          }),
          { status: 400 }
        );
      }

      
      
      

      // Fetch all threads created by these owners, sorted by creation date
      const allThreads = await ThreadModel.find({ ownerId: { $in: ownerIds } })
        .populate({
          path: "tag",
          select: "name",
        })
        .populate({
          path: "ownerId",
          select: "username avatar",
        })
        .sort({ createdAt: -1 })
        .exec();

        console.log(allThreads);
        

      return new Response(
        JSON.stringify({
          success: true,
          message: "Posts fetched successfully",
          data: allThreads,
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
