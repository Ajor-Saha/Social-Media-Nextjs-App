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
import CommentCard from "./CommentCard";
import { BsThreeDots } from "react-icons/bs";
import { formatDistanceToNow } from "date-fns";

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
  videos: string[];
  owner: owner;
  comments?: number;
  createdAt?: string;
}

interface Comment {
  content: string;
  owner: owner;
}

const PostCard: React.FC<CardProps> = ({
  threadId,
  description,
  tag,
  images,
  owner,
  videos,
  comments,
  createdAt
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
  const [threadComments, setThreadComments] = useState<Comment[]>([]);

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

  const fetchThreadComments = useCallback(async () => {
    try {
      const response = await axios.get<any>(`/api/comment/${threadId}`);
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
  }, [threadId]);

  const handleSave = async () => {
    try {
      const response = await axios.post<ApiResponse>(
        `/api/thread/save-post/${threadId}`
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

  useEffect(() => {
    if (threadId) {
      fetchLikeCount();
    }
  }, [threadId, fetchLikeCount]);

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

  const handleComments = async () => {
    if (!isShowComments) {
      await fetchThreadComments();
    }
    setIsShowComments(!isShowComments);
  };

  const handleShare = () => {
    const link = `https://social-media-nextjs-app.vercel.app/post/${threadId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this thread?")) {
      try {
        const response = await axios.delete<ApiResponse>(
          `/api/thread/delete-post/${threadId}`
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

  const formatTimeAgo = (date: string) => {
    const diffInSeconds = (new Date().getTime() - new Date(date).getTime()) / 1000;

    if (diffInSeconds < 60) {
      return `${Math.floor(diffInSeconds)}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} h`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)} d`;
    } else if (diffInSeconds < 31536000) {
      return `${Math.floor(diffInSeconds / 2592000)} mon`;
    } else {
      return `${Math.floor(diffInSeconds / 31536000)} y`;
    }
  };

  const timeAgo = createdAt ? formatTimeAgo(createdAt) : "";

  
  return (
    <div className="md:w-96 w-80 lg:w-[500px] rounded overflow-hidden p-2 my-2">
      <div className="flex flex-row justify-between items-start gap-3">
        <div className="flex items-center">
          <div className="avatar mt-3 px-2">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <Image
                src={
                  owner?.avatar ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                }
                alt="Avatar"
                width={300}
                height={150}
              />
            </div>
          </div>
          <div className="ml-2 flex flex-row gap-2">
            <Link
              href={
                user?.username === owner?.username
                  ? "/dashboard"
                  : `/profile/${owner?.username}`
              }
            >
              <h3 className="font-semibold text-xl">{owner?.username}</h3>
            </Link>
            <p className="font-semibold text-gray-500">{timeAgo}</p>
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
              <li
                className={
                  user?.username === owner?.username ? "block" : "hidden"
                }
              >
                <Link href={`postEdit/${threadId}`}>Edit</Link>
              </li>
              <li
                className={
                  user?.username === owner?.username ? "block" : "hidden"
                }
              >
                {user?._id === owner?._id && (
                  <a onClick={handleDelete}>Delete</a>
                )}
              </li>
              <li>
                <a onClick={handleShare}>Copy link</a>
              </li>
            </ul>
          </div>
        </button>
      </div>

      <div className="px-6 pt-4">
        <Link href={`/post/${threadId}`} className="font-semibold">
          {description}
        </Link>
      </div>
      <div className="px-6  pb-5">
        <Link
          href={`/search/tag/${tag?.name}`}
          className="link link-primary mr-2"
        >
          #{tag?.name}
        </Link>
      </div>
      <div className="carousel w-full">
        {images?.map((image, index) => (
          <div key={index} className="carousel-item mr-2">
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              width={360}
              height={500}
              className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[350px] lg:w-[450px]"
              onClick={() => openFullScreen(image)}
            />
          </div>
        ))}
        {videos?.map((video, index) => (
          <div key={index} className="carousel-item">
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
        <button onClick={openModal} className="flex mt-3">
          <FaRegComment size={20} />
          <span className="px-2">{comments}</span>
        </button>
        <button onClick={handleShare}>
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
                    <Image
                      src={
                        owner?.avatar ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                      }
                      alt="Avatar"
                      width={12}
                      height={12}
                    />
                  </div>
                </div>
                {owner.username}
              </h2>
              <p className="text-wrap">{description}</p>
              <div className="carousel w-full">
                {images.map((image, index) => (
                  <div key={index} className="carousel-item mr-2">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      width={360}
                      height={500}
                      className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[370px] lg:w-[480px]"
                      onClick={() => openFullScreen(image)}
                    />
                  </div>
                ))}
                {videos?.map((video, index) => (
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
                >
                  Submit
                </button>
              </div>
              <div>
                <button className="btn btn-outline" onClick={handleComments}>
                  {isShowComments ? "Close all comments" : "View All Comments"}
                </button>
              </div>
              {isShowComments && (
                <div className="overflow-y-auto py-2">
                  {threadComments?.length > 0 ? (
                    threadComments.map((comment, index) => (
                      <CommentCard comment={comment} key={index} />
                    ))
                  ) : (
                    <p>No comments available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default PostCard;
