import dbConnect from "@/lib/dbConnect";
import { User, getServerSession } from "next-auth";
import mongoose from "mongoose";
import UserModel from "@/model/User";
import { authOptions } from "../../auth/[...nextauth]/options";
import Replicate from "replicate";
import { Client } from "@gradio/client";
import axios from "axios";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { text } = await request.json();

    /* const session = await getServerSession(authOptions);
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
    } */

    /*const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    //console.log("Running the model...");
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: `${text}`,
        },
      }
    ); */

    if (!text) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Text prompt is required",
        }),
        { status: 400 }
      );
    }

    const apiUrl = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "API key not configured",
        }),
        { status: 500 }
      );
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const body = {
      steps: 40,
      width: 1024,
      height: 1024,
      seed: 0,
      cfg_scale: 5,
      samples: 1,
      text_prompts: [
        {
          text: text,
          weight: 1,
        },
        {
          text: "blurry, bad",
          weight: -1,
        },
      ],
    };

    const response = await axios.post(apiUrl, body, { headers });

    if (response.status !== 200) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error generating image",
        }),
        { status: response.status }
      );
    }

    const { artifacts } = response.data;
    if (!artifacts || artifacts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No images returned by the API",
        }),
        { status: 500 }
      );
    }

    const firstImage = artifacts[0];
    const imageUrl = `data:image/png;base64,${firstImage.base64}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Image generated successfully",
        image: {
          url: imageUrl,
          seed: firstImage.seed,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error generating image",
      }),
      { status: 500 }
    );
  }
}
