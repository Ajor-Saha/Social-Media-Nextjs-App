import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import CommunityModel from "@/model/Community";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import { UploadApiResponse } from "cloudinary";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    //console.log(formData);
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const coverImageFile = formData.get("coverImage") as File;

    const session = await getServerSession(authOptions);
    const _user: User = session?.user;

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

    // Upload cover image to Cloudinary
    const fileBuffer = await coverImageFile.arrayBuffer();
    const mimeType = coverImageFile.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const uploadResult = await uploadToCloudinary(fileUri, coverImageFile.name);
    if (!uploadResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error uploading cover image",
        }),
        { status: 500 }
      );
    }

    const coverImageUrl = uploadResult.result?.secure_url;

    // Create new community
    const newCommunity = new CommunityModel({
      name,
      description,
      coverImage: coverImageUrl,
      admin: [ownerId],
      members: [ownerId],
      threads: [],
      about: ""
    });

    await newCommunity.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Community created successfully",
        community: newCommunity,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating community:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating community",
      }),
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
    await dbConnect();
  
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 9;
    const skip = (page - 1) * limit;
  
    try {
      // Fetch users sorted by the latest created date with pagination
      const communities = await CommunityModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      if (!communities.length) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No community found",
          }),
          { status: 404 }
        );
      }
  
      return new Response(
        JSON.stringify({
          success: true,
          communities,
          message: "Communities details fetched successfully",
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching communities details:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error fetching communities details",
        }),
        { status: 500 }
      );
    }
  }