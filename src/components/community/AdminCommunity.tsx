"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa6";
import { MdPostAdd } from "react-icons/md";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { FaArrowUp } from "react-icons/fa";
import CommunityPost from "./CommunityPost";
import { AiOutlineClose } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import Image from "next/image";

interface CommunityProps {
  _id: string;
  name: string;
  description: string;
  threads: string[];
  members: string[];
  admin: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  about: string;
}

interface AdminCommunityProps {
  community: CommunityProps;
}

const AdminCommunity: React.FC<AdminCommunityProps> = ({ community }) => {
  const [activeTab, setActiveTab] = useState("post");
  const [openModal, setOpenModel] = useState(false);
  const [openModela, setOpenModela] = useState(false);
  const [members, setMembers] = useState<any>({});
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(3);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleModelDelete = (memberId: string) => {
    setSelectedMember(memberId);
    setOpenModela(!openModela);
  };

  const handleModel = () => {
    setOpenModel(!openModal);
  };

  const fetchCommunityMembersDetails = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/community/members/${community?._id}`
      );
      if (response.data.success) {
        setMembers(response.data.data);
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
  }, [community?._id]);

  const fetchCommunityThreads = useCallback(
    async (page = 1) => {
      try {
        const response = await axios.get(
          `/api/community/add-post/${community._id}?page=${page}`
        );
        if (response.data.success) {
          setThreads(response.data.data);
          setCurrentPage(page);
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
    },
    [community._id]
  );

  const handlePaginationClick = (page: number) => {
    fetchCommunityThreads(page);
  };

  useEffect(() => {
    if (community?._id) {
      fetchCommunityMembersDetails();
      fetchCommunityThreads();
    }
  }, [community._id, fetchCommunityMembersDetails, fetchCommunityThreads]);

  const removeMember = async () => {
    try {
      const response = await axios.put<ApiResponse>(
        `/api/community/members/${community?._id}`,
        { username: selectedMember }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setMembers((prevMembers: any) => ({
          ...prevMembers,
          members: prevMembers.members.filter(
            (m: any) => m._id !== selectedMember
          ),
        }));
        setOpenModela(false);
        setSelectedMember(null);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while removing member from community";
      toast.error(errorMessage);
    }
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
            <p className="items-end ml-10">{community?.members?.length}</p>
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
            <p className="items-end ml-10">{community?.threads?.length}</p>
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
          <>
          {threads.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              <div>
                No posts available
              </div>
              <div className="flex justify-center items-center mt-4">
                <div className="join grid grid-cols-2">
                  <button
                    className="join-item btn btn-outline"
                    onClick={() => handlePaginationClick(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous page
                  </button>
                  <button
                    className="join-item btn btn-outline"
                    onClick={() => handlePaginationClick(currentPage + 1)}
                    disabled={threads.length < pageSize}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

          ) : (
            <div className="overflow-y-auto  border-gray-500 p-4 w-full   bg-base-100  flex flex-col justify-center items-center pb-12">
              {threads.map((thread) => (
                <CommunityPost
                  key={thread._id}
                  post={thread}
                  communityId={community._id}
                  refetchPosts={() => fetchCommunityThreads(currentPage)}
                />
              ))}
              <div className="flex justify-between items-center mt-4">
                <div className="join grid grid-cols-2">
                  <button
                    className="join-item btn btn-outline"
                    onClick={() => handlePaginationClick(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous page
                  </button>
                  <button
                    className="join-item btn btn-outline"
                    onClick={() => handlePaginationClick(currentPage + 1)}
                    disabled={threads.length < pageSize}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
        )}
        {activeTab === "user" && (
          <div className="flex flex-wrap justify-evenly">
            {members?.members?.map((member: any) => (
              <div
                key={member._id}
                className="border rounded-xl bg-base-300 mt-5 p-4 w-80 flex flex-col"
              >
                <div className="flex gap-5">
                  <div className="avatar">
                    <div className="w-20 rounded-full">
                      <Image
                        alt="pic"
                        width={100}
                        height={100}
                        src={member.avatar}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="mt-5">{member.username}</h3>
                    <h3 className="">{member.followers.length} followers</h3>
                  </div>
                </div>
                <div className="py-2">
                  <p>
                    <span className="font-semibold">
                      Total Community Posts:
                    </span>
                    5
                  </p>
                </div>
                <div className="bottom-2 right-2 py-2">
                  <button
                    className="btn btn-warning"
                    onClick={() => handleModelDelete(member.username)}
                  >
                    Kick This User
                  </button>
                </div>
              </div>
            ))}
            {openModela && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 overflow-y-auto">
                <div className="card card-side bg-base-100 shadow-xl w-[450px] md:w-[600px] lg:w-[750px] ">
                  <div className="card-body">
                    <button
                      className="absolute top-2 right-2 rounded-full p-1"
                      onClick={() => setOpenModela(false)}
                    >
                      <AiOutlineClose size={24} />
                    </button>
                    <h2 className="card-title">
                      Are you sure you want to remove this user
                    </h2>
                    <div className="card-actions justify-end">
                      <button
                        className="btn btn-warning"
                        onClick={removeMember}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
};

export default AdminCommunity;
