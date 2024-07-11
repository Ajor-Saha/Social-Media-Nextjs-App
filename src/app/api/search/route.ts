import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";
import TagModel from "@/model/Tag";
import UserModel from "@/model/User";


export async function POST(request: Request) {
    await dbConnect();
  
    const { searchText } = await request.json();
  
    if (!searchText) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "searchText is required",
        }),
        { status: 400 }
      );
    }
  
    try {
      // Search tags
      const tagResults = await TagModel.find({
        name: { $regex: searchText, $options: "i" },
      });
  
      // Search communities
      const communityResults = await CommunityModel.find({
        name: { $regex: searchText, $options: "i" },
      });
  
      // Search users
      const userResults = await UserModel.find({
        $or: [
          { username: { $regex: searchText, $options: "i" } },
          { fullName: { $regex: searchText, $options: "i" } },
        ],
      }).select("username fullName avatar followers");
  
      return new Response(
        JSON.stringify({
          success: true,
          tags: tagResults,
          communities: communityResults,
          users: userResults,
          message: "Search results fetched successfully",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching search results:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching search results",
        }),
        { status: 500 }
      );
    }
  }