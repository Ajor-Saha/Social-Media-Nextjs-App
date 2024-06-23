import dbConnect from "@/lib/dbConnect";
import { HfInference } from "@huggingface/inference";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import { uploadToCloudinary } from "@/helpers/uploadToCloudinary";
import { UploadApiResponse } from "cloudinary";
import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, message: "No file provided" }),
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

    const { generated_text } = description;

    /*const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const prompt = `Give me a description: ${generated_text}`;

    const output = await replicate.run(
      "tomasmcm/zephyr-7b-beta:961cd6665b811d0c43c0b9488b6dfa85ff5c7bfb875e93b4533e4c7f96c7c526",
      {
        input: {
          top_k: 50,
          top_p: 0.95,
          prompt: `</s> ${prompt}</s>`,
          temperature: 0.8,
          max_new_tokens: 60,
          presence_penalty: 1
        }
      }
    );*/

    let apikey: string = "";

    if (process.env.API_KEY) {
      apikey = process.env.API_KEY;
    }

    const genAI = new GoogleGenerativeAI(apikey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt: string = `Give me a description about this topic ${generated_text} so that I can directly post it on my social media`;

    const result = await model.generateContent(prompt);
    const content = await result.response;

    const generatedText = content.text();

    return new Response(
      JSON.stringify({
        success: true,
        description: generatedText,
      }),
      { status: 200 }
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
