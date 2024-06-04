import Image from "next/image";
import React from "react";
import { BsHeart } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { GoShareAndroid } from "react-icons/go";

function CommentCard() {
  return (
    <div className="flex items-center justify-between p-4 rounded border-b border-gray-600">
      <div className="flex items-center">
        <Image
          src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          alt="Avatar"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="ml-4">
          <div className="font-bold">ajordev</div>
          <div className="text-gray-600">Ajor Saha</div>
          <div className="text-sm">This is very good comment...</div>
        </div>
        <div className="flex gap-2 mt-8 ml-40">
            <div className="flex gap-2">
              <button>
                <BsHeart size={20} />
              </button><span>1</span>
            </div>
            <div className="flex gap-1">
            <button>
              <FaRegComment size={20} /> 
            </button><span>2</span>
            </div>
          </div>
      </div>
    </div>
  );
}

export default CommentCard;
