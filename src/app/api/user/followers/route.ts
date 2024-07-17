import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";



export async function GET(request: Request) {
    await dbConnect();
  
    try {
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
      const user = await UserModel.findById({ _id: userId });
      if (!user?.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "User does not exist or is not verified",
          }),
          { status: 400 }
        );
      }
  
      const url = new URL(request.url);
      const searchParams = new URLSearchParams(url.search);
      const type = searchParams.get('type'); // Get the 'type' query parameter
  
      if (type !== 'followers' && type !== 'following') {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid query parameter. Use 'type=followers' or 'type=following'.",
          }),
          { status: 400 }
        );
      }
  
      const fieldToPopulate = type === 'followers' ? 'followers' : 'following';
  
      // Populate the followers or following field with avatar, username, and fullName fields and sort by creation date
      const populatedUser = await UserModel.findById(userId)
        .populate({
          path: fieldToPopulate,
          select: 'avatar username fullName followers createdAt',
          options: { sort: { createdAt: -1 } } // Sort by creation date, newest first
        })
        .exec();
  
      if (!populatedUser) {
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
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} fetched successfully`,
          data: populatedUser[type],
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching followers or following:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching followers or following",
        }),
        { status: 500 }
      );
    }
  }