"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsHeart, BsThreeDots } from "react-icons/bs";
import { FaRegComment, FaRegThumbsUp } from "react-icons/fa";
import { GoShareAndroid } from "react-icons/go";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommentCard from "./CommentCard";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
// Define the types for the thread prop
interface Thread {
  _id: string;
  ownerId: {
    _id: string;
    username: string;
    avatar: string;
  };
  description: string;
  images: string[];
  videos: string[];
  tag: {
    _id: string;
    name: string;
  };
  isPublished: boolean;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

interface Community {
  communityId: string;
}

interface CommunityThreadCardProps {
  thread: Thread;
  communityId: Community;
}

function CommunityThreadCard({
  thread,
  communityId,
}: CommunityThreadCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [isShowComments, setIsShowComments] = useState(false);
  const [threadComments, setThreadComments] = useState<Comment[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const user: User = session?.user;


  const fetchLikeCount = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/thread/like/${thread?._id}`
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
  }, [thread._id]);

  const handleLike = async () => {
    try {
      const response = await axios.post<ApiResponse>(
        `/api/thread/like/${thread._id}?communityId=${communityId}`
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
    setLoading(true);
    try {
      const response = await axios.post<ApiResponse>(
        `/api/community/comment/${communityId}`,
        { comment, threadId: thread._id }
      );
      if (response.data.success) {
        setComment("");
        fetchThreadComments(); // Fetch comments after adding a new comment
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error adding comment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikeCount();
  }, [fetchLikeCount]);

  const fetchThreadComments = useCallback(async () => {
    try {
      const response = await axios.get<any>(`/api/comment/${thread._id}`);
      if (response.data.success) {
        setThreadComments(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Error while fetching comments"
      );
    }
  }, [thread._id]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleComments = async () => {
    if (!isShowComments) {
      await fetchThreadComments();
    }
    setIsShowComments(!isShowComments);
  };

  const handleShare = () => {
    const link = `https://social-media-nextjs-app.vercel.app/post/${thread?._id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const navigateToTag = () => {
    router.push(`/search/tag/${thread?.tag?.name}`);
  };

  

  const handleSave = async () => {
    try {
      const response = await axios.post<ApiResponse>(
        `/api/thread/save-post/${thread?._id}`
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error saving post");
    }
  };


  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this thread?")) {
      try {
        const response = await axios.delete<ApiResponse>(
          `/api/thread/delete-post/${thread?._id}`
        );
        if (response.data.success) {
          toast.success(response.data.message);
          window.location.reload();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(axiosError.response?.data.message ?? "Error deleting post");
      }
    }
  };

  const openFullScreen = (image: string) => {
    setSelectedImage(image);
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setSelectedImage(null);
  };


  return (
    <div className="md:w-96 w-80 lg:w-[500px] rounded overflow-hidden p-2 my-2 border-b border-gray-400">
      <div className="flex flex-row justify-between items-start gap-3">
        <div className="flex items-center">
          <div className="avatar mt-3 px-2">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <Image
                src={
                  thread?.ownerId?.avatar ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                }
                alt="Avatar"
                width={300}
                height={150}
              />
            </div>
          </div>
          <div className="ml-2 flex flex-row gap-2">
            <Link href={
                user?.username === thread?.ownerId?.username
                  ? "/dashboard"
                  : `/profile/${thread?.ownerId?.username}`
              }>
              <h3 className="font-semibold text-xl">
                {thread.ownerId?.username}
              </h3>
            </Link>
            <p className="font-semibold text-gray-500">1d</p>
          </div>
        </div>
        <button className="btn btn-square btn-circle">
          <div className="dropdown dropdown-bottom dropdown-end">
            <div tabIndex={0} role="button">
              <BsThreeDots size={24} />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li className="flex">
                <a onClick={handleSave}>save</a>
              </li>
              <li className={user?.username === thread?.ownerId?.username ? "block" : "hidden"}>
                <Link href={`/postEdit/${thread?._id}`}>Edit</Link>
              </li>
              <li className={user?.username === thread?.ownerId?.username ? "block" : "hidden"}>
                {user?._id === thread?.ownerId?._id && <a onClick={handleDelete}>Delete</a>}
              </li>
              <li>
                <a onClick={handleShare}>Copy link</a>
              </li>
            </ul>
          </div>
        </button>
      </div>

      <div className="px-6 pt-2">
        <div className="font-semibold  mb-2">{thread?.description}</div>
      </div>
      <div className="px-6 pt-4 pb-2">
        <a className="link link-primary mr-2 pb-2" onClick={navigateToTag}>#{thread.tag?.name}</a>
      </div>
      <div className="carousel w-full">
        {thread.images &&
          thread.images.length > 0 &&
          thread.images.map((image: string, index: number) => (
            <div key={`image-${index}`} className="carousel-item mr-2">
              <Image
                src={image}
                alt={`Image ${index + 1}`}
                width={400}
                height={200}
                className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[350px] lg:w-[450px]"
                onClick={() => openFullScreen(image)}
              />
            </div>
          ))}
        {thread.videos &&
          thread.videos.length > 0 &&
          thread.videos.map((video: string, index: number) => (
            <div key={`video-${index}`} className="carousel-item">
              <video
                src={video}
                controls
                width={400}
                height={200}
                className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[370px] lg:w-[480px]"
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
        <div className="flex">
          <button className="btn" onClick={openModal}>
            <FaRegComment size={20} />
            <span>{thread.comments}</span>
          </button>
        </div>
        <button onClick={handleShare}>
          <GoShareAndroid size={20} />
        </button>
      </div>
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
                    <Image
                      src={
                        thread.ownerId.avatar ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                      }
                      alt="Avatar"
                      width={12}
                      height={12}
                    />
                  </div>
                </div>
                {thread.ownerId.username}
              </h2>
              <p className="text-wrap">{thread.description}</p>
              <div className="carousel w-full">
                {thread?.images.map((image, index) => (
                  <div key={index} className="carousel-item mr-2">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      width={360}
                      height={500}
                      className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[370px] lg:w-[480px]"
                    />
                  </div>
                ))}
                {thread?.videos?.map((video, index) => (
                  <div key={index} className="carousel-item">
                    <video
                      src={video}
                      controls
                      width={350}
                      height={200}
                      className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[370px] lg:w-[480px]"
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
                <button
                  className="btn btn-secondary"
                  onClick={handleAddComment}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
              <div>
                <button className="btn btn-outline" onClick={handleComments}>
                  {isShowComments ? "Close all comments" : "View All Comments"}
                </button>
              </div>
              {isShowComments && (
                <div className="overflow-y-auto py-2">
                  {threadComments.map((comment: any, index) => (
                    <div key={index} className="border-b border-gray-500">
                      <div className="flex gap-2 mt-1">
                        <div className="avatar w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={comment?.owner?.avatar}
                            alt="User Avatar"
                            width={48}
                            height={48}
                          />
                        </div>
                        <div>{comment?.owner?.username}</div>
                      </div>
                      <div className="py-1 flex justify-between">
                        <span>{comment?.content}</span>
                        <div className="flex items-center">
                          <button className="flex items-center mr-4 text-blue-600">
                            <FaRegThumbsUp className="mr-1" />
                            <span>0</span>
                          </button>
                          <button className="flex items-center text-blue-600">
                            <FaRegComment className="mr-1" />
                            <span>0</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default CommunityThreadCard;
