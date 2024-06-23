import React from "react";
import Image from "next/image";
import { FaTrash, FaRegThumbsUp, FaRegComment } from "react-icons/fa";

// Demo data
const postData = {
  images: [
    "https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg",
    "https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg",
    "https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg",
  ],
  avatar:
    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
  username: "John Doe",
  description:
    "This is nextjs fix code using chatgpt. I'll make the necessary adjustments to both your frontend React component and your backend API handler. This will include making sure the frontend layout is left-aligned and that the modal's close icon stays in its position.",
  totalLikes: 42,
  totalComments: 18,
};

function CommunityPost() {
  return (
    <div className="border flex-col bg-base-300 mt-5 p-4 relative flex md:flex-row rounded-xl">
      {/* Delete icon */}
      <button className="absolute top-2 right-2 text-red-600">
        <FaTrash size={20} />
      </button>

      {/* Carousel */}
      <div className="md:w-1/3 w-full  carousel rounded-box h-56 lg:h-60  py-8 md:py-0">
        <div className="carousel-item w-full">
          <Image
            src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg"
            className="w-96"
            alt="Tailwind CSS Carousel component"
            width={100}
            height={100}
          />
        </div>
        <div className="carousel-item w-full">
          <Image
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg"
            className="w-full"
            alt="Tailwind CSS Carousel component"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Post details */}
      <div className="flex-1 flex flex-col pl-4">
        <div className="flex items-center mb-2">
          <div className="avatar w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={postData.avatar}
              alt="User Avatar"
              width={48}
              height={48}
            />
          </div>
          <div className="ml-4">
            <p className="text-lg font-semibold">{postData.username}</p>
          </div>
        </div>
        <p className="h-20 lg:h-28  overflow-y-auto">{postData.description}</p>
        <div className="flex items-center mt-4">
          <button className="flex items-center mr-4 text-blue-600">
            <FaRegThumbsUp className="mr-1" />
            <span>{postData.totalLikes}</span>
          </button>
          <button className="flex items-center text-blue-600">
            <FaRegComment className="mr-1" />
            <span>{postData.totalComments}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityPost;
