import dbConnect from "@/lib/dbConnect";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { HfInference } from "@huggingface/inference";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";


export async function POST(request: Request) {
  //await dbConnect();
  try {
    const { text } = await request.json();

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

    if (!text) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Text is required",
        }),
        { status: 404 }
      );
    }

    let apikey: string = ""

    if (process.env.API_KEY) {
        apikey = process.env.API_KEY
    }

    const genAI = new GoogleGenerativeAI(apikey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt:string = `Give me a description about this topic ${text} so that I can directly post it on my social media`

    const result = await model.generateContent(prompt);
    const content = await result.response;
    
    const description = content.text();



    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Text generated successfully",
        description
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating text:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error generating text",
      }),
      { status: 500 }
    );
  }
}


