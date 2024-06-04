import dbConnect from "@/lib/dbConnect";
import LikeModel from "@/model/Like";
import TagModel from "@/model/Tag";
import ThreadModel from "@/model/Thread";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { searchText } = await request.json();

    const regex = new RegExp(searchText, 'i'); // Create a regex with the search text and 'i' for case-insensitive

    // Find users matching the search text
    const existedUsers = await UserModel.find({
      $or: [{ username: regex }, { fullName: regex }],
    });

    // Find tags matching the search text
    const existedTags = await TagModel.find({ name: regex });

    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        users: existedUsers,
        tags: existedTags,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error searching data:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error searching data",
      }),
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
    await dbConnect();
    try {
      const { threadId } = await request.json();
  
      // Count the number of likes for the given threadId
      const likeCount = await LikeModel.countDocuments({ thread: threadId });
  
      // Find the thread by its ID
      const thread = await ThreadModel.findById({ _id: threadId });
  
      if (!thread) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Thread not found",
          }),
          { status: 404 }
        );
      }

      
      const updatedThread = await ThreadModel.findByIdAndUpdate(
        { _id: threadId },
        { likes: likeCount },
        { new: true }
      );
       
      return new Response(
        JSON.stringify({
          success: true,
          data: updatedThread
        }),
        { status: 200 }
      );
  
    } catch (error) {
      console.error("Error updating like count:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Error updating like count",
        }),
        { status: 500 }
      );
    }
  }