"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { FaUserEdit, FaRegSave } from "react-icons/fa";
import { RiUserFollowFill } from "react-icons/ri";
import { SlUserFollowing } from "react-icons/sl";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import PostCard from "@/components/card/PostCard";
import FollowerCard from "@/components/card/FollowerCard";
import mongoose from "mongoose";

interface Follower {
  _id: string;
  username: string;
  fullName: string;
  followers?: string[]; // Optional followers field
  following?: string[]; // Optional following field
  avatar: string;
}



function SettingPage() {
  const { data: session } = useSession();
  const user: User = session?.user;

  const [buttonChange, setButtonChange] = useState("user");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFollowers, setLoadingFollowers] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState("saved");
  const [threads, setThreads] = useState([]);
  const [dynamicData, setDynamicData] = useState<Follower[]>([]);
  const [loadingDynamic, setLoadingDynamic] = useState<boolean>(false);
  const [isFollowOrFollowing, setIsFollowOrFollowing] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    username: "",
    email: "",
    bio: "",
  });

  const handlebuttonChange = (tab: string) => {
    setButtonChange(tab);
    if (tab === "followers" || tab === "following") {
      fetchDetails(tab);
    }
  };

  const fetchDetails = useCallback(async (type: string) => {
    setLoadingDynamic(true);
    try {
      const response = await axios.get<any>(`/api/user/followers?type=${type}`);
      if (response.data.success) {
        setDynamicData(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        `Error while fetching ${type} details`;
      toast.error(errorMessage);
    } finally {
      setLoadingDynamic(false);
    }
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axios.get<any>("/api/profile");
      if (response.data.success) {
        setUserDetails(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
      toast.error(errorMessage);
    }
  }, []);


  
  useEffect(() => {
    if (session) {
      fetchUserDetails();
      
    }
  }, [session, fetchUserDetails]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setUserDetails((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put<ApiResponse>(
        "/api/update-profile",
        userDetails
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while updating user details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = useCallback(async () => {
    setLoading(true);
    setActiveButton("saved")
    try {
      const response = await axios.get<any>(`/api/thread/save-post`);
      if (response.data.success) {
        setThreads(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching saved posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLikedPosts = useCallback(async () => {
    setLoading(true);
    setActiveButton("liked")
    try {
      const response = await axios.get<any>(`/api/thread/like`);
      if (response.data.success) {
        setThreads(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching liked posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);


  
  




  return (
    <div className="flex pt-8">
      <aside className="bg-secondary-content xl:w-40 lg:w-32 w-20 flex-shrink-0 mt-4">
        <div className="flex flex-col items-center lg:items-stretch py-4">
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-3 cursor-pointer ${
              buttonChange === "user" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("user")}
          >
            <FaUserEdit className="text-2xl" />
            <span className="hidden lg:block">User Details</span>
          </div>
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer ${
              buttonChange === "save" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("save")}
          >
            <FaRegSave className="text-2xl" />
            <span className="hidden lg:block">Save</span>
          </div>
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer ${
              buttonChange === "followers" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("followers")}
          >
            <RiUserFollowFill className="text-2xl" />
            <span className="hidden lg:block">Followers</span>
          </div>
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer ${
              buttonChange === "following" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("following")}
          >
            <SlUserFollowing className="text-2xl" />
            <span className="hidden lg:block">Following</span>
          </div>
        </div>
      </aside>
      {buttonChange === "user" && (
        <main className="py-20 mx-auto">
          <div className="card border-x  md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl">
            <div className="card-body">
              <form className="flex flex-col gap-5" onSubmit={handleUpdate}>
                <div className="flex flex-col md:flex-row gap-5">
                  <label
                    htmlFor="fullName"
                    className="block w-1/3 mt-2 font-bold mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={userDetails.fullName}
                    onChange={handleInputChange}
                    className="input input-bordered input-info w-full max-w-xs"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                  <label
                    htmlFor="username"
                    className="block w-1/3 mt-2 font-bold mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={userDetails.username}
                    onChange={handleInputChange}
                    className="input input-bordered input-info w-full max-w-xs"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                  <label
                    htmlFor="email"
                    className="block w-1/3 mt-2 font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="text"
                    placeholder="Email"
                    value={userDetails.email}
                    disabled
                    className="input input-bordered input-info w-full max-w-xs"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                  <label
                    htmlFor="bio"
                    className="block w-1/3 mt-2 font-bold mb-2"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="textarea textarea-info w-full max-w-xs"
                    placeholder="Bio"
                    value={userDetails.bio}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="card-actions justify-start mt-5">
                  <button
                    type="submit"
                    className="btn btn-outline px-8"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-infinity loading-lg"></span>
                    ) : (
                      "Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      )}
      {buttonChange === "save" && (
        <main className="py-16 mx-auto">
          <div className="card  md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl border-x">
            <div className="card-body">
              <div className="flex gap-5">
                <button
                  className={`${
                    activeButton === "saved" ? "bg-base-content" : ""
                  } btn-outline btn text-gray-400 px-10 w-1/2`}
                  onClick={fetchSavedPosts}
                >
                  Saved
                </button>
                <button
                  className={`${
                    activeButton === "liked" ? "bg-base-content" : ""
                  } btn-outline btn text-gray-400 px-10 w-1/2`}
                  onClick={fetchLikedPosts}
                >
                  Liked
                </button>
              </div>
              {loading ? (
            <div className="flex flex-col justify-center items-center">
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
            <div className="py-10 flex flex-col justify-center items-center">
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
        </main>
      )}
      {buttonChange === "followers" && (
        <main className="py-20 mx-auto">
          <div className="card  md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl">
            <div className="card-body">
              {loadingDynamic ? (
                <div className="flex justify-center items-center">
                <span className="loading loading-bars loading-xs"></span>
                <span className="loading loading-bars loading-sm"></span>
                <span className="loading loading-bars loading-md"></span>
                <span className="loading loading-bars loading-lg"></span>
              </div>
              ) : (dynamicData.length > 0 ? (dynamicData.map((follower, index) => (
                <FollowerCard key={index}
                userId={follower._id}
                fullName={follower.fullName}
                username={follower.username}
                followers={follower.followers}
                avatar={follower.avatar}
                isFollowOrFollowing={false}
                 />
              ))) : ( "No follower found")
              )}
            </div>
          </div>
        </main>
      )}
      {buttonChange === "following" && (
        <main className="py-20 mx-auto">
        <div className="card  md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl">
          <div className="card-body">
            {loadingDynamic ? (
              <div className="flex justify-center items-center">
              <span className="loading loading-bars loading-xs"></span>
              <span className="loading loading-bars loading-sm"></span>
              <span className="loading loading-bars loading-md"></span>
              <span className="loading loading-bars loading-lg"></span>
            </div>
            ) : (dynamicData.length > 0 ? (dynamicData.map((follower, index) => (
              <FollowerCard key={index}
              userId={follower._id}
              fullName={follower.fullName}
              username={follower.username}
              followers={follower.followers}
              avatar={follower.avatar}
              isFollowOrFollowing={true}
               />
            ))) : ( "No follower found")
            )}
          </div>
        </div>
      </main>
      )}
      <ToastContainer />
    </div>
  );
}

export default SettingPage;
