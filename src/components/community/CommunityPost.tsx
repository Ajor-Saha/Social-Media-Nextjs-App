"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaTrash, FaRegThumbsUp, FaRegComment } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Demo data
interface CommunityPostProps {
  communityId: string;
  post: {
    _id: string;
    ownerId: {
      _id: string;
      username: string;
      avatar: string;
    };
    description: string;
    images: string[];
    videos: string[];
    likes: number;
    comments: number;
    createdAt: string;
    updatedAt: string;
  };
  refetchPosts: () => void;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post, communityId, refetchPosts }) => {
  const [openModal, setOpenModel] = useState(false);
  
  const handleModel = () => {
    setOpenModel(!openModal);
  };

  const deletePost = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/community/post/${post._id}`,
        { data : {communityId}}
      );
      if (response.data.success) {
        setOpenModel(false);
        refetchPosts();
        toast.success("Post deleted successfully");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    } finally {
      setOpenModel(false);
    }
    
  };

  return (
    <div className="border flex-col bg-base-300 mt-5 p-4 relative flex md:flex-row rounded-xl">
      {/* Delete icon */}
      <button className="absolute top-2 right-2 text-red-600" onClick={handleModel}>
        <FaTrash size={20} />
      </button>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
          <div className="card card-side bg-base-100 shadow-xl w-[300px] md:w-[400px] lg:w-[500px] ">
            <div className="card-body">
              <button
                className="absolute top-2 right-2 rounded-full p-1"
                onClick={() => setOpenModel(false)}
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="card-title">
                Delete this post?
              </h2>
              <div className="card-actions justify-end">
                <button className="btn btn-warning" onClick={deletePost} >Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Carousel */}

      <div className="md:w-1/3 w-full  carousel rounded-box h-56 lg:h-60  py-8 md:py-0">
        {post.images.length > 0 &&
          post.images.map((image, index) => (
            <div className="carousel-item w-full" key={index}>
              <Image
                src={image}
                className="w-full"
                alt="Tailwind CSS Carousel component"
                width={100}
                height={100}
              />
            </div>
          ))}
        {post.videos.length > 0 &&
          post?.videos?.map((video, index) => (
            <div key={index} className="carousel-item w-full">
              <video
                src={video}
                controls
                width={350}
                height={200}
                className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[350px] lg:w-[480px]"
              />
            </div>
          ))}
      </div>

      {/* Post details */}
      <div className="flex-1 flex flex-col pl-4">
        <div className="flex items-center mb-2">
          <div className="avatar w-12 h-12 rounded-full overflow-hidden">
            <Image
              src={post?.ownerId?.avatar}
              alt="User Avatar"
              width={48}
              height={48}
            />
          </div>
          <div className="ml-4">
            <p className="text-lg font-semibold">{post.ownerId.username}</p>
          </div>
        </div>
        <p className="h-20 lg:h-28  overflow-y-auto">{post.description}</p>
        <div className="flex items-center mt-4">
          <button className="flex items-center mr-4 text-blue-600">
            <FaRegThumbsUp className="mr-1" />
            <span>{post.likes}</span>
          </button>
          <button className="flex items-center text-blue-600">
            <FaRegComment className="mr-1" />
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CommunityPost;
