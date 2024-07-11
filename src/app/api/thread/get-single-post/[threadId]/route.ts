import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";

export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  await dbConnect();

  try {
    const threadId = params.threadId;
    if (!TagModel) {
      throw new Error("TagModel is not registered");
    }

    const thread = await ThreadModel.findById({ _id: threadId })
      .populate({
        path: "tag",
        select: "name",
      })
      .populate({
        path: "ownerId",
        select: "username avatar",
      })
      .exec();

    if (!thread) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Post not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post fetched successfully",
        data: thread,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching post",
      }),
      { status: 500 }
    );
  }
}
