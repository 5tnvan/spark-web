"use client";

import React, { useContext, useRef, useState } from "react";
import { NextPage } from "next";
import * as tus from "tus-js-client";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { CheckCircleIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { AuthContext, AuthUserContext } from "~~/app/context";
import LocationModal from "~~/components/wildfire/LocationModal";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import { ACCESS_KEY, HOSTNAME, STORAGE_ZONE_NAME } from "~~/constants/BunnyAPI";
import { useCountries } from "~~/hooks/wildfire/useCountries";
import { useDailyPostLimitLongForm } from "~~/hooks/wildfire/useDailyPostLimitLongForm";
import { livepeerClient } from "~~/utils/livepeer/livepeer";
import { insertVideo, upsertVideo } from "~~/utils/wildfire/crud/long_form";
import Link from "next/link";
import Image from "next/image";

const CreateLong: NextPage = () => {

  //CONSUME PROVIDER
  const { user } = useContext(AuthContext);
  const { profile } = useContext(AuthUserContext);

  //FETCH DIRECTLY
  const { isLoading: isLoadingLimit, limit, posts, postLeft } = useDailyPostLimitLongForm();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [countryId, setCountryId] = useState<string | null>(null);
  //const [countryName, setCountryName] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  //const [customThumbnailUrl, setCustomThumbnailUrl] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [postProcessing, setPostProcessing] = useState<boolean>(false);
  const { countries } = useCountries();
  const [uploadingText, setUploadingText] = useState("");
  const [videoId, setVideoId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0] && files[0].type.includes("video")) {
      const videoFile = files[0];
      const validationResult = await validateVideoFile(videoFile);
      if (validationResult.valid) {
        const url = URL.createObjectURL(videoFile);
        setFile(videoFile);
        setVideoUrl(url);
        createThumbnail(url); // Create thumbnail when video URL is set
      } else {
        handleValidationFailure(validationResult.errors);
      }
    } else {
      alert("Please upload a valid video file");
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files[0] && files[0].type.includes("video")) {
      const videoFile = files[0];
      const validationResult = await validateVideoFile(videoFile);
      if (validationResult.valid) {
        const url = URL.createObjectURL(videoFile);
        setFile(videoFile);
        setVideoUrl(url);
        createThumbnail(url); // Create thumbnail when video URL is set
      } else {
        handleValidationFailure(validationResult.errors);
      }
    } else {
      alert("Please upload a valid video file");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // const handleCustomThumbUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files;
  // const errors: string[] = [];
  
  // if (files && files[0] && files[0].type.includes("image")) {
  //   const imageFile = files[0];
  //   const fileSizeMB = imageFile.size / (1024 * 1024); // Convert bytes to MB

  //   // Check file type (PNG/JPG)
  //   const validTypes = ["image/png", "image/jpeg"];
  //   if (!validTypes.includes(imageFile.type)) {
  //     errors.push("Only PNG or JPG files are allowed.");
  //   }

  //   // Check file size (under 10 MB)
  //   if (fileSizeMB > 10) {
  //     errors.push("File size must be under 10 MB.");
  //   }

  //   // Check aspect ratio (16:9)
  //   const checkAspectRatio = (file: File): Promise<boolean> =>
  //     new Promise((resolve) => {
  //       const img = new Image();
  //       img.onload = () => {
  //         const aspectRatio = img.width / img.height;
  //         resolve(Math.abs(aspectRatio - 16 / 9) < 0.01); // Allow small margin for error
  //       };
  //       img.src = URL.createObjectURL(file);
  //     });

  //   const isValidAspectRatio = await checkAspectRatio(imageFile);
  //   if (!isValidAspectRatio) {
  //     errors.push("Image must have a 16:9 aspect ratio.");
  //   }

  //   // If any errors, show them and exit
  //   if (errors.length > 0) {
  //     alert(errors.join("\n"));
  //     return;
  //   }

  //   // Set the thumbnail URL if validation passes
  //   const customThumb = URL.createObjectURL(imageFile);
  //   setCustomThumbnailUrl(customThumb);
  // } else {
  //   alert("Please upload a valid image file.");
  // }
  // };

  const handleSubmitPost = async () => {
    if (limit === true) {
      alert("You've reached your 24hrs posting limit. Try again later.");
      return;
    }
    if (!titleInput || titleInput.trim().length === 0) {
      alert("Please provide a title for your video.");
      return;
    }
    if (limit === false && videoUrl.length > 0 && thumbnailUrl.length > 0 && file) {
      try {
        setLoading(true);
        // Fetch the thumbnail blob
        const thumbnailBlob = await fetch(thumbnailUrl).then(res => res.blob());
        console.log("thumbnailBlob", thumbnailBlob);
        console.log("videoBlob", file);

        // Upload video
        const videoPath = await uploadToBunny(file, "video");
        console.log("videoPath", videoPath);

        // Upload thumbnail
        const thumbnailPath = await uploadToBunny(thumbnailBlob, "thumbnail");
        console.log("thumbnailPath", thumbnailPath);

        // Insert record into 'LONG_FORM' table
        if (videoPath && thumbnailPath) {
          const res = await insertVideo(titleInput, descriptionInput, videoPath, thumbnailPath, countryId);
          if (Array.isArray(res) && res.length > 0) {
            const videoId = res[0].id;
            setVideoId(videoId);
            await uploadToLivepeer(file, videoId);
          }
        }
      } catch (error) {
        setLoading(false);
        alert("Failed to upload video. Please try again.");
      }
    }
  };

  const uploadToLivepeer = async (assetData: File, video_id: any) => {
    livepeerClient.asset
      .create(assetData)
      .then(async response => {
        console.log("Asset upload request:", response);
        const upload = new tus.Upload(assetData, {
          endpoint: response.data?.tusEndpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: `${profile.id}_${assetData.name}`,
            filetype: assetData.type,
          },
          onError: error => {
            console.error("Failed because: " + error);
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        setUploadingText(
          `Uploading... (${(bytesUploaded / (1024 * 1024)).toFixed(2)}MB/${(bytesTotal / (1024 * 1024)).toFixed(
            2,
          )}MB) ${parseInt(percentage)}%`,
        );
        console.log(bytesUploaded, bytesTotal, percentage + "%");
          },
          onSuccess: async () => {
            console.log("Download %s from %s", assetData.name, upload.url);
            if (upload.url != null) {
              // Upsert record into 'long_form' table
              const error = await upsertVideo(video_id, response.data?.asset.playbackId, user?.id);
              if (!error) {
                setPostProcessing(true);
                //router.push("/" + profile.username);
              } else {
                console.log("error", error);
              }
            }
          },
        });
        upload.start();
      })
      .catch(error => {
        console.error("Error requesting asset upload:", error);
      });
  };

  const uploadToBunny = async (file: File | Blob, type: "video" | "thumbnail") => {
    const now = new Date().getTime();
    let bunnyUrl, pullZoneUrl, contentType;

    if (type === "video") {
      bunnyUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${profile.id}/${now}.mp4`;
      pullZoneUrl = `https://wildfire.b-cdn.net/${profile.id}/${now}.mp4`;
      contentType = "video/mp4";
    } else if (type === "thumbnail") {
      bunnyUrl = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${profile.id}/${now}.jpg`;
      pullZoneUrl = `https://wildfire.b-cdn.net/${profile.id}/${now}.jpg`;
      contentType = "image/jpeg";
    } else {
      throw new Error("Unsupported file type");
    }

    const response = await fetch(bunnyUrl, {
      method: "PUT",
      headers: {
        AccessKey: ACCESS_KEY ?? "",
        "Content-Type": contentType,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`);
    }

    return pullZoneUrl;
  };

  const handleValidationFailure = (errors: string[]) => {
    let errorMessage = "Validation failed:";
    errors.forEach(error => {
      errorMessage += `\n- ${error}`;
    });
    alert(errorMessage);
  };

  const validateVideoFile = async (videoFile: File): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];

    // Check file size (1 GB limit)
    if (videoFile.size > 1 * 1024 * 1024 * 1024) {
      errors.push("File size exceeds 1 GB");
    }

    // Create a video element to get duration and aspect ratio
    const video = document.createElement("video");
    video.src = URL.createObjectURL(videoFile);

    return new Promise<{ valid: boolean; errors: string[] }>(resolve => {
      video.onloadedmetadata = () => {
        // Check duration (between 1 and 15 minutes)
        const duration = video.duration; // duration in seconds
        if (duration < 15 || duration > 10 * 60) {
          errors.push("Video duration must be between 15 seconds and 10 minutes.");
        }        

        // Check aspect ratio (16:9)
        const aspectRatioValid = video.videoWidth / video.videoHeight === 16 / 9;
        if (!aspectRatioValid) {
          errors.push("Aspect ratio should be 16:9");
        }

        resolve({ valid: errors.length === 0, errors });
      };

      video.onerror = () => resolve({ valid: false, errors: ["Failed to load the video"] });
    });
  };

  const createThumbnail = (videoSrc: string) => {
    const video = document.createElement("video");
    video.src = videoSrc;

    video.addEventListener("loadeddata", () => {
      // Seek to the middle of the video to ensure the frame has enough data
      video.currentTime = video.duration / 2;
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const thumbnailUrl = URL.createObjectURL(blob);
            setThumbnailUrl(thumbnailUrl);
          }
        }, "image/jpeg");
      }
      // Clean up
      URL.revokeObjectURL(videoSrc);
    });

    video.addEventListener("error", () => {
      console.error("Error loading video for thumbnail generation");
    });
  };

  const handleSetLocation = (country_id: any, country_name: any) => {
    setIsLocationModalOpen(true);
    setCountryId(country_id);
    //setCountryName(country_name);
    console.log(country_name);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText("https://sprq.social/video/" + videoId);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500); // Reset the copied state after 1.5 seconds
  };

  return (
    <div className="flex flex-col md:flex-row p-2 pt-0 h-screen-custom">
      <div className="flex flex-col">
        {/* DRAG N DROP */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex flex-col items-center bg-base-100 rounded-lg p-4 grow mb-2"
        >
          <div className="font-semibold">Choose a video</div>
          <div className="flex flex-col grow justify-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="video-upload"
            />
            <label htmlFor="video-upload" className="flex flex-col items-center cursor-pointer">
              <div className="flex flex-col grow items-center">
                <VideoCameraIcon width={48} />
                <span className="text-xl">Drag 'n' drop</span>
                <div className="btn btn-base-300 mt-3">Select a file from a computer</div>
              </div>
            </label>
          </div>
        </div>
        {/* POST LIMIT */}
        <div className="flex flex-col items-center bg-base-100 rounded-lg p-4 grow">
          <div className="font-semibold">Your posts</div>
          <div className="flex flex-col grow justify-center items-center">
            {!isLoadingLimit && (
              <>
                {limit == true && <XCircleIcon width={48} color="red" />}
                {limit == false && <CheckCircleIcon width={48} color="green" />}
                <div>
                  You can post <span className="text-primary font-semibold">{postLeft}x</span> today
                </div>
                {posts && posts.length > 0 && (
                  <div className="flex flex-row gap-1">
                    Last posted
                    <span className="text-primary font-semibold">
                      <TimeAgo timestamp={posts[0].created_at} />
                    </span>
                    ago
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="relative flex flex-col bg-base-100 rounded-lg grow md:ml-2 mt-2 md:mt-0">
        {!videoUrl && (
          <div className="flex flex-col justify-center items-center rounded-lg grow">
            <div className="flex flex-col justify-center items-center h-[360px] w-[640px] bg-neutral rounded-lg">
              <label className="label cursor-pointer">
                <input type="checkbox" defaultChecked className="checkbox checkbox-primary" />
                <span className="label-text text-white dark:text-black ml-1">horizontal 16:9</span>
              </label>
              <label className="label cursor-pointer">
                <input type="checkbox" defaultChecked className="checkbox checkbox-primary" />
                <span className="label-text text-white dark:text-black ml-1">up to 10 mins</span>
              </label>
              <label className="label cursor-pointer">
                <input type="checkbox" defaultChecked className="checkbox checkbox-primary" />
                <span className="label-text text-white dark:text-black ml-1">under 1GB</span>
              </label>
            </div>
          </div>
        )}
        {videoUrl && (
          !postProcessing ? 
          <>
            <div className="flex flex-col justify-between items-center h-full grow">
              {/* POST FORM - STEP 1 */}
              <div className="flex flex-row rounded-lg grow w-full gap-4 p-4">
                  <div className="w-full grow">
                    <div className="text-xl font-semibold mb-4">Details</div>
                    {/* TITLE */}
                    <div className="flex flex-col bg-slate-200 dark:bg-slate-700 w-full border-1 border-slate-300 dark:border-slate-500 px-2 py-4 rounded-md mb-2">
                      <h2 className="text-sm text-slate-600 dark:text-slate-300">Title</h2>
                      <input
                        type="text"
                        className="w-full bg-slate-200 dark:bg-slate-700 placeholder:text-slate-400 text-base"
                        placeholder="Add a title of your video"
                        value={titleInput}
                        onChange={e => setTitleInput(e.target.value)}
                        maxLength={1000}
                        required
                      />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="flex flex-col bg-slate-200 dark:bg-slate-700 w-full border-1 border-slate-300 dark:border-slate-500 px-2 py-4 rounded-md mb-4">
                      <h2 className="text-sm text-slate-600 dark:text-slate-300">Description <span className="opacity-50 text-xs">(Optional)</span></h2>
                      <textarea
                        className="w-full bg-slate-200 dark:bg-slate-700 placeholder:text-slate-400 text-base"
                        placeholder="Add a title of your video"
                        value={descriptionInput}
                        onChange={e => setDescriptionInput(e.target.value)}
                        maxLength={3000}
                      />
                    </div>

                    {/* <div className="max-w-sm mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select a video category</label>
                      <select id="countries" className="bg-slate-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option selected>Choose a category</option>
                        <option value="US">News</option>
                        <option value="CA">Humour</option>
                        <option value="FR">Learning</option>
                        <option value="DE">Conversations</option>
                        <option value="DE">Repost</option>
                      </select>
                    </div> */}

                    {/* THUMBNAIL */}
                    <div className="grid grid-cols-2 gap-4 rounded-md p-4 border-1 border-slate-300 dark:border-slate-500 mt-4">
                      {/* SHOW THUMBS */}
                      <div className="max-w-sm">
                        {thumbnailUrl && (
                          <>
                          <div className="text-sm font-medium mb-1">Thumbnail</div>
                          <div className="flex-col items-center grow">
                            <Image src={thumbnailUrl} alt={""} width={200} height={200} className="rounded-lg w-40" /> 
                          </div>
                          </>
                        )}
                        
                      </div>
                    </div>
                    
                  </div>
                  {/* VIDEO */}
                  <div className="w-[320px] h-[180px] rounded-lg">
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      className="h-full w-full object-cover rounded-lg"
                      autoPlay
                    />
                  </div>
                </div>
              {/* POST BUTTON */}
              <div className="p-4 w-full">
                {limit == false && (
                  <>
                  <div className="mb-2 text-center w-full grow text-secondary">{uploadingText}</div>
                  <div className="w-full">
                    <div className="relative btn btn-primary w-full grow" onClick={handleSubmitPost}>
                      Post Now
                      {loading && <span className="loading loading-ring loading-md ml-1"></span>}
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          </>
          :
          <>
              <div className="flex flex-col items-center justify-center w-full grow">
                <div className="font-semibold text-3xl pt-10">{"Success 🎉."}</div>
                <div className="join mt-5">
                  <input
                    className="input input-bordered join-item md:min-w-[350px]"
                    readOnly
                    value={"https://sprq.social/video/" + videoId}
                  />
                  <button
                    className="btn join-item rounded-r-full"
                    onClick={handleCopyToClipboard}
                  >
                    {copied ? "Link Copied!" : "Share video"}
                  </button>
                </div>
                  <Link href={"/video/" + videoId} className="btn btn-primary mt-5">Watch video</Link>
                {/* LOCATION */}
                {/* <div className="btn btn-sm grow" onClick={() => setIsLocationModalOpen(true)}>
                  <MapPinIcon width={14} />
                  {countryName ? countryName : "Set Location"} <ChevronRightIcon width={14} />
                </div> */}

                {/* TAGS */}
                {/* <div className="ml-2 btn btn-sm grow" onClick={() => setIsLocationModalOpen(true)}>
                  <HashtagIcon width={14} />
                  {countryName ? countryName : "Add tags"} <ChevronRightIcon width={14} />
                </div> */}

                {/* UPLOAD CUSTOM THUMBNAIL */}
                {/* <div className="ml-2 btn btn-sm grow" onClick={() => setIsLocationModalOpen(true)}>
                  <HashtagIcon width={14} />
                  Upload custom thumbnail <ChevronRightIcon width={14} />
                </div> */}

              </div>
            
          </> 
        )}
        {isLocationModalOpen && (
          <LocationModal data={countries} onClose={closeLocationModal} onCta={handleSetLocation} />
        )}
      </div>
    </div>
  );
};

export default CreateLong;
