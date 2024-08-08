import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { parentCommentId: string } }
) {
  await dbConnect();

  try {
    const parentCommentId = params.parentCommentId;

    

    const replies = await CommentModel.find({
      parentComment: parentCommentId,
    }).populate("owner", "username avatar");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Replies fetched successfully",
        data: replies,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching replies:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching replies",
      }),
      { status: 500 }
    );
  }
}
