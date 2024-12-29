"use client";

import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import { ArrowDownCircleIcon, ArrowPathIcon, DevicePhoneMobileIcon, EyeIcon, SparklesIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import FormatNumber from "~~/components/wildfire/FormatNumber";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import { Avatar } from "~~/components/Avatar";
import { useTags } from "~~/hooks/wildfire/useTags";
import { useVideosFeed } from "~~/hooks/wildfire/useVideosFeed";
import { useIdeasFeed } from "~~/hooks/wildfire/useIdeaFeeds";
import { useShortsFeed } from "~~/hooks/wildfire/useShortsFeed";
import { Bars } from "react-loader-spinner";
import { useKins } from "~~/hooks/wildfire/useKins";
import { Chip } from "@nextui-org/react";

const Home: NextPage = () => {
  const router = useRouter();
  //const [toast, setToast] = useState<any>(null);
  const tabs: Array<"sparks" | "videos" | "shorts"> = ["sparks", "videos", "shorts"];
  const [activeTab, setActiveTab] = useState<"sparks" | "videos" | "shorts">("sparks");

  useEffect(() => {
    const getRandomTab = () => {
      const randomIndex = Math.floor(Math.random() * tabs.length);
      return tabs[randomIndex];
    };

    setActiveTab(getRandomTab());
  }, []);
  
  //FETCH DIRECTLY
  const { feed: tagsFeed, refetch: refetchTags } = useTags(3);
  const { loading: loadingKins, feed: kinsFeed, refetch: refetchKins } = useKins(2);
  const { loading: loadingVideoFeed, feed: videosFeed, fetchMore: fetchMoreVideos } = useVideosFeed("random", 6, 6);
  const { loading: loadingVideoFeed2, feed: videosFeed2, refetch: refetchVideos2 } = useVideosFeed("mostViewed", 3, 3);
  const { loading: loadingShortsFeed, feed: shortsFeed, fetchMore: fetchMoreShorts } = useShortsFeed("default", 6);
  const { loading: loadingIdeaFeed, feed: ideasFeed, fetchMore: fetchMoreIdeas } = useIdeasFeed("random", 6, 6);

  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <div key={`line-${i}`}>
        {line
          .split(/(#\w+|@\w+)/g) // Split text into parts with hashtags/mentions
          .map((part, index) => {
            if (part.startsWith("#")) {
              return (
                <div key={`hash-${i}-${index}`} className="text-primary">
                  {part}
                </div>
              );
            } else if (part.startsWith("@")) {
              return (
                <div key={`mention-${i}-${index}`} className="text-primary" onClick={() => router.push(`/${part.substring(1)}`)}>
                  {part}
                </div>
              );
            } else {
              // Wrap plain text in a span with a key
              return (
                <span key={`text-${i}-${index}`}>{part}</span>
              );
            }
          })}
        <br key={`br-${i}`} />
      </div>
    ));
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "sparks":
        return (
          <div className="mr-2 mb-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {ideasFeed.map((idea, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-2xl p-6 text-white h-full transform transition-transform duration-300 hover:-translate-y-2"
                >
                  {/* Background overlay */}
                  <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform -skew-x-12"></div>

                  {/* Card content */}
                  <Link className="relative z-10 flex flex-col h-full" href={`/spark/${idea.id}`}>
                    {/* Logo */}
                    <div className="mb-4">
                      <Image
                        src={`/spark/spark-logo.png`}
                        alt="spark logo"
                        height={120}
                        width={120}
                        className="w-6 h-auto"
                        draggable={false}
                      />
                    </div>

                    {/* Tweet text */}
                    <div className="line-clamp-5 text-lg text-opacity-90 mb-4">{formatText(idea.text)}</div>

                    {/* Footer */}
                    <div className="mt-auto flex flex-row items-center justify-between ">
                      <div className="flex flex-row items-center space-x-2">
                        <Avatar profile={idea.profile} width={10} height={10} />
                        <div className="text-sm">
                          @{idea.profile.username}
                        </div>
                        <span className="text-xs text-gray-300">
                          <TimeAgo timestamp={idea.created_at} />
                        </span>
                      </div>
                      <span className="flex flex-row items-center gap-1 text-xs text-gray-100">
                        <EyeIcon width={18} height={18} />
                        <FormatNumber number={idea.idea_views[0].view_count} />
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {loadingIdeaFeed && (
              <div className="flex flex-row justify-evenly items-end my-5">
                <div className="grow flex flex-row justify-center">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}

            {!loadingIdeaFeed && ideasFeed && ideasFeed.length == 0 ? (
              <div className="flex flex-col justify-center items-center w-full md:h-screen-custom grow my-10">
                <Image src="/dark_800x800.png" alt={""} width={80} height={80} />
                <div className="mt-5 md:mt-0">
                  No sparks found.
                </div>
              </div>
            ) : (
              <>
                <div
                  className="btn relative flex flex-row items-center justify-center mt-2 border-b-2 cursor-pointer"
                  onClick={() => fetchMoreIdeas()}
                >
                  <ArrowDownCircleIcon width={30} />
                </div>
              </>
            )}
          </div>
        );
      case "videos":
        return (
          <div className="grow mr-2 mb-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
              {videosFeed.map((video, index) => (
                <div key={index} className="flex flex-col mt-1">
                  <video
                    width="100%"
                    height="auto"
                    className="rounded-lg"
                    poster={video.long_form ? video.long_form.thumbnail_url : video.thumbnail_url}
                    controls
                    onMouseEnter={e => e.currentTarget.play()} // Autoplay on hover
                    onMouseLeave={e => e.currentTarget.pause()} // Stop on mouse leave
                  >
                    <source src={video.long_form ? video.long_form.video_url + "#t=0,10" : video.video_url + "#t=0,10"} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <a href={`/video/${video.long_form ? video.long_form.id : video.id}`} className="font-medium mt-2 line-clamp-2">
                    {video.long_form ? video.long_form.title : video.title}
                  </a>
                  <a href={`/${video.long_form? video.long_form.profile.username : video.profile.username}`} className="flex flex-row gap-1 items-center text-sm mt-1 opacity-85">
                    <Avatar profile={video.long_form? video.long_form.profile : video.profile} width={7} height={7} />
                    <span>@{video.long_form? video.long_form.profile.username : video.profile.username}</span>
                  </a>
                  <div className="text-sm mt-1 font-medium flex flex-row gap-1 opacity-85">
                <div>
                <FormatNumber number={video.long_form? video.view_count : video.long_form_views[0].view_count } /> views
                </div>
                <div>•</div>
                <div className="flex flex-row gap-1">
                  <TimeAgo timestamp={video.long_form ? video.long_form.created_at : video.created_at} /> <span>ago</span>
                </div>
              </div>            
                </div>
              ))}
            </div>
            {loadingVideoFeed && (
              <div className="flex flex-row justify-evenly items-end my-5">
                <div className="grow flex flex-row justify-center">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}

            {!loadingVideoFeed && videosFeed && videosFeed.length == 0 ? (
              <div className="flex flex-col justify-center items-center w-full md:h-screen-custom grow my-10">
                <Image src="/dark_800x800.png" alt={""} width={80} height={80} />
                <div className="mt-5 md:mt-0">
                  No videos found.
                </div>
              </div>
            ) : (
              <div
                className="btn relative flex flex-row items-center justify-center mt-2 border-b-2 cursor-pointer"
                onClick={() => fetchMoreVideos()}
              >
                <ArrowDownCircleIcon width={30} />
              </div>
            )}
          </div>
        );
      case "shorts":
        return (
          <div className="grow mt-2 mr-2 mb-1">
            {shortsFeed && shortsFeed.length > 0 && (
              <>
                <div className="grid grid-cols-3 lg:grid-cols-6 rounded-box">
                  {shortsFeed.map((short: any, index: number) => (
                    <div
                      key={index}
                      className="mr-1 flex flex-col mt-1 cursor-pointer"
                      onClick={() => router.replace(`/v/${short.id}`)}
                    >
                      <video
                        width="100%"
                        height="auto"
                        className="rounded-lg"
                        muted
                        poster={short.thumbnail_url} // Use thumbnail as a poster
                        onMouseEnter={e => e.currentTarget.play()} // Autoplay on hover
                        onMouseLeave={e => e.currentTarget.pause()} // Stop on mouse leave
                      >
                        <source src={short.video_url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <span className="text-sm font-medium">
                        {<FormatNumber number={short["3sec_views"][0].view_count} />} views
                      </span>
                      <a href={`/${short.profile.username}`} className="text-sm">
                        @{short.profile.username}
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}

            {loadingShortsFeed && (
              <div className="flex flex-row justify-evenly items-end my-5">
                <div className="grow flex flex-row justify-center">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}

            {!loadingShortsFeed && shortsFeed && shortsFeed.length == 0 ? (
              <div className="flex flex-col justify-center items-center w-full md:h-screen-custom grow my-10">
                <Image src="/dark_800x800.png" alt={""} width={80} height={80} />
                <div className="mt-5 md:mt-0">
                  No shorts found.
                </div>
              </div>
            ) : (
              <div
                className="btn relative flex flex-row items-center justify-center mt-2 border-b-2 pb- cursor-pointer mb-2"
                onClick={() => fetchMoreShorts()}
              >
                <ArrowDownCircleIcon width={30} />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-screen-custom overflow-scroll">

      {/* CONTENT */}
      <div className="content m-2 mt-0">
        {/* 3 CARDS */}
        <div className="profile flex flex-row justify-center items-center gap-2">

          {/* COMMUNITY */}
          <div className="stats shadow flex flex-col grow w-full h-full py-5 mb-2 text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700">
            <div className="flex flex-row justify-between items-center stat-value text-sm lg:text-lg px-5 mt-2"><span>Community</span>
              <span onClick={() => refetchKins()} className="cursor-pointer"><ArrowPathIcon width={15} height={15} /></span>
            </div>
            <div className="grid grid-flow-row gap-1 px-4 pt-2">
              {loadingKins &&
                <div className="flex items-center justify-center">
                  <Bars
                    height="30"
                    width="30"
                    color="grey"
                    ariaLabel="bars-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                  />
                </div>}
              {kinsFeed.map((kin: any, index: any) => (
                <Link href={`/${kin.username}`} className="btn btn-sm bg-neutral-100 text-neutral-800 text-sm border-0" key={index}>
                  <div><Avatar profile={kin} width={5} height={5} /></div>
                  <span className="hidden lg:flex">@{kin.username}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* WHATS HAPENNING */}
          <div className="stats shadow flex flex-col grow w-full h-full py-5 mb-2 text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400">
            <div className="flex flex-row justify-between items-center stat-value text-sm lg:text-lg px-5 mt-2">
              <span className="line-clamp-1 overflow-hidden text-ellipsis">What's happening</span>
              <span onClick={() => refetchTags()} className="cursor-pointer"><ArrowPathIcon width={15} height={15} /></span>
            </div>
            {tagsFeed && tagsFeed.map((tag: any, index: number) => (
              <div key={index} className="flex flex-row items-center justify-between stat cursor-pointer hover:opacity-85 py-1">
                <div className="text-primary text-sm lg:text-base font-bold line-clamp-1 overflow-hidden text-ellipsis">
                  <Chip color="primary">#{tag.tag_name}</Chip>
                </div>
                <div className="stat-desc"><FormatNumber number={Math.floor(Math.random() * (1800 - 756 + 1)) + 756} /></div>
              </div>
            ))}
          </div>

          {/* TRENDING */}
          <div className="stats shadow hidden md:flex flex-col grow w-full h-full py-5 mb-2 text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700">
            <div className="flex flex-row justify-between items-center stat-value text-sm lg:text-lg px-5 mt-2">
              <span className="line-clamp-1 overflow-hidden text-ellipsis">Trending</span>
              <span onClick={() => refetchVideos2()} className="cursor-pointer">
                <ArrowPathIcon width={15} height={15} />
              </span>
            </div>
            {loadingVideoFeed2 &&
                <div className="flex items-center justify-center">
                  <Bars
                    height="30"
                    width="30"
                    color="grey"
                    ariaLabel="bars-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                  />
                </div>}
            {videosFeed2?.slice(0, 3).map((video: any, index: number) => (
              <div
                key={index}
                className="flex flex-row items-center justify-between stat cursor-pointer hover:opacity-85 py-2"
              >
                {/* Video Title */}
                <a href={`/video/${video.long_form.id}`} className="text-primary text-sm lg:text-base font-bold line-clamp-1 overflow-hidden text-ellipsis">
                  {video.long_form.title || "Untitled Video"}
                </a>

                {/* View Count */}
                <div className="stat-desc">
                  <FormatNumber number={video.view_count} />
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-4 mb-4" suppressHydrationWarning>
          <div className="flex gap-20 border-b border-gray-300 mb-4">
            <button
              onClick={() => setActiveTab("sparks")}
              className={`flex flex-row gap-1 py-2 text-center items-center justify-center grow ${
                activeTab === "sparks" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
              }`}
            >
              <SparklesIcon width={20} height={20} /> Sparks
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex flex-row gap-1 py-2 text-center items-center justify-center grow ${
                activeTab === "videos" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
              }`}
            >
              
              <VideoCameraIcon width={20} height={20} /> Videos
            </button>
            <button
              onClick={() => setActiveTab("shorts")}
              className={`flex flex-row gap-1 py-2 text-center items-center justify-center grow ${
                activeTab === "shorts" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
              }`}
            >
              <DevicePhoneMobileIcon width={20} height={20} /> Shorts
            </button>
          </div>
          <div>{renderActiveTabContent()}</div>
        </div>

        {/* TOASTS */}
        {/* {toast && (
          <div className="toast z-20">
            <div className="alert alert-info">
              <span>{toast}</span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Home;
