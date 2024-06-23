import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";


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



export async function PUT(
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

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(_user._id);

    const isMember = community.members.includes(userId);

    if (isMember) {
      community.members = community.members.filter(
        (id) => !id.equals(userId)
      )
      await community.save();
      return new Response(
        JSON.stringify({
          success: true,
          message: "Member remove from community successfully",
          data: community,
        }),
        { status: 200 } // 200 is more appropriate for a successful GET request
      );
    } else {
      community.members.push(userId);
      await community.save();
      return new Response(
        JSON.stringify({
          success: true,
          message: "Member added successfully",
          data: community,
        }),
        { status: 200 } // 200 is more appropriate for a successful GET request
      );
    }

  
  } catch (error) {
    console.error("Error adding member to community:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error adding member to community",
      }),
      { status: 500 }
    );
  }
}


