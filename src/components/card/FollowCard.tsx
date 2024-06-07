// components/card/FollowCard.tsx
import Image from "next/image";
import React from "react";

interface FollowCardProps {
  username: string;
  fullName: string;
  followers: string[]; // Corrected type
  avatar: string;
}

function FollowCard({ username, fullName, followers, avatar }: FollowCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded border-b border-gray-600">
      <div className="flex items-center">
        <Image
          src={avatar || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
          alt="Avatar"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="ml-4">
          <div className="font-bold">{username}</div>
          <div className="text-gray-600">{fullName}</div>
          <div className="text-gray-500 text-sm">{followers.length} followers</div>
        </div>
      </div>
      <button className="border border-gray-600 px-5 rounded-lg py-1 text-sm font-semibold">
        Follow
      </button>
    </div>
  );
}

export default FollowCard;
