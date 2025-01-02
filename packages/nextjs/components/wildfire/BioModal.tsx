import React, { useContext, useRef, useState } from "react";
import { Avatar } from "../Avatar";
import { ChevronLeftIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { AuthUserContext } from "~~/app/context";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { updateBio } from "~~/utils/wildfire/updateBio";

const BioModal = ({ onClose }: any) => {
  console.log("opening bio modal");
  const { profile, refetchAuthUser } = useContext(AuthUserContext);

  const [errorClient, setErrorClient] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [newBio, setNewBio] = useState<string>(profile.bio || "");

  const handleBioChange = async () => {
    setIsProcessing(true);
    setErrorClient(null);

    // Validate bio length
    if (newBio.trim().length < 6 || newBio.trim().length > 100) {
      setErrorClient("Bio must be between 6 and 100 characters long.");
      setIsProcessing(false);
      return;
    }

    try {
      const res = await updateBio(newBio); // Call the utility to update the bio
      if (res) {
        setErrorClient("Something went wrong. Please try again.");
      } else {
        onClose();
        refetchAuthUser(); // Refetch the user profile to reflect the updated bio
      }
    } catch (error) {
      setErrorClient("An error occurred while updating the bio. Please try again.");
    }

    setIsProcessing(false);
  };

  const handleClose = () => {
    onClose();
  };

  const insideRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(insideRef, () => {
    handleClose();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div onClick={handleClose} className="btn bg-white hover:bg-white text-black self-start absolute left-2 top-2">
        <ChevronLeftIcon width={20} color="black" />
        Back
      </div>
      <div
        ref={insideRef}
        className="content w-full md:w-fit p-8 rounded-lg bg-base-200 overflow-scroll flex flex-col items-center mb-2 gap-1"
      >
        <Avatar profile={profile} width={16} height={16} />
        <div className="mb-2 font-semibold">{profile.username}</div>
        <>
          <textarea
            placeholder="Write a new bio (max. 100 characters)"
            className="textarea textarea-bordered w-full min-w-xs h-32 rounded-sm"
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
          />
          {errorClient && (
            <div
              role="alert"
              className="alert alert-error mt-3"
              onClick={() => setErrorClient(null)}
            >
              <XCircleIcon width={20} />
              <span>{errorClient}</span>
            </div>
          )}
          <div className="flex justify-center w-full">
            <button
              className={`btn btn-primary w-full mt-3 ${isProcessing ? "btn-disabled" : ""}`}
              onClick={handleBioChange}
              disabled={isProcessing}
            >
              Save Bio
              {isProcessing && <span className="loading loading-ring loading-md"></span>}
            </button>
          </div>
        </>
      </div>
    </div>
  );
};

export default BioModal;