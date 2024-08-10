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

  const [userDetails, setUserDetails] = useState<any>({
    fullName: "",
    avatar: "",
  });
  const [threads, setThreads] = useState<any[]>([]); // State to store threads
  const [userReplies, setUserReplies] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(true);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

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
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
      toast.error(errorMessage);
    }
  }, []);

  const fetchUserThreads = useCallback(async () => {
    if (!userDetails._id) return;
    setLoadingThreads(true);
    try {
      const response = await axios.get<any>(
        `/api/thread/user-posts/${userDetails._id}`
      );
      if (response.data.success) {
        setThreads(response.data.threads);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user threads";
      toast.error(errorMessage);
    } finally {
      setLoadingThreads(false);
    }
  }, [userDetails._id]);

  const fetchUserReplies = useCallback(async () => {
    setLoadingReplies(true);
    try {
      const response = await axios.get<any>(
        `/api/thread/reply/${userDetails?._id}`
      );
      if (response.data.success) {
        setUserReplies(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching user details";
      toast.error(errorMessage);
    } finally {
      setLoadingReplies(false);
    }
  }, [userDetails?._id]);

  useEffect(() => {
    if (session) {
      fetchUserDetails();
    }
  }, [session, fetchUserDetails]);

  useEffect(() => {
    if (userDetails._id) {
      fetchUserThreads();
      fetchUserReplies();
    }
  }, [userDetails._id, fetchUserThreads, fetchUserReplies]);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put<ApiResponse>("/api/update-profile", {
        fullName,
        bio,
      });
      if (response.data.success) {
        setUserDetails(response.data.data);
        setShowModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ?? "Error updating user details";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append("image", event.target.files[0]);

      try {
        const response = await axios.put<ApiResponse>(
          "/api/profile/change-avatar",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          toast.success("Profile picture updated successfully");
          fetchUserDetails(); // Refetch user details to update the avatar
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        let errorMessage =
          axiosError.response?.data.message ?? "Error updating profile picture";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="py-20 flex flex-col justify-center items-center">
      <div className="card md:border-x border-gray-100 md:w-[550px] lg:w-[650px] sm:w-[500px] w-[400px] bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center flex-col">
              <h1 className="text-lg font-bold">{userDetails?.fullName}</h1>
              <h3 className="font-semibold text-sm">{user?.username}</h3>
            </div>
            <div className="flex items-center avatar">
              <label htmlFor="profilePictureInput">
                <Image
                  src={
                    userDetails.avatar ||
                    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  }
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
                <Image
                  alt="pic"
                  height={200}
                  width={300}
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
                <Image
                  alt="pic"
                  height={200}
                  width={300}
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
                <Image
                  alt="pic"
                  height={200}
                  width={300}
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                />
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
                <li
                  className={`cursor-pointer w-40 md:w-52 pb-2 ${
                    activeTab === "Threads"
                      ? "border-b-2 border-gray-700 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleTabChange("Threads")}
                >
                  <span className="ml-20">Posts</span>
                </li>
                <li
                  className={`cursor-pointer w-40 sm:w-52 pb-2 ${
                    activeTab === "Replies"
                      ? "border-b-2 border-gray-700 text-blue-500"
                      : ""
                  }`}
                  onClick={() => handleTabChange("Replies")}
                >
                  <span className="ml-10">Replies</span>
                </li>
              </ul>
              <div>
                <div
                  className={`${
                    activeTab === "Threads" ? "block" : "hidden"
                  } flex flex-col justify-center items-center`}
                >
                  {loadingThreads ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-4 w-96 py-5 overflow-hidden"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                          <div className="flex flex-col gap-4">
                            <div className="skeleton h-4 w-20"></div>
                            <div className="skeleton h-4 w-28"></div>
                          </div>
                        </div>
                        <div className="skeleton h-40 w-[350px] md:w-full"></div>
                      </div>
                    ))
                  ) : threads.length > 0 ? (
                    threads.map((thread) => (
                      <PostCard
                        key={thread?._id}
                        threadId={thread?._id}
                        description={thread?.description}
                        tag={thread?.tag}
                        images={thread?.images}
                        owner={thread?.ownerId}
                        videos={thread?.videos}
                        comments={thread?.comments}
                      />
                    ))
                  ) : (
                    <p className="font-semibold">
                      No post available. Create New post
                    </p>
                  )}
                </div>
                <div
                  className={`${
                    activeTab === "Replies" ? "block" : "hidden"
                  } flex flex-col justify-center items-center`}
                >
                  {loadingReplies ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-4 w-96 py-5 overflow-hidden"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                          <div className="flex flex-col gap-4">
                            <div className="skeleton h-4 w-20"></div>
                            <div className="skeleton h-4 w-28"></div>
                          </div>
                        </div>
                        <div className="skeleton h-40 w-[350px] md:w-full"></div>
                      </div>
                    ))
                  ) : userReplies.length > 0 ? (
                    userReplies.map((reply, index) => (
                      <div key={index}>
                        <PostCard
                          key={reply?.thread?._id}
                          threadId={reply?.thread?._id}
                          description={reply?.thread?.description}
                          tag={reply?.thread?.tag}
                          images={reply?.thread?.images}
                          owner={reply?.thread?.ownerId}
                          videos={reply?.thread?.videos}
                          comments={reply?.thread?.comments}
                        />
                        <div className="border-b-2 border-gray-500 flex flex-col">
                          <div className="flex gap-2">
                            <div className="avatar">
                              <div className="w-16 rounded-full">
                                <Image
                                  alt="pic"
                                  height={200}
                                  width={300}
                                  src={
                                    reply.owner.avatar ||
                                    "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                                  }
                                />
                              </div>
                            </div>
                            <span className="font-semibold mt-1">
                              {reply?.owner.username}
                            </span>
                          </div>
                          <div>{reply?.content}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="font-semibold">
                      No replies available for this user.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="card card-side bg-base-100 shadow-xl w-[380px] sm:w-[450px] md:w-[600px] lg:w-[750px] h-auto">
            <div className="card-body">
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
                    className="input input-bordered input-primary w-full "
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
                    className="textarea textarea-info w-full "
                    rows={3}
                  ></textarea>
                </div>
                <div className="flex gap-5 justify-end">
                  <button
                    type="button"
                    className="btn btn-warning sm:w-24"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success sm:w-24"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default UserDashboard;
