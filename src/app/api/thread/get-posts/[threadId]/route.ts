import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";

export async function GET(
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
    if (!user || !user.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    const thread = await ThreadModel.findById(threadId).populate('tag', 'name');

    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Post not found",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post Fetchted successully",
        data: thread,
      }),
      { status: 200 }
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
