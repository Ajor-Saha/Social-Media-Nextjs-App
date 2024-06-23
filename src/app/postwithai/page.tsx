"use client";

import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

function Page() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [text, setText] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTextChange = (event: any) => {
    setText(event.target.value);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault(); // Prevent the default form submission behavior
    if (!selectedFile) {
      toast.error("Please select an image file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post("/api/aipost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setDescription(response.data.description);
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


  const handleTextSubmit = async (event:any) => {
    event.preventDefault();
    if (!text) {
      toast.error("Please enter a text prompt first.");
      return;
    }

    setLoadingImage(true);

    try {
      const response = await axios.post("/api/aipost/text-image", { text });

      if (response.status === 200 && response.data.success) {
        setGeneratedImageUrl(response.data?.image.url);
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
              Choose an image from your device and get the description of this
              image
            </h3>
            <input
              type="file"
              accept="image/*"
              className="w-full max-w-xs border-2 border-blue-400 mt-5 py-2 px-4 bg-base-200 rounded-lg"
              onChange={handleFileChange}
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
           className="max-w-md mt-10 border border-gray-500 px-10 py-5 shadow-md rounded-md">
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
          <input
            type="text"
            placeholder="Add Tag here"
            className="input input-bordered input-info w-full max-w-xs my-5"
          />
          <textarea
            className="textarea textarea-info w-full max-w-xs"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="file"
            className="w-full max-w-xs border-2 border-blue-400 mt-5 py-2 px-4 bg-base-200 rounded-xl"
          />
          {generatedImageUrl && (
            <div className="mt-5">
              <h3 className="font-semibold">Generated Image</h3>
              <Image src={generatedImageUrl} width={300} height={100} alt="Generated" className="max-w-xs mt-3" />
            </div>
          )}
          <button className="btn btn-active btn-secondary mt-5 w-32">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;
