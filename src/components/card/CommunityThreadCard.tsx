import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { BsHeart } from 'react-icons/bs'
import { FaRegComment } from 'react-icons/fa'
import { GoShareAndroid } from 'react-icons/go'

function CommunityThreadCard({thread}) {
  return (
    <div className="md:w-96 w-80 lg:w-[500px] rounded overflow-hidden p-2 my-2">
      <div className="flex flex-row justify-between items-start gap-3">
        <div className="flex items-center">
          <div className="avatar mt-3 px-2">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <Image
                src={thread?.ownerId.avatar ||
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                }
                alt="Avatar"
                width={300}
                height={150}
              />
            </div>
          </div>
          <div className="ml-2 flex flex-row gap-2">
            <Link
              href="/"
            >
              <h3 className="font-semibold text-xl">{thread.ownerId?.username}</h3>
            </Link>
            <p className="font-semibold text-gray-500">1d</p>
          </div>
        </div>
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
      </div>

      <div className="px-6 pt-2">
        <div className="font-semibold text-xl mb-2">{thread.description}</div>
      </div>
      <div className="px-6 pt-4 pb-2">
        <a className="link link-primary mr-2">#{thread.tag?.name}</a>
      </div>
      <div className="w-72 md:w-96 carousel  max-w-md px-1 py-1 space-x-2 lg:space-x-1 bg-neutral">
      {thread.images && thread.images.length > 0 && thread.images.map((image, index) => (
          <div key={index} className="carousel-item w-full">
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              width={400}
              height={200}
              className="rounded-box cursor-pointer"
            />
          </div>
        ))}
        {thread.videos && thread.videos.length > 0 && thread.videos.map((video, index) => (
          <div key={index} className="carousel-item w-full">
            <video
              src={video}
              controls
              width={400}
              height={200}
              className="rounded-box cursor-pointer"
            />
          </div>
        ))}
      </div>
      <div className="pt-4 flex flex-row gap-5">
        <div className="flex">
          <button className="btn">
            <BsHeart
              size={20}
              className={`"text-red-500 font-bold"`}
            />
            <span>{thread.likes}</span>
          </button>
        </div>
        <button>
          <FaRegComment size={20} />
        </button>
        <button>
          <GoShareAndroid size={20} />
        </button>
      </div>
      <div className="divider divider-end"></div>

    </div>
  )
}

export default CommunityThreadCard
