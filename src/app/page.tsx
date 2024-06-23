'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "@/components/card/PostCard";
import AiPost from "@/components/post/AiPost";

// Skeleton component
const SkeletonLoader = () => (
  <div className="flex flex-col gap-4 w-96 py-5">
    <div className="flex gap-4 items-center">
      <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
      <div className="flex flex-col gap-4">
        <div className="skeleton h-4 w-20"></div>
        <div className="skeleton h-4 w-28"></div>
      </div>
    </div>
    <div className="skeleton h-32 w-full"></div>
  </div>
);

const Home = () => {
  const [postData, setPostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // State to track loading

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/thread/get-posts");
        setPostData(response.data.threads);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto p-24">
      <div className="flex justify-center items-center">
      <AiPost />
      </div>
      <div className="flex flex-col justify-center items-center">
        {loading ? (
          // Render skeletons while loading
          Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))
        ) : (
          // Render posts once data is fetched
          postData.map((item, index) => (
            <PostCard
              key={index}
              threadId={item._id}
              description={item.description}
              tag={item.tag}
              images={item.images}
              owner={item.ownerId}
              videos={item.videos}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
