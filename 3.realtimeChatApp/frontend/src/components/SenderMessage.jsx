import React from "react";
import { useSelector } from "react-redux";
import dp from "../assets/dp.webp";
import { resolveMediaUrl } from "../main";
import { formatMessageTime } from "../utils/time";

function SenderMessage({ image, message, createdAt }) {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="flex items-end justify-end gap-2">
      <div className="flex max-w-[80%] flex-col items-end gap-1">
        <div className="flex flex-col gap-1 rounded-2xl rounded-tr-none bg-[#1797c2] px-4 py-2 text-[17px] text-white shadow-lg">
          {image && (
            <img
              src={resolveMediaUrl(image)}
              alt="Attachment"
              className="mb-1 w-[180px] max-w-full rounded-lg"
            />
          )}
          {message && (
            <p className="whitespace-pre-wrap break-words">{message}</p>
          )}
        </div>
        {createdAt && (
          <span className="pr-1 text-[10px] text-slate-500">
            {formatMessageTime(createdAt)}
          </span>
        )}
      </div>
      <div className="h-[36px] w-[36px] shrink-0 overflow-hidden rounded-full bg-white shadow-md">
        <img
          src={resolveMediaUrl(userData?.image) || dp}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

export default SenderMessage;
