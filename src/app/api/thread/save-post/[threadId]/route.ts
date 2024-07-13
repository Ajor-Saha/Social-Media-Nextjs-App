import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import SavedModel from "@/model/Saved";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

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

    const thread = await ThreadModel.findById(threadId);

    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Post doesn't exist",
        }),
        { status: 400 }
      );
    }

    // Check if the saved document exists for the user, if not create one
    let saved = await SavedModel.findOne({ ownerId: userId });
    if (!saved) {
      saved = new SavedModel({ ownerId: userId, saved: [], liked: [] });
    }

    const postId = new mongoose.Types.ObjectId(threadId);

    // Check if the thread is already saved
    if (saved.saved.includes(postId)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Post is already saved",
        }),
        { status: 400 }
      );
    }

    // Add the thread to the saved list
    saved.saved.push(postId);
    await saved.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post saved successfully",
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



