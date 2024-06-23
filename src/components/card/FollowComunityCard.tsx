import Image from 'next/image';
import Link from 'next/link';
import React from 'react'


interface FollowCardProps {
    communityId: string;
    name: string;
    coverImage: string;
    members: string[];
  }

function FollowComunityCard({ name, communityId, coverImage, members }: FollowCardProps) {
  
    return (
        <div className="flex items-center justify-between p-4 rounded border-b border-gray-600">
          <div className="flex items-center">
          <Link href={`/community/${communityId}`}>
            <Image
              src={coverImage || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
              alt="Avatar"
              width={50}
              height={50}
              className="rounded-full"
            />
            </Link>
            <div className="ml-4">
              <Link href={`/community/${communityId}`}><div className="font-bold cursor-pointer hover:border-gray-500 hover:border-b-2">{name}</div></Link>
              <div className="text-gray-600">{name}</div>
              <div className="text-gray-500 text-sm">{members.length} followers</div>
            </div>
          </div>
          <button className="border border-gray-600 px-5 rounded-lg py-1 text-sm font-semibold">
            Follow
          </button>
        </div>
  )
}

export default FollowComunityCard
