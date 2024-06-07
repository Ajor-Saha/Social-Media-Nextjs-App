"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AiFillHome,
  AiFillSetting,
  AiOutlineClose,
  AiOutlineUser,
} from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { GoPlusCircle } from "react-icons/go";
import { FaRegImages } from "react-icons/fa6";
import { IoMdVideocam } from "react-icons/io";
import UserCard from "@/components/card/UserCard";
import CommunityThreadCard from "@/components/card/CommunityThreadCard";
import { useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserCommunityPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams<{ communityId: string }>();
  const communityId = params.communityId;
  const [community, setCommunity] = useState<any>({});

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchCommunityDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/community/${communityId}`
      );
      if (response.data.success) {
        setCommunity(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching community details";
      toast.error(errorMessage);
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId, fetchCommunityDetails]);

 // console.log(community);
  

  return (
    <div className="flex pt-8">
      <aside className="bg-base-300 xl:w-40 lg:w-32 w-20 flex-shrink-0 mt-4">
        <div className="flex flex-col items-center lg:items-stretch py-4">
          <div className="flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-3 cursor-pointer">
            <AiFillHome className="text-2xl" />
            <span className="hidden lg:block">Home</span>
          </div>
          <div className="flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer">
            <AiOutlineUser className="text-2xl" />
            <span className="hidden lg:block">Profile</span>
          </div>
          <div className="flex items-center lg:justify-center lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 px-4 py-2 cursor-pointer">
            <AiFillSetting className="text-2xl" />
            <span className="hidden lg:block">Settings</span>
          </div>
        </div>
      </aside>
      <main className="flex flex-col items-center pt-10 mx-auto">
        <div className="card w-[350px] border-b border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[585px] lg:h-[600px] md:ml-24 bg-base-100 shadow-xl">
          <div className="relative">
            <figure className="h-[300px] lg:h-[350px]">
              <img
                src={community?.coverImage || "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"}
                alt="Shoes"
                className="rounded-xl"
              />
            </figure>
            <button className="absolute bottom-2 right-2 p-2 rounded-full shadow hover:bg-gray-200">
              <FaEdit className="text-gray-700" size={25} />
            </button>
          </div>
          <div className="gap-5">
            <h2 className="card-title p-2">{community.name}</h2>
            <p className="p-2">
              {community.description}
            </p>
            <div>
              <button className="btn btn-outline btn-info m-4 px-10">
                Join
              </button>
              <span>{community.members?.length} members</span>
            </div>
            <div className="flex gap-5 px-10">
              <button
                className={`font-semibold ${
                  activeTab === "home" ? "border-b-2 border-gray-500" : ""
                }`}
                onClick={() => handleTabChange("home")}
              >
                Home
              </button>
              <button
                className={`font-semibold ${
                  activeTab === "about" ? "border-b-2 border-gray-500" : ""
                }`}
                onClick={() => handleTabChange("about")}
              >
                About
              </button>
              <button
                className={`font-semibold ${
                  activeTab === "post" ? "border-b-2 border-gray-500" : ""
                }`}
                onClick={() => handleTabChange("post")}
              >
                Post
              </button>
              <button
                className={`font-semibold ${
                  activeTab === "user" ? "border-b-2 border-gray-500" : ""
                }`}
                onClick={() => handleTabChange("user")}
              >
                User
              </button>
            </div>
          </div>
        </div>
        <div className="w-full mt-4 p-4 flex flex-col justify-center items-center">
          {activeTab === "home" && (
            <div className="card w-[350px] border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[570px] lg:h-[600px] md:ml-24 bg-base-100 shadow-xl mx-auto">
              <div className="flex flex-col justify-center items-center lg:gap-10">
                <button
                  onClick={openModal}
                  className="flex gap-10 border w-full justify-between items-center rounded-xl py-3 px-5"
                >
                  <p className="text-lg font-semibold text-gray-500">
                    Create New Community Post...
                  </p>
                  <GoPlusCircle size={30} className="" />
                </button>

                <div className="carousel h-[270px] rounded-box w-[400px] md:w-[450px] lg:w-[500px] ml-4 border-x p-2 mt-10">
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold my-2">Username</h1>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold mt-2">Username</h1>
                      <p>admin</p>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold my-2">Username</h1>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold my-2">Username</h1>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold my-2">Username</h1>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold my-2">Username</h1>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                  <div className="carousel-item w-1/2">
                    <div className="flex flex-col mx-auto pt-5">
                      <div className="avatar">
                        <div className="w-24 rounded-full">
                          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
                        </div>
                      </div>
                      <h1 className="font-bold my-2">Username</h1>
                      <p>5k Follwers</p>
                      <button className="btn mt-3 outline">Follow</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "about" && (
            <div className="card w-[350px] overflow-y-auto border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[300px] lg:h-[400px] md:ml-24 bg-base-100 shadow-xl">
              I'm looking to build a custom, high-interactivity website using
              React, Typescript, and the Tailwind CSS framework. Key Details: -
              I need a full-stack developer with significant experience in React
              and Typescript. - The website will be rich in features and require
              real-time updates and complex user interactions. - Knowledge of
              Tailwind CSS is essential for the design elements. - The site will
              be quite interactive, so previous experience with similar projects
              would be advantageous. I'm excited to see your proposals and
              discuss further details!.... give me demo response of mine , to
              bid this project and I am proficient in reactjs, tailwind css and
              typescript and I do this project as your requirement ... give me
              4-5 lines
            </div>
          )}
          {activeTab === "post" && (
            <div className="card w-[350px] flex flex-col justify-center items-center border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px]  md:ml-24 bg-base-100 shadow-xl">
              <CommunityThreadCard />
              <CommunityThreadCard />
              <CommunityThreadCard />
            </div>
          )}
          {activeTab === "user" && (
            <div className="card  overflow-y-auto w-[350px] border-y border-gray-500 p-4 sm:w-[450px] md:w-[650px] lg:w-[750px] h-[570px] lg:h-[600px] md:ml-24 bg-base-100 shadow-xl">
              <UserCard />
              <UserCard />
              <UserCard />
              <UserCard />
            </div>
          )}
        </div>
      </main>
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
              <h2 className="card-title">Create New Community Post</h2>
              <form className="py-2">
                <textarea
                  className="textarea textarea-success w-72 md:w-[400px] lg:w-[500px] mb-2"
                  placeholder="Description"
                ></textarea>
                <input
                  type="text"
                  placeholder="Add Tag here"
                  className="input input-bordered input-success w-72 md:w-[400px] lg:w-[500px] mb-2"
                />

                <div className="flex gap-8 py-2">
                  <div className=" p-5 rounded-lg w-14 bg-base-300 mb-5">
                    <FaRegImages />
                  </div>
                  <div className=" p-5 rounded-lg w-14 bg-base-300 mb-5">
                    <IoMdVideocam />
                  </div>
                </div>
                <button
                  className="btn btn-success file-input-bordered  w-72 md:w-[400px] lg:w-[500px]"
                  type="submit"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCommunityPage;
