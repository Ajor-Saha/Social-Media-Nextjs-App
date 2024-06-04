import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
import ThreadModel, { Thread } from "@/model/Thread";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  const ownerId = new mongoose.Types.ObjectId(params.userId);

  try {
    const currentUser = await UserModel.findById({ _id: ownerId });
    if (!currentUser) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        { status: 404 }
      );
    }

    // Fetch all threads from the database and sort by creation date in descending order
    const threads = await ThreadModel.find({ ownerId })
      .populate({
        path: "tag",
        select: "name",
      })
      .populate({
        path: "ownerId",
        select: "username avatar",
      })
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .exec();

    return Response.json(
      { success: true, threads, message: "User threads fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred: ", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
