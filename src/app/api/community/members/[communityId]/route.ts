import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";


export async function GET(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  await dbConnect();

  try {
    const communityId = params.communityId;

    // Fetch community with members and admins details
    const community = await CommunityModel.findById({ _id:communityId })
      .populate({
        path: 'members',
        select: 'username avatar followers'
      })
      .populate({
        path: 'admin',
        select: 'username avatar followers'
      });

    if (!community) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Community does not exist",
        }),
        { status: 404 }
      );
    }

    // Extract admins
    const admins = community.admin;

    // Extract members excluding admins
    const adminIds = admins.map((admin: any) => admin._id.toString());
    const members = community.members.filter(
      (member: any) => !adminIds.includes(member._id.toString())
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Community fetched successfully",
        data: {
          admins,
          members,
        },
      }),
      { status: 200 } // 200 is more appropriate for a successful GET request
    );
  } catch (error) {
    console.error("Error fetching community:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching community",
      }),
      { status: 500 }
    );
  }
}