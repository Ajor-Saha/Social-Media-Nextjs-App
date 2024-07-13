import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";


export async function PUT(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user: User = session?.user;
  
    if (!session || !_user) {
      return new Response(JSON.stringify(
        { success: false, message: "Not authenticated" }
      ), { status: 401 });
    }
 
    const userId = new mongoose.Types.ObjectId(_user._id);
    const { fullName, bio, username } = await request.json();
  
    if (!fullName && !bio) {
      return new Response(JSON.stringify(
        { success: false, message: "No data to update" }
      ), { status: 400 });
    }
  
    try {
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (bio) updateData.bio = bio;
      if(username) updateData.username = username;
  
      const updatedUser = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { $set: updateData },
        { new: true }
      );
  
      if (!updatedUser) {
        return new Response(JSON.stringify(
          { success: false, message: "User not found" }
        ), { status: 404 });
      }
  
      // Return the updated user data
      return new Response(JSON.stringify(
        { success: true, data: updatedUser, message: 'User details updated successfully' }
      ), { status: 201 });
    } catch (error) {
      console.error("An unexpected error occurred: ", error);
      return new Response(JSON.stringify(
        { message: "Internal server error", success: false }
      ), { status: 500 });
    }
}