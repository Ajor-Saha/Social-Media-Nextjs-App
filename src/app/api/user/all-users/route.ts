import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: Request) {
    await dbConnect();
  
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 9;
    const skip = (page - 1) * limit;
  
    try {
      // Fetch users sorted by the latest created date with pagination
      const users = await UserModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      if (!users.length) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No users found",
          }),
          { status: 404 }
        );
      }
  
      return new Response(
        JSON.stringify({
          success: true,
          users,
          message: "Users details fetched successfully",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching user details:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching user details",
        }),
        { status: 500 }
      );
    }
  }