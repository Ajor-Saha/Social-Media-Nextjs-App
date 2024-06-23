import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import dbConnect from "@/lib/dbConnect";
import CommunityModel from "@/model/Community";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";
import { UploadApiResponse } from "cloudinary";
import mongoose from "mongoose";
import { User, getServerSession } from "next-auth";
import path from "path";

export async function POST(
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

    const formData = await request.formData();
    const description = formData.get("description") as string;
    const imageFiles = formData.getAll("images") as File[];
    const videoFiles = formData.getAll("videos") as File[];
    const tag = formData.get("tag") as string;

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

    // Process and create tag
    let tagDocument = await TagModel.findOne({ name: tag });
    if (!tagDocument) {
      tagDocument = new TagModel({ name: tag, ownerId });
      await tagDocument.save();
    }
    const tagId = tagDocument._id as mongoose.Types.ObjectId;

    // Helper function to upload files to Cloudinary
    const uploadFiles = async (files: File[]) => {
      const uploadPromises = files.map(async (file) => {
        const fileBuffer = await file.arrayBuffer();
        const mimeType = file.type;
        const encoding = "base64";
        const base64Data = Buffer.from(fileBuffer).toString("base64");
        const fileUri = `data:${mimeType};${encoding},${base64Data}`;

        return await uploadToCloudinary(fileUri, file.name);
      });

      const uploadResults = await Promise.all(uploadPromises);

      return uploadResults
        .filter(
          (res): res is { success: true; result: UploadApiResponse } =>
            res.success
        )
        .map((res) => res.result.secure_url);
    };

    // Upload images and videos to Cloudinary
    const imageUrls = await uploadFiles(imageFiles);
    const videoUrls = await uploadFiles(videoFiles);

    // Create new thread
    const newThread = new ThreadModel({
      ownerId,
      description,
      images: imageUrls,
      videos: videoUrls,
      tag: tagId,
      isPublished: true,
    });

    await newThread.save();

    const threadId = newThread._id as mongoose.Types.ObjectId;

    community.threads.push(threadId);
    await community.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thread created successfully",
        thread: newThread,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating thread:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating thread",
      }),
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  await dbConnect();

  try {
    const communityId = params.communityId;

    // Parse query parameters for pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 9;
    const skip = (page - 1) * limit;

    // Fetch the community by ID
    const community = await CommunityModel.findById({ _id:communityId });
    //console.log(community);
    
    if (!community) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Community does not exist",
        }),
        { status: 404 }
      );
    }

    // Fetch threads with pagination and sorting
    const threads = await CommunityModel.findById({ _id: communityId })
      .select("threads")
      .populate({
        path: "threads",
        options: {
          sort: { createdAt: -1 }, // Sort by creation date in descending order
          skip: skip,
          limit: limit,
        },
        populate: [
          { path: "ownerId", select: "avatar username" }, // Assuming ownerId is the field referencing the user document
          { path: "tag", select: "name" } // Assuming tag is the field referencing the tag document
        ]
      })
      .exec();


    if (!threads) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Threads not found",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Community threads fetched successfully",
        data: threads.threads, // Ensure we're returning the threads array
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching community threads",
      }),
      { status: 500 }
    );
  }
}
