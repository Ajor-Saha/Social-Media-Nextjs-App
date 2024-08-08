"use client";

import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NotificationPage() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [matchText, setMatchText] = useState(
    `${user?.username} just created a new post`
  );
  const [postNotifications, setPostNotifications] = useState<any[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get<any>(`/api/notifications`);
      if (response.data.success) {
        const filteredNotifications = response.data.notifications.filter(
          (notification: any) => notification.userId !== user?._id
        );
        setNotifications(filteredNotifications);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =
        axiosError.response?.data.message ??
        "Error while fetching notification details";
      toast.error(errorMessage);
    }
  }, [user]);

  const fetchPostNotifications = useCallback(async () => {
    try {
      const response = await axios.post<any>(`/api/notifications`, {
        matchText,
      });
      if (response.data.success) {
        setPostNotifications(response.data.notifications);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message ?? "Error adding comment");
    }
  }, [matchText]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPostNotifications();
    }
  }, [user, fetchNotifications, fetchPostNotifications]);

  //console.log(notifications);

  return (
    <div className="py-20 flex flex-col">
      <h1 className="text-center text-lg font-semibold py-2">Notifications</h1>
      <div className="mx-auto">
        <div className="card  md:w-[550px] lg:w-[650px] sm:w-[450px] w-[400px] bg-base-100 shadow-xl">
          <div className="card-body gap-5">
            {notifications.length > 0 &&
              notifications.map((notification, index) => (
                <div role="alert" className="alert alert-success" key={index}>
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
                  <Link
                    href={`/post/${notification.threadId}`}
                    className="text-sm md:text-lg"
                  >
                    {notification?.name}
                  </Link>
                </div>
              ))}
            {postNotifications.length > 0 &&
              postNotifications.map((notification, index) => (
                <div role="alert" className="alert alert-success" key={index}>
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
                  <Link
                    href={`/post/${notification.threadId}`}
                    className="text-sm md:text-lg"
                  >
                    {notification?.name}
                  </Link>
                </div>
              ))}
              {notifications.length === 0 || postNotifications.length ===0 && (
                <div>No notification available right now</div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
