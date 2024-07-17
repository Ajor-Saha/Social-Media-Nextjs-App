"use client";

import React, { FormEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { IoImages } from "react-icons/io5";
import { GoVideo } from "react-icons/go";
import { ApiResponse } from "@/types/ApiResponse";

function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadinga, setLodinga] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const allowedFileTypes = ["image/jpeg", "image/png", "image/gif"];

  const [tag, setTag] = useState<string>("");
  const [videos, setVideos] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleFile = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!allowedFileTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPEG, PNG, or GIF image."
        );
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleTextChange = (event: any) => {
    setText(event.target.value);
  };

  const handleContextChange = (event: any) => {
    setContext(event.target.value);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (!selectedFile) {
      toast.error("Please select an image file first.");
      return;
    }
    if (!context) {
      toast.error("Please provide some context for the image.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("context", context);

    try {
      const response = await axios.post("/api/aipost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setDescription(response.data.description);
        setImages((prevImages) => [...prevImages, response.data.image]);
        toast.success("Image processed successfully!");
      } else {
        toast.error(response.data.message || "Error processing the image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (event: any) => {
    event.preventDefault();
    if (!text) {
      toast.error("Please enter a text prompt first.");
      return;
    }

    setLoadingImage(true);

    try {
      const response = await axios.post("/api/aipost/text-image", { text });

      if (response.status === 200 && response.data.success) {
        setImages((prevImages) => [...prevImages, response.data?.image.url]);
        toast.success("Image generated successfully!");
      } else {
        toast.error(response.data.message || "Error generating the image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Error generating image");
    } finally {
      setLoadingImage(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    setLodinga(true);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("tag", tag);
    imageFiles.forEach((image) => formData.append("imagesfiles", image));
    videos.forEach((video) => formData.append("videos", video));
    images.forEach((image) => formData.append("images", image));


    console.log(images);
    


    try {
      const response = await axios.post<ApiResponse>(
        `/api/aipost/create-post`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message ||"Post created successfully");
        setDescription("");
        setTag("");
        setImages([]);
        setImageFiles([]);
        setVideos([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error creating post");
    } finally {
      setLodinga(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "images" | "videos"
  ) => {
    const files = Array.from(e.target.files || []);
    if (type === "images") {
      setImageFiles(files);
    } else {
      setVideos(files);
    }
  };

  return (
    <div className="py-32 flex flex-col justify-center items-center">
      <ToastContainer />
      <h1 className="font-bold text-xl">Create the post with our AI Feature</h1>
      <div className="flex lg:flex-row flex-col md:justify-between lg:gap-10">
        <div>
          <form
            onSubmit={handleSubmit}
            className="max-w-md mt-10 border border-gray-500 px-10 py-5 shadow-md rounded-md"
          >
            <h3 className="font-semibold">
              Choose an image from your device and also give a short context of
              picture you will get the post description
            </h3>
            <input
              type="file"
              accept="image/*"
              className="w-full max-w-xs border-2 border-blue-400 mt-5 py-2 px-4 bg-base-200 rounded-lg"
              onChange={handleFile}
            />
            <input
              type="text"
              placeholder="Enter short context"
              className="input mt-8 input-bordered input-info w-full max-w-xs"
              value={context}
              onChange={handleContextChange}
            />
            <button
              type="submit"
              className="btn btn-active btn-secondary mt-5 w-32"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                "Generate"
              )}
            </button>
          </form>
          <form
            onSubmit={handleTextSubmit}
            className="max-w-md mt-10 border border-gray-500 px-10 py-5 shadow-md rounded-md"
          >
            <h3 className="font-semibold">
              Enter a prompt as a input you will get a image for creating post
            </h3>
            <input
              type="text"
              placeholder="Enter Prompts"
              value={text}
              onChange={handleTextChange}
              className="input input-bordered input-info w-full max-w-xs mt-5"
            />
            <button
              type="submit"
              className="btn btn-active btn-secondary mt-5 w-32"
              disabled={loadingImage}
            >
              {loadingImage ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                "Generate"
              )}
            </button>
          </form>
        </div>
        <div className="max-w-md mt-10 border border-gray-500 px-10 py-5 shadow-md rounded-md">
          <h3 className="font-semibold text-lg">Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <input
              type="text"
              id="tag"
              placeholder="Add Tag here"
              className="input input-bordered input-info w-full max-w-xs my-5"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
            <textarea
              id="description"
              className="textarea textarea-info w-full max-w-xs"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex gap-8 py-2">
              <div className="p-5 rounded-lg w-14  mb-5">
                <label htmlFor="images">
                  <IoImages size={24} />
                </label>
                <input
                  type="file"
                  id="images"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "images")}
                />
                <div className="mt-2 w-full">
                  {imageFiles.map((image, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt="Selected Image"
                        layout="fill"
                        className="rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-lg w-14 mb-5">
                <label htmlFor="videos">
                  <GoVideo size={24} />
                </label>
                <input
                  type="file"
                  id="videos"
                  multiple
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, "videos")}
                />
                <div className="mt-2 flex-wrap space-x-2">
                  {videos.map((video, index) => (
                    <div key={index} className="relative w-32 h-20">
                      <video
                        src={URL.createObjectURL(video)}
                        controls
                        className="rounded w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {images.map((image, index) => (
              <div key={index} className="relative mt-5">
                <Image
                  src={image}
                  alt="pic"
                  width={300}
                  height={100}
                  className="max-w-xs mt-3"
                />
                <button
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-0 right-0 p-1 rounded-full"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="submit"
              className="btn btn-active btn-secondary mt-5 w-32"
              disabled={loadinga}
            >
              {loadinga ? (
                <span className="loading loading-spinner loading-lg"></span>
              ) : (
                "Create Post"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page;
