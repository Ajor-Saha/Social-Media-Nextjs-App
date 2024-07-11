"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AiPost from "../post/AiPost";
import PostCard from "../card/PostCard";

// Skeleton component
const SkeletonLoader = () => (
  <div className="flex flex-col gap-4 w-96 py-5">
    <div className="flex gap-4 items-center">
      <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
      <div className="flex flex-col gap-4">
        <div className="skeleton h-4 w-20"></div>
        <div className="skeleton h-4 w-28"></div>
      </div>
    </div>
    <div className="skeleton h-40 w-full"></div>
  </div>
);

const HomePage = () => {
  const [postData, setPostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // State to track loading

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
       // Set loading to true at the start of the fetch
      const response = await axios.get(`/api/thread/get-posts`);
      if (response.data.success) {
        setPostData(response.data.threads);
      } else {
        toast.error(response.data.message || "Error fetching post");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Error fetching like count"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container mx-auto p-24">
      <ToastContainer />
      <div className="flex justify-center items-center">
        <AiPost />
      </div>
      <div className="flex flex-col justify-center items-center">
        {loading
          ? // Render skeletons while loading
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))
          : // Render posts once data is fetched
            postData.length > 0 ? (
              postData.map((item, index) => (
                <PostCard
                  key={index}
                  threadId={item._id}
                  description={item.description}
                  tag={item.tag}
                  images={item.images}
                  owner={item.ownerId}
                  videos={item.videos}
                  comments={item.comments}
                />
              ))
            ) : (
              <p>No posts available</p>
            )}
      </div>
    </div>
  );
};

export default HomePage;
