import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";

export async function GET(request: Request) {
    await dbConnect();
  
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 9;
    const skip = (page - 1) * limit;
  
    try {
      const communities = await CommunityModel.aggregate([
        // Lookup threads for each community
        {
          $lookup: {
            from: "threads",
            localField: "threads",
            foreignField: "_id",
            as: "communityThreads",
          },
        },
        // Add fields for the number of followers, total likes, total comments, and total posts
        {
          $addFields: {
            followersCount: { $size: "$members" },
            totalLikes: { $sum: "$communityThreads.likes" },
            totalComments: { $sum: "$communityThreads.comments" },
            totalPosts: { $size: "$communityThreads" },
            totalEngagement: {
              $sum: [
                { $sum: "$communityThreads.likes" },
                { $sum: "$communityThreads.comments" },
              ],
            },
          },
        },
        // Sort by followersCount, totalEngagement, and totalPosts
        {
          $sort: {
            followersCount: -1,
            totalEngagement: -1,
            totalPosts: -1,
          },
        },
        // Pagination
        { $skip: skip },
        { $limit: limit },
      ]);
  
      if (!communities.length) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No community found",
          }),
          { status: 404 }
        );
      }
  
      return new Response(
        JSON.stringify({
          success: true,
          communities,
          message: "Communities details fetched successfully",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching communities details:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching communities details",
        }),
        { status: 500 }
      );
    }
  }