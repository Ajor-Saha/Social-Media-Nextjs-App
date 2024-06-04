import dbConnect from "@/lib/dbConnect";
import TagModel from "@/model/Tag";
import ThreadModel, { Thread } from "@/model/Thread";

export async function GET(request: Request) {
    await dbConnect();
    

  try {
    if (!TagModel) {
        throw new Error("TagModel is not registered");
      }
    // Fetch all tags from the database
    const threads = await ThreadModel.find({})
            .populate({
                path: 'tag',
                select: 'name'
            })
            .populate({
                path: 'ownerId',
                select: 'username avatar'
            })
            .sort({ createdAt: -1 })  // Sort by creation date in descending order
            .exec();

        
        

    return Response.json({ success: true, threads, message: "Threads fetched successfully" }, { status: 200 });
  } catch (error) {
    console.error("An unexpected error occurred: ", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
