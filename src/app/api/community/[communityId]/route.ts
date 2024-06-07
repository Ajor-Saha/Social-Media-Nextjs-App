import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";


export async function GET(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  await dbConnect();

  try {
    const communityId = params.communityId;

    const community = await CommunityModel.findById({ _id: communityId });
    if (!community) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Community does not exist",
        }),
        { status: 404 }
      );
    }

    

    return new Response(
      JSON.stringify({
        success: true,
        message: "Community fetched successfully",
        data: community,
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
