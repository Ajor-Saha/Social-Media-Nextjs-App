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

interface FollowCardProps {
  userId: string;
  username: string;
  fullName: string;
  followers?: string[]; // Corrected type
  following?: string[];
  avatar: string;
  isFollowOrFollowing: boolean;
}

function FollowerCard({
  userId,
  username,
  fullName,
  followers,
  avatar,
  isFollowOrFollowing
}: FollowCardProps) {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [isFollow, setIsFollow] = useState(false);

  

  return (
    <div className="flex items-center justify-between p-4 rounded border-b border-gray-600">
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
          <div className="text-gray-600">{fullName}</div>
          <div className="text-gray-500 text-sm">
            {followers?.length} followers
          </div>
        </div>
      </div>
      <button
        
        className="border border-gray-600 px-5 rounded-lg py-1 text-sm font-semibold"
      >
        {isFollowOrFollowing ? "UnFollow" : "Remove"}
      </button>
    </div>
  );
}

export default FollowerCard;
