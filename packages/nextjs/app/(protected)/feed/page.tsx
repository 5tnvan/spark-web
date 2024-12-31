"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { NextPage } from "next";
import { AuthUserFollowsContext } from "~~/app/context";
import { useUserFollowingShortsFeed } from "~~/hooks/wildfire/useUserFollowingShortsFeed";
import { useRouter } from "next/navigation";
import FormatNumber from "~~/components/wildfire/FormatNumber";
import { ArrowDownCircleIcon, ChatBubbleOvalLeftEllipsisIcon, EyeIcon, FireIcon } from "@heroicons/react/24/outline";
import { useUserFollowingVideosFeed } from "~~/hooks/wildfire/useUserFollowingVideosFeed";
import { Avatar } from "~~/components/Avatar";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import { useUserFollowingSparksFeed } from "~~/hooks/wildfire/useUserFollowingSparksFeed";
import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Divider, Link } from "@nextui-org/react";
import { calculateComments, calculatePoints } from "~~/utils/wildfire/calculatePoints";

const Feed: NextPage = () => {

  const router = useRouter();

  //CONSUME PROVIDERS
  const { following } = useContext(AuthUserFollowsContext);

  //FETCH DIRECTLY
  const { loading: loadingUserSparksFeed, feed: userSparksFeed, fetchMore: fetchMoreSparks } = useUserFollowingSparksFeed(6);
  const { loading: loadingUserVideosFeed, feed: userVideosFeed, fetchMore: fetchMoreVideos } = useUserFollowingVideosFeed(6);
  const { loading: loadingUserShortsFeed, feed: userShortsFeed, fetchMore: fetchMoreShorts } = useUserFollowingShortsFeed(6);

  //STATES
  const [activeTab, setActiveTab] = useState<"sparks" | "videos" | "shorts">("sparks");

  // Helper function to format text with hashtags and mentions
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 p-2">
              {userSparksFeed.map((idea: any, index: number) => (
                <>
                <Card className="" key={index}>
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <div className="flex flex-row items-center space-x-2">
                      <Avatar profile={idea.profile} width={10} height={10} />
                      <Link href={`/${idea.profile.username}`} color="foreground" className="text-sm font-bold">
                        @{idea.profile.username}
                      </Link>
                      <span className="text-xs text-gray-300">
                        <TimeAgo timestamp={idea.created_at} />
                      </span>
                    </div>
                    <div className="">
                    <Image
                      src={`/spark/spark-logo.png`}
                      alt="spark logo"
                      height={120}
                      width={120}
                      className="w-6 h-auto"
                      draggable={false}
                    />
                  </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                  <div className="text-base text-opacity- mb-4">{formatText(idea.text)}</div>
                  </CardBody>
                  <Divider />
                  <CardFooter className="flex flex-row justify-between">
                  <div className="flex flex-row gap-3">
                      <Link color="foreground" href={`/spark/${idea.id}`} className="flex flex-row items-center gap-1 text-sm">
                        <EyeIcon width={18} height={18} />
                        <FormatNumber number={idea.idea_views[0].view_count} />
                      </Link>
                      <Link color="foreground" href={`/spark/${idea.id}`} className="flex flex-row items-center gap-1 text-sm">
                        <FireIcon width={18} height={18} />
                        <FormatNumber number={calculatePoints(idea.idea_fires)} />
                      </Link>
                      <Link color="foreground" href={`/spark/${idea.id}`} className="flex flex-row items-center gap-1 text-sm">
                        <ChatBubbleOvalLeftEllipsisIcon width={18} height={18} />
                        <FormatNumber number={calculateComments(idea.idea_comments)} />
                      </Link>
                    </div>
                    <Link color="foreground" showAnchorIcon href={`/spark/${idea.id}`} className="text-sm text-blue-500">
                      View spark
                    </Link>
                  </CardFooter>
                </Card></>
              ))}
            </div>

            {loadingUserSparksFeed && (
              <div className="flex flex-row justify-evenly items-end my-5">
                <div className="grow flex flex-row justify-center">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}

            {!loadingUserSparksFeed && userSparksFeed && userSparksFeed.length == 0 ? (
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
                  onClick={() => fetchMoreSparks()}
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
              {userVideosFeed?.map((video: any, index: number) => (
                <div key={index} className="flex flex-col mt-1">
                  <video
                    width="100%"
                    height="auto"
                    className="rounded-lg"
                    poster={video.thumbnail_url}
                    controls
                    onMouseEnter={e => e.currentTarget.play()} // Autoplay on hover
                    onMouseLeave={e => e.currentTarget.pause()} // Stop on mouse leave
                  >
                    <source src={video.video_url + "#t=0,10"} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <a href={`/video/${video.id}`} className="font-medium mt-2 line-clamp-2">
                    {video.title}
                  </a>
                  <a href={`/${video.profile.username}`} className="flex flex-row gap-1 items-center text-sm mt-1 opacity-85">
                    <Avatar profile={video.profile} width={7} height={7} />
                    <span>@{video.profile.username}</span>
                  </a>
                  <div className="text-sm mt-1 font-medium flex flex-row gap-1 opacity-85">
                    <div>
                      <FormatNumber number={video.long_form_views[0].view_count} /> views
                    </div>
                    <div>•</div>
                    <div className="flex flex-row gap-1">
                      <TimeAgo timestamp={video.created_at} /> <span>ago</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {loadingUserVideosFeed && (
              <div className="flex flex-row justify-evenly items-end my-5">
                <div className="grow flex flex-row justify-center">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}

            {!loadingUserVideosFeed && userVideosFeed && userVideosFeed.length == 0 ? (
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
            <div className="grid grid-cols-3 lg:grid-cols-6 rounded-box">
              {userShortsFeed && userShortsFeed?.length > 0 && userShortsFeed?.map((short: any, index: any) => (
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
            {loadingUserShortsFeed && (
              <div className="flex flex-row justify-evenly items-end my-5">
                <div className="grow flex flex-row justify-center">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}

            {!loadingUserShortsFeed && userShortsFeed && userShortsFeed.length == 0 ? (
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

          </div>)
    }
  };

  return (
    <>
      <div id="feed-page" className="flex flex-row h-screen-custom overflow-scroll p-2">

        {/* FOLLOWING */}

        <div className="flex flex-col min-w-min gap-2 md:gap-3 pl-2 md:pl-0 pr-4 lg:pr-2 overflow-scroll">
          {following?.map((following: any, index: number) => (
            <Link key={index} href={"/" + following.following.username} className="">
              <div className="">
                {following.following.avatar_url && (
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <Image src={following.following.avatar_url} alt="avatar" width={20} height={20} priority />
                    </div>
                  </div>
                )}
                {!following.following.avatar_url && (
                  <div className="avatar placeholder">
                    <div className="bg-base-100 text-primary-content rounded-full w-10">
                      <span className="text-xl">{following.following.username.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* TABS */}
        <div className="mt-4 mb-4">
          <div className="flex gap-20 border-b border-gray-300 mb-4">
            <button
              onClick={() => setActiveTab("sparks")}
              className={`flex-1 py-2 text-center ${activeTab === "sparks" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
                }`}
            >
              Sparks ({userSparksFeed?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex-1 py-2 text-center ${activeTab === "videos" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
                }`}
            >
              Videos ({userVideosFeed?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("shorts")}
              className={`flex-1 py-2 text-center ${activeTab === "shorts" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
                }`}
            >
              Shorts ({userShortsFeed?.length || 0})
            </button>
          </div>
          <div>{renderActiveTabContent()}</div>
        </div>
      </div>
    </>
  );
};

export default Feed;
