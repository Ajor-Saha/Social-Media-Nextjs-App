"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineClose } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import axios, { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { communitySchema } from "@/schemas/communitySchema";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

const CommunityPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { data: session } = useSession();
  const user: User = session?.user;

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: "",
      description: "",
      coverImage: null as File | null,
    },
  });

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setValue("coverImage", files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const onSubmit = async (data: z.infer<typeof communitySchema>) => {
    console.log("Form submitted with data:", data);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);

    if (data.coverImage) {
      formData.append("coverImage", data.coverImage);
    }

    try {
      const res = await axios.post("/api/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Community created successfully");
        setIsModalOpen(false);
        reset();
        setImageUrl("");
      } else {
        toast.error("Error creating community: " + res.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data.message || "Unknown error";
      toast.error("Error creating community: " + errorMessage);
    }
  };

  return (
    <div className="py-20 flex flex-col justify-center items-center">
      <ToastContainer />
      <div className="card md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl border-x">
        <div className="card-body">
          <div className="flex gap-5 justify-center items-center">
            <button className="btn btn-neutral md:px-20 px-16">Top</button>
            <button className="btn btn-neutral md:px-20 px-16">Recent</button>
          </div>
        </div>
      </div>
      <div
        onClick={openModal}
        className="fixed lg:bottom-10 lg:right-10 bottom-5 right-5 z-50 bg-base-300 lg:px-7 lg:py-4 px-5 py-3 border border-slate-700 rounded-lg cursor-pointer"
      >
        <FaPlus />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px]">
            <div className="card-body">
              <button
                className="absolute top-2 right-2 rounded-full p-1"
                onClick={closeModal}
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="card-title">Create New Community</h2>
              <form className="py-2" onSubmit={handleSubmit(onSubmit)}>
                <input
                  type="text"
                  placeholder="Name of the Community"
                  className="input input-bordered input-success w-72 md:w-[400px] lg:w-[500px] mb-8"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500">{`${errors.name.message}`}</p>
                )}
                <textarea
                  className="textarea textarea-success w-72 md:w-[400px] lg:w-[500px]"
                  placeholder="Description"
                  {...register("description")}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500">{`${errors.description.message}`}</p>
                )}
                <label htmlFor="pic" className="block py-2 px-2 font-semibold">
                  Choose a cover Image
                </label>
                <input
                  type="file"
                  className="file-input w-72 md:w-[400px] lg:w-[500px] mb-5"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imageUrl && <img src={imageUrl} alt="Cover" className="mt-2 w-32 h-24 p-2" />}
                {errors.coverImage && (
                  <p className="text-red-500">{`${errors.coverImage.message}`}</p>
                )}
                <button
                  className="btn btn-success file-input-bordered w-72 md:w-[400px] lg:w-[500px]"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
