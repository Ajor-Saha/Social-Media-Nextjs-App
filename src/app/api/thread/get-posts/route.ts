import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";
import CommunityModel from "@/model/Community";

export async function GET(request: Request) {
  await dbConnect();

  try {
    if (!TagModel) {
      throw new Error("TagModel is not registered");
    }

    // Fetch all threads that are associated with any community
    const communityThreads = await CommunityModel.find({})
      .select("threads")
      .exec();

    // Extract thread IDs from communityThreads
    const threadIds = communityThreads.flatMap((community) => community.threads);

    // Fetch all threads excluding those associated with any community
    const threads = await ThreadModel.find({ _id: { $nin: threadIds } })
      .populate({
        path: "tag",
        select: "name",
      })
      .populate({
        path: "ownerId",
        select: "username avatar",
      })
      .sort({ createdAt: -1 })
      .exec();

    return new Response(
      JSON.stringify({
        success: true,
        threads,
        message: "Threads fetched successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
