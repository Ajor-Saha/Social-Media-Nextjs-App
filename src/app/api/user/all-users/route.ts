import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: Request) {
  await dbConnect();

  try {
    // Fetch the latest created users, limit to the first 10 users
    const users = await UserModel.find({})
      .sort({ createdAt: -1 })
      .limit(10);

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
