import React from "react";
import FollowCard from "./FollowCard";
import FollowComunityCard from "./FollowComunityCard";
import Link from "next/link";

interface User {
  _id: string;
  username: string;
  fullName: string;
  followers: string[];
  avatar: string;
}

interface SearchCardProps {
  searchResult: {
    success: boolean;
    users: User[];
    tags: any[];
    communities: any[];
    message: string;
  };
}

function SearchCard({ searchResult }: SearchCardProps) {
  return (
    <div className="py-2">
      <div>
        {searchResult.users.length > 0 && (
          <div>
            <h1 className="font-semibold">Users</h1>
            {searchResult.users.map((user) => (
              <FollowCard
                key={user._id}
                username={user.username}
                fullName={user.fullName}
                followers={user.followers}
                avatar={user.avatar}
              />
            ))}
          </div>
        )}
        {searchResult.communities.length > 0 && (
          <div>
            <h1 className="font-semibold">communities</h1>
            {searchResult.communities.map((community) => (
              <FollowComunityCard
                key={community._id}
                name={community.name}
                communityId={community._id}
                members={community.members}
                coverImage={community.coverImage}
              />
            ))}
          </div>
        )}

        {searchResult.tags.length > 0 && (
          <div>
            <h1 className="font-semibold py-2">tags</h1>
            {searchResult.tags.map((tag) => (
              <div key={tag._id} className="border-b py-2 border-gray-500">
                <Link href={`search/tag/${tag.name}`} className="py-2 mb-2 px-10 link link-primary">#{tag.name}</Link>
              </div>
            ))}
          </div>
        )}
        {/* Add additional sections for tags and communities if needed */}
      </div>
    </div>
  );
}

export default SearchCard;
