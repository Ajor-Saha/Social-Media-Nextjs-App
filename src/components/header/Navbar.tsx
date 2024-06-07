"use client";

import React from "react";
import { BsFillThreadsFill } from "react-icons/bs";
import { MdOutlineLogin } from "react-icons/md";
import { GrHomeRounded } from "react-icons/gr";
import { FaSearch } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { GoSearch } from "react-icons/go";
import { FaRegHeart } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";
import ThreadCard from "../card/ThreadCard";
import { useRouter } from "next/navigation";
import { TbBuildingCommunity } from "react-icons/tb";


function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/sign-in", // Specify the login page URL
      redirect: true,
    }); 
  };

  return (
    <div className="navbar bg-base-100 fixed z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Forest"
                value="forest"
              />

              <input
                type="radio"
                name="theme-dropdown"
                className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label="Light"
                value="light"
              />
            </li>
            <li>
              <a>Portfolio</a>
            </li>
            {session ? (
              <li>
                <button onClick={handleSignOut}>Logout</button>
              </li>
            ) : (
              <li>
                <a>Login</a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="navbar-center lg:gap-10">
        <Link href="/" className="btn btn-ghost text-xl">
          <GrHomeRounded />
        </Link>
        <Link href="/search">
          <button className="btn btn-ghost text-xl">
            <FaSearch />
          </button>
        </Link>
       <ThreadCard />
       <Link href="/community">
          <button className="btn btn-ghost text-xl">
          <TbBuildingCommunity />
          </button>
        </Link>
        {session ? (
          <Link href="/dashboard" className="btn btn-ghost text-xl">
            <RxAvatar />
          </Link>
        ) : (
          <Link href="/sign-in" className="btn btn-ghost text-xl">
            <MdOutlineLogin />
          </Link>
        )}
      </div>
      <div className="navbar-end">
        <Link href="/">
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <BsFillThreadsFill size={30} />
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
