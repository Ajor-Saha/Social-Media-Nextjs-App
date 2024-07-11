"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import PostCard from "@/components/card/PostCard";

function UserDashboard() {
  const { data: session } = useSession();
  const user: User = session?.user;

  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  const [activeTab, setActiveTab] = useState("Threads");
  const [showModal, setShowModal] = useState(false);

  const [userDetails, setUserDetails] = useState<any>({ fullName: "", avatar: "" });
  const [threads, setThreads] = useState<any[]>([]); // State to store threads

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/profile");
      if (response.data.success) {
        setUserDetails(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? "Error while fetching user details";
      toast.error(errorMessage);
    }
  }, []);

  const fetchUserThreads = useCallback(async () => {
    if (!userDetails._id) return; // Ensure userDetails are fetched
    try {
      const response = await axios.get<any>(`/api/thread/user-posts/${userDetails._id}`);
      if (response.data.success) {
        setThreads(response.data.threads);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? "Error while fetching user threads";
      toast.error(errorMessage);
    }
  }, [userDetails._id]);

  useEffect(() => {
    if (session) {
      fetchUserDetails();
    }
  }, [session, fetchUserDetails]);

  useEffect(() => {
    if (userDetails._id) {
      fetchUserThreads();
    }
  }, [userDetails._id, fetchUserThreads]);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.put<ApiResponse>("/api/update-profile", {
        fullName,
        bio,
      });
      if (response.data.success) {
        toast.success("User details updated successfully");
        setUserDetails(response.data.data);
        setShowModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message ?? "Error updating user details";
      toast.error(errorMessage);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append("image", event.target.files[0]);

      try {
        const response = await axios.put<ApiResponse>("/api/profile/change-avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          toast.success("Profile picture updated successfully");
          fetchUserDetails(); // Refetch user details to update the avatar
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        let errorMessage = axiosError.response?.data.message ?? "Error updating profile picture";
        toast.error(errorMessage);
      }
    }
  };



  return (
    <div className="py-20 flex flex-col justify-center items-center">
      <div className="card border-x border-gray-100 md:w-[550px] lg:w-[650px] sm:w-[500px] w-[400px] bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center flex-col">
              <h1 className="text-lg font-bold">{userDetails?.fullName}</h1>
              <h3 className="font-semibold text-sm">{user?.username}</h3>
            </div>
            <div className="flex items-center avatar">
              <label htmlFor="profilePictureInput">
                <Image
                  src={userDetails.avatar || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                  alt="Avatar Right"
                  width={40}
                  height={40}
                  className="w-24 cursor-pointer rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                />
              </label>
              <input
                type="file"
                id="profilePictureInput"
                style={{ display: "none" }}
                onChange={handleProfilePictureChange}
              />
            </div>
          </div>
          <div className="avatar-group -space-x-6 rtl:space-x-reverse">
            <div className="avatar">
              <div className="w-12">
                <Image alt="pic" height={200} width={300} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
              <Image alt="pic" height={200} width={300} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
              <Image alt="pic" height={200} width={300} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
              </div>
            </div>
            <span className="px-7 mt-5 text-sm font-sans">5 followers</span>
          </div>
          <div className="py-5">
            <p>{userDetails.bio}</p>
          </div>
          <div className="mx-auto">
            <button
              className="btn btn-active btn-ghost px-32 md:px-52"
              onClick={() => setShowModal(true)}
            >
              Edit
            </button>
          </div>
          <div className="mx-auto  mt-5 flex flex-col justify-center items-center">
            <div className="relative right-0">
              <ul className="flex space-x-4  mb-4 border-b-2  border-gray-200 justify-between">
                <li className={`cursor-pointer w-40 md:w-52 pb-2 ${activeTab === "Threads" ? "border-b-2 border-gray-700 text-blue-500" : ""}`} onClick={() => handleTabChange("Threads")}>
                  <span className="ml-20">Posts</span>
                </li>
                <li className={`cursor-pointer w-40 sm:w-52 pb-2 ${activeTab === "Replies" ? "border-b-2 border-gray-700 text-blue-500" : ""}`} onClick={() => handleTabChange("Replies")}>
                <span className="ml-10">Replies</span>
                </li>
              </ul>
              <div>
                <div className={`${activeTab === "Threads" ? "block" : "hidden"}`}>
                  {threads.length > 0 ? (
                    threads.map((thread) => (
                      <PostCard
                        key={thread._id}
                        threadId={thread._id}
                        description={thread.description}
                        tag={thread.tag}
                        images={thread.images}
                        owner={thread.ownerId}
                        videos={thread.videos}
                        comments={thread.comments}
                      />
                    ))
                  ) : (
                    <p>No threads available.</p>
                  )}
                </div>
                <div className={`${activeTab === "Replies" ? "block" : "hidden"}`}>
                  <p className="font-sans text-base font-light text-gray-500">
                    All Replies are here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 p-6 relative">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="fullName"
                  className="block text-sm text-gray-700 font-bold mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="bio"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default UserDashboard;
