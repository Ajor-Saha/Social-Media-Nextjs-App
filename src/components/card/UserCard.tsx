"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserCardProps {
  userId: string;
  username: string;
  avatar: string;
  followers: string[];
}

function UserCard({ userId, username, avatar, followers }: UserCardProps) {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [isFollow, setIsFollow] = useState(false);

  useEffect(() => {
    if (user?._id && followers.includes(user._id)) {
      setIsFollow(true);
    } else {
      setIsFollow(false);
    }
  }, [user, followers]);

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      const response = await axios.put<ApiResponse>(`/api/follow/${userId}`);
      if (response.data.success) {
        setIsFollow(!isFollow);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error when toggling follow");
    }
  };

  return (
    <div className="flex  justify-between p-4 rounded border-b border-gray-600">
      <div className="flex items-center">
        <Image
          src={
            avatar ||
            "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          }
          alt="Avatar"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="ml-4">
          <Link
            href={user?._id === userId ? "/dashboard" : `/profile/${username}`}
          >
            <p className=" font-semibold">{username}</p>
          </Link>

          <div className="text-gray-600">{username}</div>
          <div className="text-gray-500 text-sm">
            {followers?.length} followers
          </div>
        </div>
      </div>
      <ToastContainer />
      <div>
        <button
          onClick={handleFollowToggle}
          className="border border-gray-600 px-5 rounded-lg py-1 text-sm font-semibold"
        >
          {user?._id === userId ? "You" : isFollow ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}

export default UserCard;
