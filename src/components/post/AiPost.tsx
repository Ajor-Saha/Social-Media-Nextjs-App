import Image from "next/image";
import Link from "next/link";
import React from "react";

const AiPost = () => {
  return (
    <div className="card w-[470px] lg:w-[520px] bg-base-100 shadow-sm mb-4 border-b border-gray-100">
      <div className="card-body flex flex-row">
        <div className="avatar mr-5">
          <div className="w-14 rounded-xl">
            <Image alt="pic" width={14} height={14} src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
          </div>
        </div>
        <Link href="/postwithai" className="w-full">
        <input type="text" placeholder="Create a post with AI" className="input input-bordered input-info  mt-1 cursor-pointer sm:w-80" /></Link>
      </div>
    </div>
  );
};

export default AiPost;


