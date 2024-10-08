import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/model/Comment";
import ThreadModel from "@/model/Thread";

export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  await dbConnect();

  try {
    const threadId = params.threadId;

    const thread = await ThreadModel.findById({ _id: threadId });
    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Thread does not exist",
        }),
        { status: 404 }
      );
    }

    const comments = await CommentModel.find({ thread: threadId, parentComment: null })
      .populate('owner', 'username avatar')
      .populate({
        path: 'children',
        populate: {
          path: 'owner',
          select: 'username avatar',
        },
        select: 'content',
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Comments fetched successfully",
        data: comments,
      }),
      { status: 200 } // 200 is more appropriate for a successful GET request
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching comments",
      }),
      { status: 500 }
    );
  }
}
