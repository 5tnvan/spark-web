import React, { useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useOutsideClick } from "~~/hooks/scaffold-eth/useOutsideClick";
import { useRouter } from "next/navigation";

const IdeaModal = ({ data, onClose }: { data: any; onClose: () => void }) => {
  const router = useRouter();
  const insideRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  useOutsideClick(insideRef, () => {
    handleClose();
  });

  const handleClose = () => {
    onClose();
  };

  const handleClick = () => {
    router.push("/spark/" + data)
    handleClose();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText("https://sprq.social/spark/" + data);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset the copied state after 1.5 seconds
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div ref={insideRef} className="content rounded-lg bg-base-200 w-full md:w-1/2 h-2/3 overflow-scroll relative">
        <div className="flex flex-col h-full gap-2 p-4">
          {/* Close Button */}
          <button className="w-fit" onClick={handleClose}>
            <XMarkIcon width={30} height={30} />
          </button>

          <div className="flex flex-col items-center justify-center w-full grow">
                <div className="font-semibold text-3xl pt-10">{"Success 🎉."}</div>
                <div className="join mt-5">
                  <input
                    className="input input-bordered join-item md:min-w-[350px]"
                    readOnly
                    value={"https://sprq.social/spark/" + data}
                  />
                  <button
                    className="btn join-item bg-base-100 rounded-r-full"
                    onClick={handleCopyToClipboard}
                  >
                    {copied ? "Link Copied!" : "Share spark"}
                  </button>
                </div>
                <div
                  className="btn btn-primary mt-5"
                  onClick={() => handleClick()}
                >
                  See Spark
                </div>
                </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaModal;
