"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BsHeart } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { GoShareAndroid } from "react-icons/go";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import Link from "next/link";
import { AiOutlineClose } from "react-icons/ai"; // Import close icon
import FollowCard from "./FollowCard";
import CommentCard from "./CommentCard";

interface Tag {
  _id: string;
  name: string;
}

interface owner {
  _id: string;
  username: string;
  avatar: string;
}

interface CardProps {
  threadId: string;
  description: string;
  tag: Tag;
  images: string[];
  owner: owner;
}

const PostCard: React.FC<CardProps> = ({
  threadId,
  description,
  tag,
  images,
  owner,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const { data: session } = useSession();
  const user: User = session?.user;

  // State for full-screen view
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [isShowComments, setIsShowComments] = useState(false);

  const fetchLikeCount = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/thread/like/${threadId}`
      );
      if (
        response.data.success &&
        typeof response.data.likeCount === "number"
      ) {
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Error fetching like count"
      );
    }
  }, [threadId]);

  const handleLike = async () => {
    try {
      const response = await axios.post<ApiResponse>(
        `/api/thread/like/${threadId}`
      );
      if (response.data.success) {
        setLiked(true);
        fetchLikeCount();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error liking post");
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await axios.post<ApiResponse>(
        `/api/thread/comment/${threadId}`,
        { content: comment }
      );
      if (response.data.success) {
        
        setComment("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error adding comment");
    }
  };

  useEffect(() => {
    fetchLikeCount();
  }, [fetchLikeCount]);

  const openFullScreen = (image: string) => {
    setSelectedImage(image);
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setSelectedImage(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleComments = () => {
    setIsShowComments(!isShowComments)
  }

  return (
    <div className="md:w-96 w-80 lg:w-[500px] rounded overflow-hidden p-2 my-2">
      <div className="flex flex-row justify-between items-start gap-3">
        <div className="flex items-center">
          <div className="avatar mt-3 px-2">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  owner?.avatar ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                }
                alt="Avatar"
              />
            </div>
          </div>
          <div className="ml-2 flex flex-row gap-2">
            <Link
              href={
                user?.username === owner?.username
                  ? "/dashboard"
                  : `/profile/${owner.username}`
              }
            >
              <h3 className="font-semibold text-xl">{owner.username}</h3>
            </Link>
            <p className="font-semibold text-gray-500">1d</p>
          </div>
        </div>
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="font-semibold text-xl mb-2">{description}</div>
      </div>
      <div className="px-6 pt-4 pb-2">
        <a className="link link-primary mr-2">#{tag.name}</a>
      </div>
      <div className="carousel carousel-center max-w-md px-1 py-2 space-x-4 bg-neutral rounded-box">
        {images.map((image, index) => (
          <div key={index} className="carousel-item">
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              width={350}
              height={200}
              className="rounded-box cursor-pointer"
              onClick={() => openFullScreen(image)}
            />
          </div>
        ))}
      </div>
      <div className="pt-4 flex flex-row gap-5">
        <div className="flex">
          <button className="btn" onClick={handleLike}>
            <BsHeart
              size={20}
              className={`${liked ? "text-red-500 font-bold" : ""}`}
            />
            <span>{likeCount}</span>
          </button>
        </div>
        <button onClick={openModal}>
          <FaRegComment size={20} />
        </button>
        <button>
          <GoShareAndroid size={20} />
        </button>
      </div>
      <div className="divider divider-end"></div>

      {isFullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <Image
              src={selectedImage!}
              alt="Full Screen Image"
              width={800}
              height={600}
              className="rounded"
            />
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2"
              onClick={closeFullScreen}
            >
              <AiOutlineClose size={24} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px] h-[650px]">
            <div className="card-body">
              <button
                className="absolute top-2 right-2 rounded-full p-1"
                onClick={closeModal}
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="card-title">
                <div className="avatar mt-3 px-2">
                  <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        owner?.avatar ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                      }
                      alt="Avatar"
                    />
                  </div>
                </div>
                {owner.username}
              </h2>
              <p className="text-wrap">{description}</p>
              <div className="carousel carousel-center max-w-md px-1 py-2 space-x-4 bg-neutral rounded-box">
                {images?.map((image, index) => (
                  <div key={index} className="carousel-item">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      width={350}
                      height={200}
                      className="rounded-box cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              <textarea
                className="textarea textarea-info mt-5 mb-2"
                placeholder="Add Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary" onClick={handleAddComment}>Submit</button>
              </div>
              <div>
              <button className="btn btn-outline" onClick={handleComments}>View All Comment</button>
              </div>
              {
                isShowComments && (
                  <div className="overflow-y-auto">
                    <CommentCard />
                    <CommentCard />
                  </div>
                )
              }
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default PostCard;
