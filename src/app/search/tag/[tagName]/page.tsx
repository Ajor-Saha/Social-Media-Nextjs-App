"use client";

import PostCard from "@/components/card/PostCard";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function TagName() {
  const params = useParams<{ tagName: string }>();
  const tagName = params.tagName;
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeButton, setActiveButton] = useState("top")

  const fetchTopPosts = useCallback(async () => {
    setLoading(true);
    setActiveButton("top")
    try {
      const response = await axios.get<any>(`/api/tag/top-post/${tagName}`);
      if (response.data.success) {
        setThreads(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching top posts");
    } finally {
      setLoading(false);
    }
  }, [tagName]);

  const fetchRecentPosts = useCallback(async () => {
    setLoading(true);
    setActiveButton("recent")
    try {
      const response = await axios.get<any>(`/api/tag/recent-post/${tagName}`);
      if (response.data.success) {
        setThreads(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching recent posts");
    } finally {
      setLoading(false);
    }
  }, [tagName]);

  useEffect(() => {
    if (tagName) {
      fetchTopPosts(); // Default to fetching top posts initially
    }
  }, [tagName, fetchTopPosts]);

  return (
    <div className="py-20 flex flex-col justify-center items-center h-auto">
      <h1 className="text-lg font-semibold text-secondary">#{tagName || ""}</h1>
      <div className="card  md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl border-x">
        <div className="card-body">
          <div className="flex gap-5">
            <button
              className={`${activeButton === "top" ? "bg-base-content" : ""} btn-outline btn text-gray-400 px-10 w-1/2`}
              onClick={fetchTopPosts}
            >
              Top
            </button>
            <button
              className={`${activeButton === "recent" ? "bg-base-content" : ""} btn-outline btn text-gray-400 px-10 w-1/2`}
              onClick={fetchRecentPosts}
            >
              Recent
            </button>
          </div>
          {loading ? (
            <div className="">
              {[1, 2, 3].map((item, index) => (
                <div key={index} className="flex flex-col gap-4 pt-5 w-full px-5">
                  <div className="flex gap-4 items-center">
                    <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                    <div className="flex flex-col gap-4">
                      <div className="skeleton h-4 w-20"></div>
                      <div className="skeleton h-4 w-28"></div>
                    </div>
                  </div>
                  <div className="skeleton h-44 w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10">
              {threads.map((thread: any, index: number) => (
                <PostCard
                  key={index}
                  threadId={thread._id}
                  description={thread.description}
                  tag={thread.tag}
                  images={thread.images}
                  owner={thread.ownerId}
                  videos={thread.videos}
                  comments={thread.comments}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default TagName;
