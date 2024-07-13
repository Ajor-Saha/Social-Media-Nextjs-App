import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  await dbConnect();

  const { userId } = params;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid user ID format",
      }),
      { status: 400 }
    );
  }

  try {
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
          message: "Thread model not registered",
        }),
        { status: 400 }
      );
    }

    if (!TagModel) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Tag model not registered",
          }),
          { status: 400 }
        );
      }


    const comments = await CommentModel.find({ owner: userId })
      .populate({
        path: "thread",
        populate: [
          {
            path: "ownerId",
            select: "username avatar",
          },
          {
            path: "tag",  // Populate the tag field
            select: "name",  // Include the name field from the Tag model
          },
        ],
      })
      .populate({
        path: "owner",
        select: "username avatar",
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post replies fetched successfully",
        data: comments,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching post replies:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching post replies",
      }),
      { status: 500 }
    );
  }
}
