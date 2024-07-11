"use client";

import PostCard from "@/components/card/PostCard";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PostPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const [post, setPost] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPostDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/thread/get-single-post/${threadId}`
      );
      if (response.data.success) {
        setPost(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching post details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (threadId) {
      fetchPostDetails();
    }
  }, [threadId, fetchPostDetails]);

  

  return (
    <div className="py-32 flex justify-center items-center">
      {loading ? (
        <div className="flex w-[400px] md:w-[500px] lg:w-[600px] flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="skeleton h-16 w-16 shrink-0 rounded-full"></div>
          <div className="flex flex-col gap-4">
            <div className="skeleton h-4 w-20"></div>
            <div className="skeleton h-4 w-28"></div>
          </div>
        </div>
        <div className="skeleton h-52 w-full"></div>
      </div>
      ) : (
        <PostCard
          threadId={post._id}
          description={post.description}
          tag={post.tag}
          images={post.images}
          owner={post.ownerId}
          videos={post.videos}
          comments={post.comments}
        />
      )}
      <ToastContainer />
    </div>
  );
}

export default PostPage;
