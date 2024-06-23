"use client";

import React, { useState } from "react";
import { FaUsers } from "react-icons/fa6";
import { MdPostAdd } from "react-icons/md";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { FaArrowUp } from "react-icons/fa";
import CommunityPost from "./CommunityPost";
import CommunityUsers from "./CommunityUsers";
import { AiOutlineClose } from "react-icons/ai";

function AdminCommunity() {
  const [activeTab, setActiveTab] = useState("post");
  const [openModal, setOpenModel] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleModel = () => {
    setOpenModel(!openModal);
  };

  return (
    <div className="flex flex-col items-center py-16 mx-auto w-full">
      <h2 className="text-3xl font-bold mb-4">Manage Community</h2>
      <div className="bg-base-100 p-6 rounded-lg shadow-lg w-[90%]">
        <div className="flex flex-wrap justify-evenly lg:flex-row  gap-5">
          <div className="outline w-48 py-3 px-5 rounded-lg bg-neutral-content text-black">
            <div className="flex gap-2">
              <FaUsers size={30} />
              Total Member
            </div>
            <p className="items-end ml-10">10k</p>
          </div>
          <div className="outline cursor-pointer w-48 py-3 px-3 rounded-lg bg-neutral-content text-black">
            <div className="flex gap-2" onClick={handleModel}>
              <MdOutlineNotificationsNone size={30} />
              See Notifications
            </div>
            <p className="items-end ml-10">
              <FaArrowUp />
            </p>
          </div>
          <div className="outline w-48 py-3 px-5 rounded-lg bg-neutral-content text-black">
            <div className="flex gap-2">
              <MdPostAdd size={30} />
              Total Post
            </div>
            <p className="items-end ml-10">10k</p>
          </div>
        </div>
        <div className="flex mt-8 md:mt-12 lg:mt-26 justify-evenly border-b-2 border-gray-400 py-7 px-2">
          <button
            className={`font-semibold flex gap-2 px-8 py-1  ${
              activeTab === "post" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => handleTabChange("post")}
          >
            <MdPostAdd size={24} className="md:block" />
            <span>Post</span>
          </button>
          <button
            className={`font-semibold flex gap-2 px-8   ${
              activeTab === "user" ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => handleTabChange("user")}
          >
            <FaUsers size={24} className="md:block" />
            <span>User</span>
          </button>
        </div>
        {activeTab === "post" && (
          <div className="flex flex-col justify-center items-center gap-10">
            <CommunityPost />
            <CommunityPost />
            <div className="join">
              <input
                className="join-item btn btn-square"
                type="radio"
                name="options"
                aria-label="1"
                checked
              />
              <input
                className="join-item btn btn-square"
                type="radio"
                name="options"
                aria-label="2"
              />
              <input
                className="join-item btn btn-square"
                type="radio"
                name="options"
                aria-label="3"
              />
              <input
                className="join-item btn btn-square"
                type="radio"
                name="options"
                aria-label="4"
              />
            </div>
          </div>
        )}
        {activeTab === "user" && (
          <div className="flex flex-wrap justify-evenly">
            {" "}
            <CommunityUsers />
            <CommunityUsers />
            <CommunityUsers />{" "}
          </div>
        )}
      </div>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px]">
            <div className="card-body">
              <button
                onClick={() => setOpenModel(false)}
                className="absolute top-2 right-2 rounded-full p-1"
              >
                <AiOutlineClose size={24} />
              </button>
              <h3 className="card-title">All Notifications</h3>
              <div className="flex flex-col gap-5">
              <div role="alert" className="alert alert-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>UserTwo just created new post!</span>
              </div>
              <div role="alert" className="alert alert-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>UserTwo Like your photo!</span>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCommunity;
