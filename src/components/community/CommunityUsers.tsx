"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface MemberProps {
  _id: string;
  username: string;
  followers: string[];
  avatar: string;
}

const CommunityUsers: React.FC<{ member: MemberProps }> = ({ member }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  

  return (
    <div className="border rounded-xl bg-base-300 mt-5 p-4 w-80 flex flex-col">
      <div className="flex gap-5">
        <div className="avatar">
          <div className="w-20 rounded-full">
            <Image alt="pic" width={100} height={100} src={member.avatar} />
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="mt-5">{member.username}</h3>
          <h3 className="">{member.followers.length} followers</h3>
        </div>
      </div>
      <div className="py-2">
        <p>
          <span className="font-semibold">Total Community Posts:</span> 5
        </p>
      </div>
      <div className="bottom-2 right-2 py-2">
        <button className="btn btn-warning" onClick={openModal}>
          Kick This User
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
          <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px] ">
            <div className="card-body">
              <button
                className="absolute top-2 right-2 rounded-full p-1"
                onClick={closeModal}
              >
                <AiOutlineClose size={24} />
              </button>
              <h2 className="card-title">
                Are you sure you want to remove this user
              </h2>
              <div className="card-actions justify-end">
               <button className="btn btn-warning">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityUsers;
