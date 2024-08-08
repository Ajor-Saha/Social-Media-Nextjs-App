import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import SavedModel from "@/model/Saved";
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

    const saved = await SavedModel.findOne({ ownerId: userId })
      .populate({
        path: "saved",
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

    // if (!saved) {
    //   return new Response(
    //     JSON.stringify({
    //       success: false,
    //       message: "No saved posts found",
    //     }),
    //     { status: 404 }
    //   );
    // }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Posts fetched successfully",
        data: saved?.saved,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving Post:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error saving Post",
      }),
      { status: 500 }
    );
  }
}
