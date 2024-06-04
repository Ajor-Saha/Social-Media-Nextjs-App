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
    
    const thread = await ThreadModel.findById({ _id:threadId });
    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Thread does not exist",
        }),
        { status: 404 }
      );
    }

    const comments = await CommentModel.find({ thread: threadId });

    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Comments fetched successfully",
        datas: comments
        
      }),
      { status: 201 }
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
