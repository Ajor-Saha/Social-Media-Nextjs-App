"use client";

import PostCard from "@/components/card/PostCard";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoComment } from "react-icons/go";
import { AiOutlineClose } from "react-icons/ai";

function PostPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const [post, setPost] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadinga, setLoadinga] = useState<boolean>(true);
  const [threadComments, setThreadComments] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const user: User = session?.user;
  const [replyContent, setReplyContent] = useState("");
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const openModal = (commentId: string) => {
    setIsModalOpen(true);
    setActiveCommentId(commentId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveCommentId(null);
    setReplyContent("");
  };

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

  const fetchThreadComments = useCallback(async () => {
    setLoadinga(true);
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
    } finally {
      setLoadinga(false);
    }
  }, [threadId]);

  const handleReplySubmit = async () => {
    if (!replyContent || !activeCommentId) return;

    try {
      const response = await axios.post<ApiResponse>(
        "/api/thread/comment-reply",
        {
          threadId,
          parentCommentId: activeCommentId,
          content: replyContent,
        }
      );
      if (response.data.success) {
        fetchThreadComments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Error while adding reply"
      );
    }
  };

  useEffect(() => {
    if (threadId) {
      fetchPostDetails();
      fetchThreadComments();
    }
  }, [threadId, fetchPostDetails, fetchThreadComments]);

  return (
    <div className="min-h-screen">
      {loading ? (
        <div className="flex py-28  mx-auto w-[400px] md:w-[500px] lg:w-[600px] flex-col gap-4">
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
        <div className="py-32 flex flex-col justify-center items-center">
          <div>
          <PostCard
            threadId={post._id}
            description={post.description}
            tag={post.tag}
            images={post.images}
            owner={post.ownerId}
            videos={post.videos}
            comments={post.comments}
            createdAt={post?.createdAt}
          />
          {threadComments.map((com, index) => (
            <div key={index} className="border-b-2 border-gray-500 pb-4 mb-2">
              <div className="flex justify-between">
                <div className="flex">
                  <Image
                    src={
                      com?.owner?.avatar ||
                      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt="Avatar"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <Link
                      href={
                        user?._id === com?.owner?._id
                          ? "/dashboard"
                          : `/profile/$com.username}`
                      }
                    >
                      <p className="font-semibold">{com?.owner?.username}</p>
                    </Link>
                    <p>{com?.content}</p>
                  </div>
                </div>
                <div className="mt-1" onClick={() => openModal(com._id)}>
                  <GoComment size={27} />
                </div>
              </div>
              {isModalOpen && activeCommentId === com?._id && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                  <div className="card card-side bg-base-100 shadow-xl w-[300px] sm:w-[450px] md:w-[600px] lg:w-[750px] overflow-y-auto ">
                    <div className="card-body">
                      <button
                        className="absolute top-2 right-2 rounded-full p-1"
                        onClick={closeModal}
                      >
                        <AiOutlineClose size={24} />
                      </button>
                      <h2 className="card-title">
                        <div className=" mt-3 px-2">
                          <div className="w-12 rounded-full ">
                            <Image
                              src={
                                com?.owner?.avatar ||
                                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                              }
                              alt="Avatar"
                              width={50}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p>{com?.owner.username}</p>
                          <p className="text-sm">{com?.content}</p>
                        </div>
                      </h2>
                      <p>Reply to {com?.owner?.username}</p>
                      <textarea
                        className="textarea textarea-info mt-5 mb-2"
                        placeholder="Write Here"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      ></textarea>
                      <div className="card-actions justify-end">
                        <button
                          className="btn btn-secondary"
                          onClick={handleReplySubmit}
                          disabled={loadinga}
                        >
                          {loadinga ? (
                            <span className="loading loading-spinner loading-md"></span>
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </div>
                      <div className="overflow-y-auto py-2">
                        <h3 className="font-semibold">
                          All reply on {com?.owner?.username} comment
                        </h3>
                      </div>
                      {com?.children.map((child: any, index: any) => (
                        <div key={index} className="flex">
                          <div className="flex gap-2">
                            <Image
                              src={
                                child?.owner?.avatar ||
                                "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                              }
                              alt="Avatar"
                              width={30}
                              height={30}
                              className="w-12 rounded-btn"
                            />
                            <div className="flex flex-col">
                              <p className="mt-2">{child?.owner?.username}</p>
                              <p className="">{child?.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default PostPage;
