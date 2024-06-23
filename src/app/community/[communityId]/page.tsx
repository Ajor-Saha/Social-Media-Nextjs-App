"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AiFillHome,
  AiFillSetting,
  AiOutlineClose,
  AiOutlineUser,
} from "react-icons/ai";
import { FaEdit, FaRegEdit } from "react-icons/fa";
import { GoPlusCircle } from "react-icons/go";
import { FaRegImages } from "react-icons/fa6";
import { IoMdVideocam } from "react-icons/io";
import UserCard from "@/components/card/UserCard";
import CommunityThreadCard from "@/components/card/CommunityThreadCard";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import EditCommunity from "@/components/community/EditCommunity";
import AdminCommunity from "@/components/community/AdminCommunity";

function UserCommunityPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams<{ communityId: string }>();
  const communityId = params.communityId;
  const [community, setCommunity] = useState<any>({});
  const [threads, setThreads] = useState<any[]>([]);
  const [members, setMembers] = useState<any>({});
  const [isJoined, setIsJoined] = useState(false);
  const { data: session } = useSession();
  const user: User = session?.user;

  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [buttonChange, setButtonChange] = useState("home");
  const [loading, setLoading] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlebuttonChange = (tab: string) => {
    setButtonChange(tab);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchCommunityDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/community/${communityId}`
      );
      if (response.data.success) {
        setCommunity(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching community details";
      toast.error(errorMessage);
    }
  }, [communityId]);

  const fetchCommunityMembersDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/community/members/${communityId}`
      );
      if (response.data.success) {
        setMembers(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching community details";
      toast.error(errorMessage);
    }
  }, [communityId]);

  const fetchCommunityThreads = useCallback(
    async (page = 1) => {
      try {
        const response = await axios.get<any>(
          `/api/community/add-post/${communityId}?page=${page}`
        );
        if (response.data.success) {
          setThreads((prevThreads) => [...prevThreads, ...response.data.data]);
          setHasMore(response.data.data.length > 0);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        let errorMessage =
          axiosError.response?.data.message ?? "Error while fetching threads";
        toast.error(errorMessage);
      }
    },
    [communityId]
  );

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
      fetchCommunityMembersDetails();
      fetchCommunityThreads();
    }
  }, [
    communityId,
    fetchCommunityDetails,
    fetchCommunityMembersDetails,
    fetchCommunityThreads,
  ]);

  useEffect(() => {
    if (user && community.members?.includes(user._id)) {
      setIsJoined(true);
    }
  }, [community.members, user]);

  // console.log(community);

  const handleJoinToggle = async () => {
    try {
      const response = await axios.put<ApiResponse>(
        `/api/community/${communityId}`
      );
      if (response.data.success) {
        setIsJoined((prevIsFollowed) => !prevIsFollowed);
        fetchCommunityDetails(); // Refetch user details to update followers count
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message ?? "Error toggling follow status"
      );
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("tag", tag);
    images.forEach((image) => formData.append("images", image));
    videos.forEach((video) => formData.append("videos", video));

    try {
      const response = await axios.post<ApiResponse>(
        `/api/community/add-post/${communityId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Post created successfully");
        closeModal();
        setDescription("");
        setTag("");
        setImages([]);
        setVideos([]);
        fetchCommunityDetails(); // Refresh community details to show the new post
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "images" | "videos"
  ) => {
    const files = Array.from(e.target.files || []);
    if (type === "images") {
      setImages(files);
    } else {
      setVideos(files);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchCommunityThreads(nextPage);
    setCurrentPage(nextPage);
  };

  const isAdmin = user && community.admin?.includes(user._id);

  return (
    <div className="flex pt-8">
      <aside className="bg-secondary-content xl:w-40 lg:w-32 w-20 flex-shrink-0 mt-4">
        <div className="flex flex-col items-center lg:items-stretch py-4">
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-3 cursor-pointer ${
              buttonChange === "home" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("home")}
          >
            <AiFillHome className="text-2xl" />
            <span className="hidden lg:block">Home</span>
          </div>
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer ${
              buttonChange === "edit" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("edit")}
          >
            <FaRegEdit className="text-2xl" />
            <span className="hidden lg:block">Edit</span>
          </div>
          <div
            className={`flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer ${
              buttonChange === "admin" ? "bg-accent" : ""
            }`}
            onClick={() => handlebuttonChange("admin")}
          >
            <AiOutlineUser className="text-2xl" />
            <span className="hidden lg:block">Admin</span>
          </div>
        </div>
      </aside>
      {buttonChange === "home" && (
        <main className="flex flex-col items-center pt-10 mx-auto">
          <div className="card w-[350px] border-b border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[585px] lg:h-[600px] md:ml-24 bg-base-100 shadow-xl">
            <div className="relative">
              <figure className="h-[300px] lg:h-[350px]">
                <Image
                  src={
                    community?.coverImage ||
                    "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                  }
                  alt="Shoes"
                  className="rounded-xl w-full"
                  width={400}
                  height={300}
                />
              </figure>
              <button className="absolute bottom-2 right-2 p-2 rounded-full shadow hover:bg-gray-200">
                <FaEdit className="text-gray-700" size={25} />
              </button>
            </div>
            <div className="gap-5">
              <h2 className="card-title p-2">{community.name}</h2>
              <p className="p-2">{community.description}</p>
              <div>
                <button
                  onClick={handleJoinToggle}
                  className="btn btn-outline btn-info m-4 px-10"
                >
                  {isJoined ? "Joined" : "Join"}
                </button>
                <span>{community.members?.length} members</span>
              </div>
              <div className="flex gap-5 px-10">
                <button
                  className={`font-semibold ${
                    activeTab === "home" ? "border-b-2 border-gray-500" : ""
                  }`}
                  onClick={() => handleTabChange("home")}
                >
                  Home
                </button>
                <button
                  className={`font-semibold ${
                    activeTab === "about" ? "border-b-2 border-gray-500" : ""
                  }`}
                  onClick={() => handleTabChange("about")}
                >
                  About
                </button>
                <button
                  className={`font-semibold ${
                    activeTab === "post" ? "border-b-2 border-gray-500" : ""
                  }`}
                  onClick={() => handleTabChange("post")}
                >
                  Post
                </button>
                <button
                  className={`font-semibold ${
                    activeTab === "user" ? "border-b-2 border-gray-500" : ""
                  }`}
                  onClick={() => handleTabChange("user")}
                >
                  User
                </button>
              </div>
            </div>
          </div>
          <div className="w-full mt-4 p-4 flex flex-col justify-center items-center">
            {activeTab === "home" && (
              <div className="card w-[350px] border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[570px] lg:h-[600px] md:ml-24 bg-base-100 shadow-xl mx-auto">
                <div className="flex flex-col justify-center items-center lg:gap-10">
                  <button
                    onClick={openModal}
                    className="flex gap-10 border w-full justify-between items-center rounded-xl py-3 px-5"
                  >
                    <p className="text-lg font-semibold text-gray-500">
                      Create New Community Post...
                    </p>
                    <GoPlusCircle size={30} className="" />
                  </button>

                  <div className="carousel h-[270px] rounded-box w-[400px] md:w-[450px] lg:w-[500px] ml-4 border-x p-2 mt-10">
                    {members.admins?.map((user: any) => (
                      <div className="carousel-item w-1/2" key={user._id}>
                        <div className="flex flex-col mx-auto pt-5">
                          <div className="avatar">
                            <div className="w-24 rounded-full">
                              <Image
                                width={24}
                                height={24}
                                alt="pic"
                                src={
                                  user?.avatar ||
                                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                                }
                              />
                            </div>
                          </div>
                          <h1 className="font-bold mt-1">{user.username}</h1>
                          <p>{user.followers?.length} followers</p>
                          <p>admin</p>
                          <button className="btn mt-3 outline">Follow</button>
                        </div>
                      </div>
                    ))}

                    {members.members?.map((user: any) => (
                      <div className="carousel-item w-1/2" key={user._id}>
                        <div className="flex flex-col mx-auto pt-5">
                          <div className="avatar">
                            <div className="w-24 rounded-full">
                              <Image
                                width={24}
                                height={24}
                                alt="pic"
                                src={
                                  user?.avatar ||
                                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                                }
                              />
                            </div>
                          </div>
                          <h1 className="font-bold mt-1">{user.username}</h1>
                          <p>member</p>
                          <p>{user.followers?.length} followers</p>
                          <button className="btn mt-3 outline">Follow</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "about" && (
              <div className="card w-[350px] overflow-y-auto border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[300px] lg:h-[400px] md:ml-24 bg-base-100 shadow-xl">
                {community?.about}
              </div>
            )}
            {activeTab === "post" && (
              <div className="card w-[350px] flex flex-col justify-center items-center border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px]  md:ml-24 bg-base-100 shadow-xl">
                {threads.length > 0 ? (
                  <>
                    {threads.map((thread) => (
                      <CommunityThreadCard key={thread.id} thread={thread} />
                    ))}
                    {hasMore && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handleLoadMore}
                          className="btn btn-primary"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No posts available</p>
                )}
              </div>
            )}
            {activeTab === "user" && (
              <div className="card  overflow-y-auto w-[350px] border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[570px] lg:h-[600px] md:ml-24 bg-base-100 shadow-xl">
                {members.admins?.map((user: any) => (
                  <UserCard
                    key={user._id}
                    userId={user._id}
                    username={user.username}
                    avatar={user?.avatar}
                    followers={user.followers}
                  />
                ))}
                {members.members?.map((user: any) => (
                  <UserCard
                    key={user._id}
                    userId={user._id}
                    username={user.username}
                    avatar={user?.avatar}
                    followers={user.followers}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}
      {buttonChange === "edit" && <EditCommunity community={community} />}
      {isAdmin && buttonChange === "admin" ? (
        <AdminCommunity />
      ) : (
        buttonChange === "admin" && (
          <div className="flex flex-col items-center pt-20 mx-auto w-full font-extrabold text-lg">
            You are not Admin of this Community
          </div>
        )
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
          <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px] ">
            <div className="card-body">
              <button
                className="absolute top-2 right-2 rounded-full p-1"
                onClick={closeModal}
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="card-title">Create New Community Post</h2>
              <form className="py-2" onSubmit={handleFormSubmit}>
                <textarea
                  className="textarea textarea-success w-72 md:w-[400px] lg:w-[500px] mb-2"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <input
                  type="text"
                  placeholder="Add Tag here"
                  className="input input-bordered input-success w-72 md:w-[400px] lg:w-[500px] mb-2"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                />

                <div className="flex gap-8 py-2">
                  <div className="p-5 rounded-lg w-14  mb-5">
                    <label htmlFor="images">
                      <FaRegImages size={24} />
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
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt="Selected Image"
                            width={300}
                            height={300}
                            className="m-1 rounded-md w-52 h-52"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 rounded-lg w-14 mb-5">
                    <label htmlFor="videos">
                      <IoMdVideocam size={24} />
                    </label>
                    <input
                      type="file"
                      id="videos"
                      multiple
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, "videos")}
                    />
                    <div className="mt-2">
                      {videos.map((video, index) => (
                        <div key={index} className="relative">
                          <video
                            src={URL.createObjectURL(video)}
                            controls
                            width={300}
                            height={300}
                            className="m-1 rounded-md h-52 w-96"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-success file-input-bordered  w-72 md:w-[400px] lg:w-[500px]"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default UserCommunityPage;
