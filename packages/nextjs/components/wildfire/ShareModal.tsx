import React, { useRef, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const ShareModal = ({ data, onClose }: any) => {
  const insideRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  useOutsideClick(insideRef, () => {
    handleClose();
  });

  const handleClose = () => {
    onClose();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText("https://sprq.social/v/" + data);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset the copied state after 1.5 seconds
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div
        onClick={handleClose}
        className="btn bg-white hover:bg-white text-black self-start absolute left-2 top-2"
      >
        <ChevronLeftIcon width={20} color="black" />
        Back
      </div>
      <div ref={insideRef} className="bg-base-300 rounded-lg p-5">
        <h2 className="text-xl">Share video 🔗</h2>
        <div className="join">
          <input
            className="input input-bordered join-item md:min-w-[350px]"
            readOnly
            value={"https://sprq.social/v/" + data}
          />
          <button
            className="btn join-item rounded-r-full"
            onClick={handleCopyToClipboard}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
