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

    let threads = await ThreadModel.aggregate([
      { $match: { tag: existTag._id } },
      {
        $addFields: {
          engagement: { $add: ["$likes", "$comments"] },
        },
      },
      { $sort: { engagement: -1, createdAt: -1 } },
    ]);

    // Convert aggregation result to Mongoose documents
    threads = await ThreadModel.populate(threads, [
      {
        path: 'tag',
        select: 'name'
      },
      {
        path: 'ownerId',
        select: 'username avatar'
      }
    ]);

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
