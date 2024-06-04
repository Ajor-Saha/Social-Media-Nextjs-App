'use client';

import PostCard from '@/components/card/PostCard';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { use, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface UserDetails {
  _id: string;
  fullName: string;
  avatar: string;
  bio: string;
  followers: { $oid: string }[];
}

interface Thread {
  _id: string;
  description: string;
  tag: { _id: string; name: string };
  images: string[];
  ownerId: { _id: string; username: string; avatar: string };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

function UserProfile() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [activeTab, setActiveTab] = useState('Threads');
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [userThreads, setUserThreads] = useState<Thread[]>([]);
  const { data: session } = useSession();
  const user: User = session?.user;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const fetchUserDetails = useCallback(async () => {
    if (!user) return; // Ensure user is available
    try {
      const response = await axios.get<ApiResponse>(`/api/user/${username}`);
      if (response.data.success) {
        const userDetails = response.data.data as UserDetails;
        setUserDetails(userDetails);
        setIsFollowed(userDetails.followers.some((follower) => follower.$oid === user.id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Error fetching user details');
    }
  }, [username, user]);

  const handleFollowToggle = async () => {
    if (!userDetails) return;
    try {
      const response = await axios.put<ApiResponse>(`/api/follow/${userDetails._id}`);
      if (response.data.success) {
        setIsFollowed((prevIsFollowed) => !prevIsFollowed);
        fetchUserDetails(); // Refetch user details to update followers count
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Error toggling follow status');
    }
  };

  const fetchUserThreads = useCallback(async () => {
    if (!userDetails?._id) return;
    try {
      const response = await axios.get<any>(`/api/thread/user-posts/${userDetails._id}`);
      if (response.data.success) {
        const threads = response.data.threads as Thread[];
        setUserThreads(threads);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? 'Error while fetching user threads');
    }
  }, [userDetails?._id]);

  useEffect(() => {
    if (username && user) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, username, user]);

  useEffect(() => {
    if (userDetails?._id) {
      fetchUserThreads();
    }
  }, [fetchUserThreads, userDetails?._id]);
  
 // console.log(userThreads);
  

  return (
    <div className="py-20 flex flex-col justify-center items-center">
      <div className="card md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center flex-col">
              <h1 className="text-lg font-bold">{userDetails?.fullName}</h1>
              <h3 className="font-semibold text-sm">{username}</h3>
            </div>
            <div className="flex items-center">
              <Image
                src={userDetails?.avatar || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                alt="Avatar"
                width={50}
                height={50}
                className="rounded-full cursor-pointer"
              />
            </div>
          </div>
          <div className="avatar-group -space-x-6 rtl:space-x-reverse">
            <div className="avatar">
              <div className="w-12">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
              </div>
            </div>
            <div className="avatar">
              <div className="w-12">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
              </div>
            </div>
            <span className="px-7 mt-5 text-sm font-sans">{userDetails?.followers?.length || "0"} followers</span>
          </div>
          <div className="py-5">
            <p>{userDetails?.bio}</p>
          </div>
          <div className='flex justify-center items-center'>
            <button onClick={handleFollowToggle} className="btn btn-outline btn-success w-full text-lg">
              {isFollowed ? "Following" : "Follow"}
            </button>
          </div>
          <div className="mx-auto mt-5 flex flex-col justify-center items-center w-2/3">
            <div className="relative right-0">
              <ul className="relative gap-10 flex flex-wrap p-1 list-none rounded-xl bg-blue-gray-50/60" data-tabs="tabs" role="list">
                <li className="z-30 pr-5 flex-auto text-center">
                  <a className={`z-30 border-b-2 flex items-center justify-center w-full px-0 py-1 mb-0 transition-all ease-in-out border-0 rounded-lg cursor-pointer bg-inherit ${activeTab === "Threads" ? "active" : ""} ${activeTab === "Threads" ? "border-b-2 border-gray-600" : ""}`} data-tab-target="" role="tab" aria-selected={activeTab === "Threads"} aria-controls="Threads" onClick={() => handleTabChange("Threads")}>
                   Threads
                  </a>
                </li>
                <li className="z-30 flex-auto text-center">
                  <a className={`z-30 flex items-center justify-center w-full px-0 py-1 mb-0 transition-all ease-in-out border-0 rounded-lg cursor-pointer  bg-inherit ${activeTab === "Replies" ? "active" : ""} ${activeTab === "Replies" ? "border-b-2 border-gray-600" : ""}`} data-tab-target="" role="tab" aria-selected={activeTab === "Replies"} aria-controls="Replies" onClick={() => handleTabChange("Replies")}>
                    <span className="ml-1">Replies</span>
                  </a>
                </li>
              </ul>
              <div data-tab-content="" className="p-5">
                <div className={`block ${activeTab === "Threads" ? "opacity-100" : "hidden opacity-0"}`} id="Threads" role="tabpanel">
                {userThreads.length > 0 ? (
                    userThreads.map((thread) => (
                      <PostCard
                        key={thread._id}
                        threadId={thread._id}
                        description={thread.description}
                        tag={thread.tag}
                        images={thread.images}
                        owner={thread.ownerId}
                      />
                    ))
                  ) : (
                    <p>No threads available.</p>
                  )}
                </div>
                <div className={`block ${activeTab === "Replies" ? "opacity-100" : "hidden opacity-0"}`} id="Replies" role="tabpanel">
                  <p className="block font-sans text-base antialiased font-light leading-relaxed text-inherit text-blue-gray-500">
                    All Replies are here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
