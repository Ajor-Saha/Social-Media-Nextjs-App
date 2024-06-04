import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  await dbConnect();

  try {
    const { username } = params;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: user,
        message: "User details fetched successfully",
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
