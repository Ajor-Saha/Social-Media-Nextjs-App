import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Image from 'next/image'
import React from 'react'

interface UserCardProps {
  userId: string;
  username: string;
  avatar: string;
  followers: string[];
}


function UserCard({ userId, username, avatar, followers }: UserCardProps) {

  const { data: session } = useSession();
  const user: User = session?.user;

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
          <div className="text-gray-600">{username}</div>
          <div className="text-gray-500 text-sm">{followers?.length} followers</div>
        </div>
      </div>
      
      <button className="border border-gray-600 px-5 rounded-lg py-1 text-sm font-semibold">
        {user?._id === userId ? "You" : "Follow"}
        </button>
    </div>
  )
}

export default UserCard
