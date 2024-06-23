import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";

export async function GET(
  request: Request,
  { params }: { params: { tagName: string } }
) {
  await dbConnect();

  try {
    const tagName = params.tagName;

    const existTag = await TagModel.findOne({ name: tagName });

    if (!existTag) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Tag not found",
        }),
        { status: 400 }
      );
    }

    const threads = await ThreadModel.find({ tag: existTag._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "tag",
        select: "name",
      })
      .populate({
        path: "ownerId",
        select: "username avatar",
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Threads fetched successfully",
        data: threads,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching threads:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching threads",
      }),
      { status: 500 }
    );
  }
}
