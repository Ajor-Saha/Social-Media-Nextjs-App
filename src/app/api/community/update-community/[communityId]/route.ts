import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";


export async function PUT(
    request: Request,
    { params }: { params: { communityId: string } }
  ) {
    await dbConnect();
  
    try {
      const communityId = params.communityId;
  
      const { description, about } = await request.json();
  
      const session = await getServerSession(authOptions);
      const _user: User = session?.user;
  
      if (!session || !_user) {
        return new Response(
          JSON.stringify({ success: false, message: "Not authenticated" }),
          { status: 401 }
        );
      }
  
      const userId = new mongoose.Types.ObjectId(_user._id);
  
      // Check if user exists and is verified
      const user = await UserModel.findById(userId);
      if (!user || !user.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User does not exist or is not verified",
          }),
          { status: 400 }
        );
      }
  
      // Fetch community with members and admins details
      const community = await CommunityModel.findById(communityId);
  
      if (!community) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Community does not exist",
          }),
          { status: 404 }
        );
      }
  
      // Check if the user is a member or admin of the community
      const isMember = community.members.includes(userId);
      const isAdmin = community.admin.includes(userId);
  
      if (!isMember && !isAdmin) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User is not a member or admin of the community",
          }),
          { status: 403 }
        );
      }
  
      // Update the community fields if provided
      if (description) {
        community.description = description;
      }
      if (about) {
        community.about = about;
      }
  
      await community.save();
  
      return new Response(
        JSON.stringify({
          success: true,
          message: "Community updated successfully",
          community,
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating community:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error updating community",
        }),
        { status: 500 }
      );
    }
  }