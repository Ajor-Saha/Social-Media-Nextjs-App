import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaRegEdit, FaImage, FaVideo } from "react-icons/fa";
import { GiSuspicious } from "react-icons/gi";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { threadSchema } from "@/schemas/threadSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import { AiOutlineClose } from "react-icons/ai";

interface Tag {
  _id: string;
  name: string;
  ownerId: string;
}

const ThreadCard = () => {
  const [showModal, setShowModal] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const { data: session } = useSession();
  const user: User = session?.user;

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(threadSchema),
    defaultValues: {
      description: "",
      tag: "",
      images: [] as File[],
      videos: [] as File[],
    },
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get("/api/tag/get-tags");
        setAvailableTags(response.data.tags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const images = watch("images") || [];
      const updatedImages = [...images, ...Array.from(files)];
      setValue("images", updatedImages);
    }
  };

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const videos = watch("videos") || [];
      const updatedVideos = [...videos, ...Array.from(files)];
      setValue("videos", updatedVideos);
    }
  };

  const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setValue("tag", inputValue);
    if (inputValue) {
      setFilteredTags(
        availableTags.filter((tag) =>
          tag.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
      setDropdownVisible(true);
    } else {
      setDropdownVisible(false);
    }
  };

  const handleTagSelect = (tag: Tag) => {
    setValue("tag", tag.name);
    setDropdownVisible(false);
  };

  const onSubmit = async (data: z.infer<typeof threadSchema>) => {
    console.log("Form submitted with data:", data);
    const formData = new FormData();
    formData.append("description", data.description);

    if (data.images) {
      for (const image of data.images) {
        if (image && (image as File) instanceof File) {
          formData.append("images", image);
        }
      }
    }

    if (data.videos) {
      for (const video of data.videos) {
        if (video && (video as File) instanceof File) {
          formData.append("videos", video);
        }
      }
    }

    if (data.tag) {
      formData.append("tag", data.tag);
    }

    try {
      const res = await axios.post("/api/thread/add-post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setShowModal(false);
        reset();
        toast.success("Thread created successfully");
      } else {
        toast.error("Error creating thread: " + res.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message || "Unknown error";
      toast.error("Error creating thread: " + errorMessage);
    }
  };

  return (
    <div className="w-full">
      <ToastContainer />
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-ghost text-xl"
      >
        <FaRegEdit />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px]">
            <div className="card-body">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 rounded-full p-1"
              >
                <AiOutlineClose size={24} />
              </button>
              <h3 className="card-title">Create Thread</h3>
            
            <div className="px-10 py-10">
              <div className="flex items-center mb-4">
                <GiSuspicious size={40} />
                <span className="ml-4 font-semibold">{user?.username}</span>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="What's on your mind?"
                  rows={4}
                  {...register("description")}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500">{`${errors.description.message}`}</p>
                )}
                <div className="flex items-center mt-4 space-x-4 relative">
                  <label className="flex items-center cursor-pointer">
                    <FaImage className="text-2xl mr-2" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <FaVideo className="text-2xl mr-2" />
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      className="hidden"
                      onChange={handleVideoChange}
                    />
                  </label>
                  <input
                    type="text"
                    className="w-2/3 border p-2 rounded"
                    placeholder="Add or select a tag"
                    {...register("tag")}
                    name="tag"
                    onChange={handleTagInputChange}
                    onFocus={() => setDropdownVisible(true)}
                  />
                  {dropdownVisible && (
                    <div className="absolute top-full left-0 border rounded shadow-lg max-h-48 overflow-y-auto z-10 bg-white">
                      {filteredTags.map((tag) => (
                        <div
                          key={tag._id}
                          className="p-2 hover:bg-gray-200 cursor-pointer"
                          onClick={() => handleTagSelect(tag)}
                        >
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap mt-4 space-x-2">
                  {watch("images").map((image: File, index: number) => (
                    <div key={index} className="relative w-20 h-20">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Selected ${index}`}
                        layout="fill"
                        className="rounded"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap mt-4 space-x-2">
                  {watch("videos").map((video: File, index: number) => (
                    <div key={index} className="relative w-24 h-20">
                      <video
                        src={URL.createObjectURL(video)}
                        controls
                        className="rounded w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="btn btn-primary px-5"
                  >
                    {isSubmitting ? <span className="loading loading-spinner loading-lg"></span> : "Post"}
                  </button>
                </div>
              </form>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadCard;
