"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Community {
  _id: string;
  name: string;
  description: string;
  about: string;
  threads: string[];
  members: string[];
  admin: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EditCommunityProps {
  community: Community;
}

const EditCommunity: React.FC<EditCommunityProps> = ({ community }) => {
  const [description, setDescription] = useState(community.description);
  const [about, setAbout] = useState(community.about || "");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/community/update-community/${community._id}`,
        {
          description,
          about,
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Community details updated successfully"
        );

        // Update the UI with the new values
        setDescription(response.data.community.description);
        setAbout(response.data.community.about);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ?? "Error updating community details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 flex flex-col justify-center items-center mx-auto">
      <div className="card card-side bg-base-100 shadow-xl border-x border-gray-200 md:w-[550px] lg:w-[700px] sm:w-[500px] w-[400px] flex flex-col lg:flex-row">
        <div className="card-body">
          <h1 className="text-center text-xl font-semibold pb-5">
            Update {community?.name} Community Details
          </h1>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="description" className="font-semibold">
              Edit Community Description
            </label>
            <textarea
              className="textarea textarea-info w-full my-5"
              placeholder="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <label htmlFor="about" className="py-3 font-semibold">
              Edit Community About
            </label>
            <textarea
              className="textarea textarea-info w-full my-5"
              placeholder="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            ></textarea>
            <div className="card-actions justify-end">
              <button
                type="submit"
                className="btn btn-outline btn-info mt-2 px-8"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-lg"></span>
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
};

export default EditCommunity;
