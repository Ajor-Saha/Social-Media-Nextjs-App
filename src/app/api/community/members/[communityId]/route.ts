import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession, User } from "next-auth";

export async function GET(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  await dbConnect();

  try {
    const communityId = params.communityId;

    // Fetch community with members and admins details
    const community = await CommunityModel.findById({ _id: communityId })
      .populate({
        path: "members",
        select: "username avatar followers",
      })
      .populate({
        path: "admin",
        select: "username avatar followers",
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


export async function PUT(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  await dbConnect();

  try {
    const communityId = params.communityId;
    const { username } = await request.json();

    const session = await getServerSession(authOptions);
    const _user = session?.user;

    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401 }
      ); 
    }

    const ownerId = new mongoose.Types.ObjectId(_user._id);

    // Check if user exists and is verified
    const user = await UserModel.findById({ _id: ownerId });
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Check if the user is an admin of the community
    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return new Response(
        JSON.stringify({ success: false, message: "Community does not exist" }),
        { status: 404 }
      );
    }

    const isAdmin = community.admin.some(
      (adminId) => adminId.toString() === ownerId.toString()
    );
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, message: "User is not an admin" }),
        { status: 403 }
      );
    }

    if (!username) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username is required",
        }),
        { status: 400 }
      );
    }

    // Find the user by username
    const memberToRemove = await UserModel.findOne({ username });
    if (!memberToRemove) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist",
        }),
        { status: 404 }
      );
    }

    // Remove the user from the community's members
    const updatedCommunity = await CommunityModel.findByIdAndUpdate(
      communityId,
      { $pull: { members: memberToRemove._id } },
      { new: true }
    ).populate({
      path: "members",
      select: "username avatar followers",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "User removed from community successfully",
        data: updatedCommunity,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error removing user from community",
      }),
      { status: 500 }
    );
  }
}
