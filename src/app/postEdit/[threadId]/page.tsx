"use client";

import { AiOutlineDelete } from "react-icons/ai";
import { AiOutlineEdit } from "react-icons/ai";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const [thread, setThread] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmiting, setIsSubmiting] = useState(false);

  const fetchTheadDetails = useCallback(async () => {
    try {
      const response = await axios.get<any>(
        `/api/thread/get-posts/${threadId}`
      );
      if (response.data.success) {
        setThread(response.data.data);
        setTag(response.data.data.tag?.name ?? "");
        setDescription(response.data.data.description ?? "");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching thread details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (threadId) {
      fetchTheadDetails();
    }
  }, [threadId, fetchTheadDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true);
    try {
      const response = await axios.put<ApiResponse>(
        `/api/thread/update-post/${threadId}`,
        { tag, description }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setThread(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while updating thread details";
      toast.error(errorMessage);
    } finally {
      setIsSubmiting(false);
    }
  };

  

  const handleEditImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("imageUrlToReplace", thread.images[index]);

        const response = await axios.put<ApiResponse>(
          `/api/thread/update-post/image-update/${threadId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          toast.success("Image updated successfully");
          setThread((prevThread: any) => {
            const updatedImages = [...prevThread.images];
            const newImageUrl = response.data.data?.images?.[index] ?? null;
            if (newImageUrl) {
              updatedImages[index] = newImageUrl;
            }
            return { ...prevThread, images: updatedImages };
          });
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        let errorMessage =
          axiosError.response?.data.message ?? "Error while updating image";
        toast.error(errorMessage);
      }
    }
  };


  return (
    <div className="py-32 flex flex-col justify-center items-center">
      <h1 className="pb-5 text-lg font-bold"> Edit Your Post</h1>
      <div className="card card-side bg-base-100 shadow-xl md:w-[550px] lg:w-[900px] sm:w-[500px] w-[360px] flex flex-col lg:flex-row">
        <div className="carousel lg:w-1/2 relative">
          {loading ? (
            <div className="skeleton h-48 lg:h-auto w-full"></div>
          ) : (
            thread.images?.map((value: string, index: number) => (
              <div className="carousel-item mr-2 relative" key={index}>
                <Image
                  src={value}
                  alt="pic"
                  width={360}
                  height={500}
                  className="rounded-box cursor-pointer w-[300px] sm:w-[320px] md:w-[370px] lg:w-[330px]"
                />
                <div className="btn btn-circle absolute top-2 right-2 cursor-pointer">
                  <AiOutlineDelete size={24} />
                </div>
                <div className="btn btn-circle absolute bottom-2 right-2 cursor-pointer">
                  <label htmlFor={`edit-image-${index}`}>
                    <AiOutlineEdit size={24} className="cursor-pointer" />
                  </label>
                  <input
                    type="file"
                    id={`edit-image-${index}`}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={(e) => handleEditImage(e, index)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <label htmlFor="tag" className="py-3 font-semibold">
              Edit Tag
            </label>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered input-info w-full my-3"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <label htmlFor="description" className="py-3 font-semibold">
              Edit Post Description
            </label>
            <textarea
              className="textarea textarea-info w-full my-3"
              placeholder="Bio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <div className="card-actions justify-end">
              <button
                type="submit"
                className="btn btn-outline btn-info mt-2 px-8"
                disabled={loading}
              >
                {isSubmiting ? (
                  <span className="loading loading-dots loading-lg"></span>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default EditPage;
