import Image from "next/image";
import React from "react";

function CommunityUsers() {
  return (
    <div className="border rounded-xl  bg-base-300 mt-5 p-4 w-80 flex flex-col">
      <div className="flex gap-5">
        <div className="avatar">
          <div className="w-20 rounded-full">
            <Image
              alt="pic"
              width={100}
              height={100}
              src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="mt-5">Username</h3>
          <h3 className="">5k follwers</h3>
        </div>
      </div>
      <div className="py-2">
        <p><span className="font-semibold">Total Commmunity Post:</span> 5</p>
      </div>
      <div className="bottom-2 right-2 py-2">
      <button className="btn btn-warning">Kick This User</button>
      </div>
    </div>
  );
}

export default CommunityUsers;
