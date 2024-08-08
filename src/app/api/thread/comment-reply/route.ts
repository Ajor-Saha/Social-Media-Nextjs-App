import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import CommentModel from "@/model/Comment";
import mongoose from "mongoose";


export async function POST(request: Request) {
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
  
      const { threadId, parentCommentId, content } = await request.json();
  
      if (!threadId || !parentCommentId || !content) {
        return new Response(
          JSON.stringify({ success: false, message: "Missing required fields" }),
          { status: 400 }
        );
      }
  
      const newComment = new CommentModel({
        content,
        thread: new mongoose.Types.ObjectId(threadId),
        owner: new mongoose.Types.ObjectId(_user._id),
        parentComment: new mongoose.Types.ObjectId(parentCommentId),
      });
  
      const savedComment = await newComment.save();
  
      // Add the new comment to the parent's children array
      await CommentModel.findByIdAndUpdate(parentCommentId, {
        $push: { children: savedComment._id },
      });
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Comment added successfully",
          comment: savedComment,
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