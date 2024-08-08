import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import ThreadModel from "@/model/Thread";
import NotificationModel from "@/model/Notification";

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
    const user = await UserModel.findById(userId);
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    // Fetch all notifications for the user and their followers/following
    // Get the date one month ago
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // Fetch all notifications for the user created between one month ago and today
    const notifications = await NotificationModel.find({
      ownerId: userId,
      createdAt: { $gte: oneMonthAgo, $lte: today }
    });

    
    

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notifications fetched successfully",
        notifications,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching notifications",
      }),
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
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
    const user = await UserModel.findById(userId);
    if (!user?.isVerified) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not exist or is not verified",
        }),
        { status: 400 }
      );
    }

    const { matchText } = await request.json();

    // Get the date one month ago
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // Fetch followers and following user IDs
    const followers = user.followers;
    const following = user.following;

    // Combine userId, followers, and following into a single array
    const userIds = [userId, ...followers, ...following];

    // Fetch all notifications for the user, their followers, and following created between one month ago and today
    const notifications = await NotificationModel.find({
      userId: { $in: userIds },
      name: { $regex: matchText, $options: 'i' }, // Using regex to match text (case insensitive)
      createdAt: { $gte: oneMonthAgo, $lte: today },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notifications fetched successfully",
        notifications,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching notifications",
      }),
      { status: 500 }
    );
  }
}




