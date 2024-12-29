"use client";

import { useContext, useState } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { NextPage } from "next";
import { CheckCircleIcon, CircleStackIcon, UserIcon } from "@heroicons/react/24/outline";
import { ArrowDownCircleIcon, CheckBadgeIcon, EyeIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { AuthContext, AuthUserFollowsContext } from "~~/app/context";
import FormatNumber from "~~/components/wildfire/FormatNumber";
import KinsModal from "~~/components/wildfire/KinsModal";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import TipModal from "~~/components/wildfire/TipModal";
import TransactionsModal from "~~/components/wildfire/TransactionsModal";
import { useIncomingTransactions } from "~~/hooks/wildfire/useIncomingTransactions";
import { useUserFollowsByUsername } from "~~/hooks/wildfire/useUserFollowsByUsername";
import { useUserProfileByUsername } from "~~/hooks/wildfire/useUserProfileByUsername";
import { useUserShortsFeedByUsername } from "~~/hooks/wildfire/useUserShortsFeedByUsername";
import { useUserIdeaFeedByUsername } from "~~/hooks/wildfire/userUserIdeaFeedByUsername";
import { useUserVideoFeedByUsername } from "~~/hooks/wildfire/userUserVideoFeedByUsername";
import { useGlobalState } from "~~/services/store/store";
import { calculateSum } from "~~/utils/wildfire/calculateSum";
import { convertEthToUsd } from "~~/utils/wildfire/convertEthToUsd";
import { deleteFollow, insertFollow } from "~~/utils/wildfire/crud/followers";
import { Avatar } from "~~/components/Avatar";
import { Snippet } from "@nextui-org/react";

const Profile: NextPage = () => {
  const { username } = useParams();
  const ethPrice = useGlobalState(state => state.nativeCurrency.price);
  const fusePrice = useGlobalState(state => state.fuseCurrency.price);
  const router = useRouter();
  const [toast, setToast] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"sparks" | "videos" | "shorts">("sparks");

  //CONSUME PROVIDERS
  const { isAuthenticated, user } = useContext(AuthContext);
  const { refetchAuthUserFollows } = useContext(AuthUserFollowsContext);

  //FETCH DIRECTLY
  const { loading: loadingProfile, profile: posterProfile } = useUserProfileByUsername(username);
  const {
    loading: loadingFollows,
    followers,
    followed,
    following,
    refetch: refetchProfileFollows,
  } = useUserFollowsByUsername(username);
  const {
    loading: loadingVideoFeed,
    feed: videosFeed,
    count: videosCount,
    fetchMore: fetchMoreVideos,
  } = useUserVideoFeedByUsername(username, 6);
  const {
    loading: loadingShortsFeed,
    feed: shortsFeed,
    count: shortsCount,
    fetchMore: fetchMoreShorts,
  } = useUserShortsFeedByUsername(username, 6);
  const {
    loading: loadingIdeaFeed,
    feed: ideasFeed,
    count: ideasCount,
    fetchMore: fetchMoreIdeas,
  } = useUserIdeaFeedByUsername(username, 6);
  const incomingRes = useIncomingTransactions(posterProfile?.wallet_id);

  console.log("posterProfile", posterProfile);

  //BALANCE
  const ethSum = calculateSum(incomingRes.ethereumData);
  const fuseSum = calculateSum(incomingRes.fuseData);
  const baseSum = calculateSum(incomingRes.baseData);

  // Convert each network's balance to USD
  const ethUsd = convertEthToUsd(ethSum, ethPrice);
  const baseUsd = convertEthToUsd(baseSum, ethPrice);
  const fuseUsd = convertEthToUsd(fuseSum, fusePrice);
  const totalUsd = (ethUsd + baseUsd + fuseUsd).toFixed(2); // Total balance in USD

  //DYNAMICALLY GENERATE LEVEL NAME
  const highestLevel = posterProfile?.levels?.reduce(
    (max: number, item: any) => (item.level > max ? item.level : max),
    0,
  );
  const levelNames = ["Ember", "Spark", "Builder", "Architect", "Visionary", "God-mode"];
  const levelName = levelNames[highestLevel] || "unknown";

  const handleFollow = async () => {
    if (followed == false) {
      const error = await insertFollow(user.id, posterProfile.id);
      if (!error) {
        refetchProfileFollows();
        refetchAuthUserFollows();
      } else {
        console.log("error", error);
      }
    } else {
      setToast("You are already connected");

      // Set the toast back to null after 4 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };

  const handleUnfollow = async () => {
    if (followed == true) {
      const error = await deleteFollow(user.id, posterProfile.id);
      if (!error) {
        refetchProfileFollows();
        refetchAuthUserFollows();
        closeKinsModal();
      }
    }
  };

  //TIP MODAL
  const [isTipModalOpen, setTipModalOpen] = useState(false);

  const closeTipModal = () => {
    setTipModalOpen(false);
  };

  //TRANSACTIONS MODAL
  const [isTransactionsModalOpen, setTransactionsModalOpen] = useState(false);

  const closeTransactionsModal = () => {
    setTransactionsModalOpen(false);
  };

  //KIN MODAL
  const [isKinsModalOpen, setKinsModalOpen] = useState(false);

  const closeKinsModal = () => {
    setKinsModalOpen(false);
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {ideasFeed.map((idea: any, index: number) => (
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
                        <Avatar profile={posterProfile} width={10} height={10} />
                        <div className="text-sm hover:underline">
                          @{posterProfile.username}
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
                  User hasn't posted sparks.
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
              {videosFeed.map((video: any, index: number) => (
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
                  <a href={`/${posterProfile.username}`} className="text-sm mt-1">
                    @{posterProfile.username}
                  </a>
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
                  User has no video content.
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
                  User has no shorts content.
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

  if (posterProfile) {
    return (
      <div className="h-screen-custom overflow-scroll">
        {/* MODALS */}
        {isTipModalOpen && <TipModal data={posterProfile} onClose={closeTipModal} />}
        {isTransactionsModalOpen && <TransactionsModal data={posterProfile} onClose={closeTransactionsModal} />}
        {isKinsModalOpen && (
          <KinsModal
            data={{ posterProfile, followers, following, followed }}
            onClose={closeKinsModal}
            onCta={handleUnfollow}
          />
        )}
        {/* CONTENT */}
        <div className="content m-2 mt-0">
          {/* PROFILE */}
          <div className="profile flex flex-col md:flex-row justify-center items-center gap-2">
            {/* KINS */}
            <div className="stats shadow flex flex-col grow w-full max-w-sm h-full py-5 mb-2">
              <div className="stat cursor-pointer hover:opacity-85 py-2" onClick={() => setKinsModalOpen(true)}>
                <div className="stat-figure text-primary">
                  <UserIcon width={30} />
                </div>
                <div className="stat-title">Kins</div>
                <div className="stat-value text-primary text-2xl">
                  {loadingFollows ? (
                    <span className="loading loading-ring loading-sm"></span>
                  ) : (
                    <>{(followers && following) ? <span>{followers.length + following.length}</span> : <span>0</span>}</>
                  )}
                </div>
                <div className="stat-desc">See kins</div>
              </div>
              <div className="px-5 my-2">
                {isAuthenticated == false && (
                  <Link href="/login" className="btn btn-sm bg-base-200 w-full relative">
                    Connect
                    <UserPlusIcon width={23} className="absolute right-3 opacity-65" />
                  </Link>
                )}
                {isAuthenticated == true && (
                  <div className="btn btn-sm bg-base-200 w-full relative" onClick={handleFollow}>
                    {loadingFollows && <span className="loading loading-ring loading-sm"></span>}
                    {!loadingFollows && followed == true && (
                      <>
                        <span>Connected</span>
                        <CheckCircleIcon width={23} className="absolute right-3 opacity-65" />
                      </>
                    )}
                    {!loadingFollows && followed == false && (
                      <>
                        <span>Connect</span>
                        <UserPlusIcon width={23} className="absolute right-3 opacity-65" />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* USERNAME */}
            <div className="stats shadow flex flex-col items-center justify-center grow w-full max-w-sm py-5 mb-2 text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium text-sm">
              <div className="stat flex flex-row justify-between cursor-pointer hover:opacity-85">
                <div>
                  <div className="flex flex-row gap-1 items-center">
                    <span>{levelName}</span>
                    {levelName == "Spark" && <CheckBadgeIcon width={20} height={20} className="text-primary" />}
                  </div>
                  <Link href={"/" + username} className="font-bold text-xl">{posterProfile?.username}</Link>
                </div>
                <div className="text-secondary">
                  {posterProfile?.avatar_url && (
                    <div className="avatar placeholder cursor-default">
                      <div className="w-12 rounded-full">
                        <Image src={posterProfile?.avatar_url} alt={""} width={80} height={80} />
                      </div>
                    </div>
                  )}
                  {!posterProfile?.avatar_url && (
                    <div className="avatar placeholder cursor-default">
                      <div className="bg-neutral text-neutral-content rounded-full w-12">
                        <span className="text-xl">{posterProfile?.username.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start w-full px-6">
                {posterProfile?.bio && <div className="text-sm font-normal opacity-80 mb-2 ">
                    {posterProfile.bio}
                  </div>}
              
                <Snippet color="primary">{`sprq.social/${posterProfile.username}`}</Snippet>
              </div>
              
            </div>

            {/* SEND LOVE */}
            <div className="stats shadow flex flex-col grow w-full h-full py-5 mb-2 max-w-sm">
              <div onClick={() => setTransactionsModalOpen(true)} className="stat cursor-pointer hover:opacity-85">
                <div className="stat-figure text-primary">
                  <CircleStackIcon width={30} />
                </div>
                <div className="stat-title">Received</div>
                <div className="stat-value text-primary text-2xl">
                  {ethSum + baseSum + fuseSum == 0 ? (
                    <div className="text-sm">Be first to send support</div>
                  ) : (
                    "$" + totalUsd
                  )}
                </div>
                <div className="stat-desc">
                  {ethSum + baseSum + fuseSum > 0 ? (parseFloat(totalUsd) / ethPrice).toFixed(4) + " ETH" : ""}
                </div>
              </div>
              <div className="px-5">
                {isAuthenticated == true && (
                  <div className="btn btn-sm btn-primary w-full" onClick={() => setTipModalOpen(true)}>
                    Send Love
                  </div>
                )}
                {isAuthenticated == false && (
                  <Link href="/login" className="btn btn-sm btn-primary w-full">
                    Send Love
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 mb-4">
            <div className="flex gap-20 border-b border-gray-300 mb-4">
              <button
                onClick={() => setActiveTab("sparks")}
                className={`flex-1 py-2 text-center ${
                  activeTab === "sparks" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
                }`}
              >
                Sparks ({ideasCount})
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`flex-1 py-2 text-center ${
                  activeTab === "videos" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
                }`}
              >
                Videos ({videosCount})
              </button>
              <button
                onClick={() => setActiveTab("shorts")}
                className={`flex-1 py-2 text-center ${
                  activeTab === "shorts" ? "border-b-2 border-secondary font-bold" : "text-gray-500"
                }`}
              >
                Shorts ({shortsCount})
              </button>
            </div>
            <div>{renderActiveTabContent()}</div>
          </div>

          {/* TOASTS */}
          {toast && (
            <div className="toast z-20">
              <div className="alert alert-info">
                <span>{toast}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } else if (!loadingProfile && !posterProfile) {
    return <>User Not Found</>;
  }
};

export default Profile;
