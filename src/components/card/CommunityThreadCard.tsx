import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { BsHeart } from 'react-icons/bs'
import { FaRegComment } from 'react-icons/fa'
import { GoShareAndroid } from 'react-icons/go'

function CommunityThreadCard() {
  return (
    <div className="md:w-96 w-80 lg:w-[500px] rounded overflow-hidden p-2 my-2">
      <div className="flex flex-row justify-between items-start gap-3">
        <div className="flex items-center">
          <div className="avatar mt-3 px-2">
            <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                }
                alt="Avatar"
              />
            </div>
          </div>
          <div className="ml-2 flex flex-row gap-2">
            <Link
              href="/"
            >
              <h3 className="font-semibold text-xl">ajordev</h3>
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

      <div className="px-6 py-4">
        <div className="font-semibold text-xl mb-2">This is so good. This is good bro..</div>
      </div>
      <div className="px-6 pt-4 pb-2">
        <a className="link link-primary mr-2">#bdvsaus</a>
      </div>
      <div className="carousel carousel-center max-w-md px-1 py-2 space-x-4 bg-neutral rounded-box">
        
          <div  className="carousel-item">
            <Image
              src="https://images.pexels.com/photos/3778684/pexels-photo-3778684.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt='pic'
              width={350}
              height={200}
              className="rounded-box cursor-pointer"
              
            />
          </div>
        
      </div>
      <div className="pt-4 flex flex-row gap-5">
        <div className="flex">
          <button className="btn">
            <BsHeart
              size={20}
              className={`"text-red-500 font-bold"`}
            />
            <span>5</span>
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
