import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";

export async function GET(request: Request) {
  await dbConnect();

  try {
    // Fetch all tags from the database
    const tags = await TagModel.find({});

    return Response.json({ success: true, tags, message: "Tags fetched successfully" }, { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred: ", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
