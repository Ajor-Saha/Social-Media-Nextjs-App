import Image from "next/image";
import React from "react";
import { BsHeart } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";

interface CommentProps {
  comment: {
    content: string;
    owner: {
      username: string;
      avatar: string;
    };
  };
}

const CommentCard: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded border-b border-gray-600">
      <div className="flex items-center">
        <Image
          src={comment.owner.avatar || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
          alt="Avatar"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div className="ml-4">
          <div className="font-bold">{comment.owner.username}</div>
          <div className="text-sm w-full">{comment.content}</div>
        </div>
        <button className="bottom-0 right-0 ml-28 mt-5">
          <BsHeart size={20}/>
        </button>
      </div>
    </div>
  );
};

export default CommentCard;
