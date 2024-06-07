"use client";

import FollowCard from "@/components/card/FollowCard";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  fullName: string;
  followers: string[]; // Corrected type
  avatar: string;
}


function SearchPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/all-users?page=${page}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  return (
    <div className="py-20 flex flex-col justify-center items-center">
      <div className="card md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl border-x">
        <div className="card-body">
          <label className="input input-bordered flex items-center gap-2">
            <input type="text" className="grow" placeholder="Search" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          <div>
            {loading ? (
              <div className="flex justify-center items-center">
                <span className="loading loading-bars loading-xs"></span>
                <span className="loading loading-bars loading-sm"></span>
                <span className="loading loading-bars loading-md"></span>
                <span className="loading loading-bars loading-lg"></span>
              </div>
            ) : (
              users.map((user) => (
                <FollowCard
                  key={user._id}
                  username={user.username}
                  fullName={user.fullName}
                  followers={user.followers}
                  avatar={user.avatar}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4 gap-5">
        <button
          className="btn btn-outline btn-info"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-outline btn-info"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SearchPage;
