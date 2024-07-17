import dbConnect from "@/lib/dbConnect";
import { HfInference } from "@huggingface/inference";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const context = formData.get("context") as string;

    if (!file || !context) {
      return new Response(
        JSON.stringify({ success: false, message: "No file or context provided" }),
        { status: 400 }
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

    // Upload image to Cloudinary
    const fileBuffer = await file.arrayBuffer();
    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const uploadResult = await uploadToCloudinary(fileUri, file.name);
    if (!uploadResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error uploading image",
        }),
        { status: 500 }
      );
    }

    const imageUrl = uploadResult.result?.secure_url;

    const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

    const description = await hf.imageToText({
      data: await (await fetch(`${imageUrl}`)).blob(),
      model: "nlpconnect/vit-gpt2-image-captioning",
    });

    let { generated_text } = description;

    

    let apikey: string = "";

    if (process.env.API_KEY) {
      apikey = process.env.API_KEY;
    }

    const genAI = new GoogleGenerativeAI(apikey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    

    const combinedPrompt = `Give me a description about this topic: ${generated_text} and context: ${context} so that I can directly post it on my social media`;

    const result = await model.generateContent(combinedPrompt);
    const content = await result.response;

    const generatedText = await content.text();

    return new Response(
      JSON.stringify({
        success: true,
        description: generatedText,
        image: imageUrl 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating thread description", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating thread description",
      }),
      { status: 500 }
    );
  }
}
