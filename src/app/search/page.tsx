"use client";

import FollowCard from "@/components/card/FollowCard";
import SearchCard from "@/components/card/SearchCard";
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  fullName: string;
  followers: string[]; // Corrected type
  avatar: string;
}

interface SearchResult {
  success: boolean;
  users: User[];
  tags: any[];
  communities: any[];
  message: string;
}

function SearchPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult>({
    success: false,
    users: [],
    tags: [],
    communities: [],
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch default users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<any>("/api/user/all-users");
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch search results
  const fetchSearchResults = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const response = await axios.post<SearchResult>("/api/search", {
        searchText: text,
      });
      if (response.data.success) {
        setSearchResult(response.data);
        setUsers(response.data.users); // Update users with search results
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    setIsSearching(text.length > 0); // Set search mode based on input length
  };

  // Fetch users or search results based on search text
  useEffect(() => {
    if (searchText.length > 0) {
      fetchSearchResults(searchText);
    } else {
      fetchUsers(); // Fetch default users when search text is cleared
    }
  }, [searchText, fetchSearchResults, fetchUsers]);
  

  return (
    <div className="py-20 flex flex-col justify-center items-center">
      <div className="card md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl border-x">
        <div className="card-body">
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search"
              value={searchText}
              onChange={handleSearchChange}
            />
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
              isSearching ? (
                <SearchCard searchResult={searchResult} />
              ) : (
                users.length > 0 ? (
                  users.map((user) => (
                    <FollowCard
                      key={user._id}
                      userId = {user._id}
                      username={user.username}
                      fullName={user.fullName}
                      followers={user.followers}
                      avatar={user.avatar}
                    />
                  ))
                ) : (
                  <p>No users found</p>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
