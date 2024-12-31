"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  EnterFullscreenIcon,
  ExitFullscreenIcon,
  MuteIcon,
  PictureInPictureIcon,
  UnmuteIcon,
} from "@livepeer/react/assets";
import { getSrc } from "@livepeer/react/external";
import * as Player from "@livepeer/react/player";
import { Livepeer } from "livepeer";
import { NextPage } from "next";
import ConfettiExplosion from "react-confetti-explosion";
import { Hearts, RotatingSquare } from "react-loader-spinner";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ChatBubbleOvalLeftIcon, CheckBadgeIcon, CheckCircleIcon, ChevronDownIcon, HandThumbUpIcon, PauseIcon, PlayIcon, UserIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { EyeIcon, FireIcon } from "@heroicons/react/24/solid";
import { AuthContext, AuthUserContext, AuthUserFollowsContext } from "~~/app/context";
import { Avatar } from "~~/components/Avatar";
import { FormatDate } from "~~/components/wildfire/FormatDate";
import FormatNumber from "~~/components/wildfire/FormatNumber";
import KinsModal from "~~/components/wildfire/KinsModal";
import ShareVideoModal from "~~/components/wildfire/ShareVideoModal";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import TipModal from "~~/components/wildfire/TipModal";
import { useVideo } from "~~/hooks/wildfire/useVideo";
import { calculateComments, calculatePoints } from "~~/utils/wildfire/calculatePoints";
import { insertFollow } from "~~/utils/wildfire/crud/followers";
import { insertComment } from "~~/utils/wildfire/crud/long_form_comments";
import { insertLike } from "~~/utils/wildfire/crud/long_form_fires";
import { insertReply } from "~~/utils/wildfire/crud/long_form_replies";
import { incrementVideoViews } from "~~/utils/wildfire/incrementVideoViews";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button, Snippet } from "@nextui-org/react";

const livepeerClient = new Livepeer({
  apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY,
});

const Video: NextPage = () => {
  const { video_id } = useParams();
  const { loading: loadingVideo, video, posterProfile, followers, following, followed, likedByUser } = useVideo(video_id);
  const [vodSource, setVodSource] = useState<any>(null);
  const [playbackInfo, setPlaybackInfo] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);

  const { resolvedTheme } = useTheme(); // Get the current theme
  const isDarkMode = resolvedTheme === "dark"; // Check if dark mode is active

  //connect
  const [tempFollow, setTempFollow] = useState<boolean | null>(false);

  //comments
  const [loadingComment, setLoadingComment] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [tempComment, setTempComment] = useState<any>("");

  //replies
  const [replyButton, setReplyButton] = useState<null | string>(null); //comment id
  const [replyInput, setReplyInput] = useState("");
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [tempReply, setTempReply] = useState<{ text: string; commentId: string } | null>(null);

  //likes
  const [tempSpark, setTempSpark] = useState<boolean | null>(false);
  const [tempFire, setTempFire] = useState<boolean | null>(false);
  const [tempSupernova, setTempSupernova] = useState<boolean | null>(false);
  const [isExplodingSpark, setIsExplodingSpark] = useState(false);
  const [isExplodingFire, setIsExplodingFire] = useState(false);
  const [isExplodingSupernova, setIsExplodingSupernova] = useState(false);

  //CONSUME PROVIDERS
  const { isAuthenticated, user } = useContext(AuthContext);
  const { profile } = useContext(AuthUserContext);
  const { refetchAuthUserFollows } = useContext(AuthUserFollowsContext);

  //FOLLOWS MODAL
  const [isKinsModalOpen, setKinsModalOpen] = useState(false);

  const closeKinsModal = () => {
    setKinsModalOpen(false);
  };

  const handleUnfollow = async () => {
    if (followed == true) {
      //   const error = await deleteFollow(user.id, profile.id);
      //   if (!error) {
      //     refetchProfileFollows();
      //     refetchAuthUserFollows();
      //     closeFollowsModal();
      //   }
    }
  };

  useEffect(() => {
    if (video && video.playback_id) {
      (async () => {
        try {
          const playbackResp = await livepeerClient.playback.get(video.playback_id);
          const vod = getSrc(playbackResp.playbackInfo);
          setVodSource(vod);
        } catch (error) {
          setPlaybackInfo("error");
        }
        handleIncrementViews();
      })();
    }
  }, [video]);

  //DYNAMICALLY GENERATE LEVEL NAME
  const highestLevel = posterProfile?.levels?.reduce(
    (max: number, item: any) => (item.level > max ? item.level : max),
    0,
  );
  const levelNames = ["Ember", "Spark", "Flame", "Blaze", "Inferno", "Nova"];
  const levelName = levelNames[highestLevel] || "unknown";

  const handleLike = async (video_id: any, type: string, liked: boolean, temp: boolean | null) => {
    if (isAuthenticated == false) {
      alert("Login to like");
      return;
    }
    if (liked || temp) {
      handleConfetti(type);
      setToast("You already gave " + type);
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } else {
      const error = await insertLike(video_id, type);
      if (!error) {
        // Add points based on the reaction fields
        if (type == "fire") setTempFire(true);
        if (type == "spark") setTempSpark(true);
        if (type == "supernova") setTempSupernova(true);

        handleConfetti(type);
      }
    }
  };

  const handleReply = (comment_id: string) => {
    if (replyButton == comment_id) {
      setReplyButton(null);
    } else {
      setReplyButton(comment_id);
    }
  };

  const toggleShowReplies = (commentId: string) => {
    // Toggle replies for the specific commentId
    if (replyButton === commentId) {
      setShowReplies(!showReplies); // Toggle if same commentId
    } else {
      setReplyButton(commentId); // Set new commentId
      setShowReplies(true); // Show replies for new comment
    }
  };

  const handleCommentSubmit = async () => {
    if (isAuthenticated == false) {
      alert("Login to comment");
      return;
    }
    if (!commentInput.trim()) {
      return; // Do not submit empty comments
    }
    setLoadingComment(true);
    const error = await insertComment(video.id, commentInput);
    if (!error) {
      setTempComment(commentInput); // Store the new comment temporarily
      setCommentInput(""); // Clear the input field
      setLoadingComment(false);
    }
  };

  const handleReplySubmit = async () => {
    if (isAuthenticated == false) {
      alert("Login to comment");
      return;
    }
    if (!replyInput.trim() || !replyButton) {
      return; // Do not submit empty comments or if there's no comment ID
    }
    setLoadingComment(true);
    const error = await insertReply(replyButton, replyInput);
    if (!error) {
      setTempReply({ text: replyInput, commentId: replyButton }); // Store the new comment temporarily
      setReplyInput(""); // Clear the input field
      setLoadingComment(false);
      setShowReplies(true);
    }
  };

  const handleIncrementViews = async () => {
    incrementVideoViews(video.id);
  };

  //SHARE MODAL
  const [isShareModalOpen, setShareModalOpen] = useState(false);

  const closeShareModal = () => {
    setShareModalOpen(false);
  };

  const handleConnect = async () => {
    if (followed || tempFollow) {
      setToast("You are already connected");

      // Set the toast back to null after 4 seconds
      setTimeout(() => {
        setToast(null);
      }, 3000);
    } else {
      //follow
      const error = await insertFollow(user.id, posterProfile.id);
      if (!error) {
        setTempFollow(true);
        refetchAuthUserFollows();
      }
    }
  };

  const handleConfetti = (type: string) => {
    if (type == "spark") {
      setIsExplodingSpark(false);
      setTimeout(() => {
        setIsExplodingSpark(true);
      }, 0);
    }
    if (type == "fire") {
      setIsExplodingFire(false);
      setTimeout(() => {
        setIsExplodingFire(true);
      }, 0);
    }
    if (type == "supernova") {
      setIsExplodingSupernova(false);
      setTimeout(() => {
        setIsExplodingSupernova(true);
      }, 0);
    }
  };

  //TIP MODAL
  const [isTipModalOpen, setTipModalOpen] = useState(false);

  const closeTipModal = () => {
    setTipModalOpen(false);
  };

  return (
    <>
      <div className="h-screen-custom overflow-scroll px-2 flex flex-col lg:flex-row">
        {isKinsModalOpen && (
          <KinsModal
            data={{ posterProfile, followers, following, followed }}
            onClose={closeKinsModal}
            onCta={handleUnfollow}
          />
        )}
        {isShareModalOpen && <ShareVideoModal data={video.id} onClose={closeShareModal} />}
        {isTipModalOpen && <TipModal data={posterProfile} onClose={closeTipModal} />}
        <div className="w-full">
          {vodSource && playbackInfo != "error" ? (
            <div className="w-full">
              <Player.Root src={vodSource} autoPlay>
                <Player.Container className="relative">
                  <Player.Video className="rounded-lg" />

                  <Player.LoadingIndicator className="bg-base-100 h-full w-full flex items-center justify-center">
                    Loading...
                  </Player.LoadingIndicator>

                  <Player.Controls>
                    <div className="hidden absolute inset-0 md:flex justify-center items-center">
                      <Player.PlayPauseTrigger className="h-12 w-12">
                        <Player.PlayingIndicator asChild matcher={false}>
                          <PlayIcon color="white" />
                        </Player.PlayingIndicator>
                      </Player.PlayPauseTrigger>
                    </div>
                    <Player.Seek
                      style={{
                        position: "relative",
                        height: 20,
                        display: "flex",
                        alignItems: "center",
                        userSelect: "none",
                        touchAction: "none",
                      }}
                    />
                  </Player.Controls>

                  <Player.FullscreenTrigger
                    style={{
                      position: "absolute",
                      right: 20,
                      bottom: 20,
                      width: 25,
                      height: 25,
                    }}
                  >
                    <Player.FullscreenIndicator asChild matcher={false}>
                      <EnterFullscreenIcon color="white" />
                    </Player.FullscreenIndicator>
                    <Player.FullscreenIndicator asChild>
                      <ExitFullscreenIcon color="white" />
                    </Player.FullscreenIndicator>
                  </Player.FullscreenTrigger>

                  <Player.Seek
                    style={{
                      position: "absolute",
                      left: 20,
                      right: 20,
                      bottom: 50,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      userSelect: "none",
                      touchAction: "none",
                    }}
                  >
                    <Player.Track
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        position: "relative",
                        flexGrow: 1,
                        borderRadius: 9999,
                        height: 2,
                      }}
                    >
                      <Player.SeekBuffer
                        style={{
                          position: "absolute",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          borderRadius: 9999,
                          height: "100%",
                        }}
                      />
                      <Player.Range
                        style={{
                          position: "absolute",
                          backgroundColor: "white",
                          borderRadius: 9999,
                          height: "100%",
                        }}
                      />
                    </Player.Track>
                    <Player.Thumb
                      style={{
                        display: "block",
                        width: 12,
                        height: 12,
                        backgroundColor: "white",
                        borderRadius: 9999,
                      }}
                    />
                  </Player.Seek>

                  <Player.PictureInPictureTrigger
                    style={{
                      position: "absolute",
                      right: 50,
                      bottom: 20,
                      width: 25,
                      height: 25,
                    }}
                  >
                    <PictureInPictureIcon color="white" />
                  </Player.PictureInPictureTrigger>

                  <Player.Time
                    style={{
                      position: "absolute",
                      left: 60,
                      bottom: 20,
                      height: 25,
                      fontVariant: "tabular-nums",
                      color: "white",
                    }}
                  />

                  <Player.PlayPauseTrigger
                    style={{
                      position: "absolute",
                      left: 20,
                      bottom: 20,
                      width: 25,
                      height: 25,
                    }}
                  >
                    <Player.PlayingIndicator asChild matcher={false}>
                      <PlayIcon color="white" />
                    </Player.PlayingIndicator>
                    <Player.PlayingIndicator asChild>
                      <PauseIcon color="white" />
                    </Player.PlayingIndicator>
                  </Player.PlayPauseTrigger>

                  <Player.MuteTrigger
                    style={{
                      position: "absolute",
                      bottom: 20,
                      right: 80,
                      width: 25,
                      height: 25,
                    }}
                  >
                    <Player.VolumeIndicator asChild matcher={false}>
                      <MuteIcon color="white" />
                    </Player.VolumeIndicator>
                    <Player.VolumeIndicator asChild matcher={true}>
                      <UnmuteIcon color="white" />
                    </Player.VolumeIndicator>
                  </Player.MuteTrigger>
                </Player.Container>
              </Player.Root>
            </div>
          ) : (
            <div>
              <video
                width="100%"
                height="auto"
                className="rounded-lg"
                controls
                poster={video?.thumbnail_url} // Use thumbnail as a poster
              >
                <source src={video?.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {video && (
            <>
              <div className="bg-base-100 rounded-lg p-4 mt-2 grow overflow-scroll">
                <div className="flex flex-row justify-between items-center">
                  <Link href={"/video/" + video.id} className="text-xl font-semibold text-primary">
                    {video.title}
                  </Link>
                  <div className="flex flex-row gap-4">
                    <div className="font-medium">
                      <FormatDate timestamp={video.created_at} />
                    </div>
                    {/* <div className="flex flex-row gap-1">
                    <TimeAgo timestamp={video.created_at} />
                    <span>ago</span>
                  </div> */}
                  </div>
                </div>
                <div className="flex flex-row gap-2 mt-1">
                  <Button
                    color={likedByUser?.spark || tempSpark ? "success" : "default"}
                    variant={likedByUser?.spark || tempSpark ? "solid" : "faded"}
                    radius="lg"
                    size="sm"
                    onPress={() => handleLike(video.id, "spark", likedByUser?.spark, tempSpark)}
                  >
                    <div className="flex items-center gap-2">
                      <HandThumbUpIcon width={15} />
                      <span>Spark</span>
                      <div className="flex flex-row items-center gap-1">
                        <FireIcon width={15} />
                        <span>1x</span>
                      </div>
                    </div>
                    {isExplodingSpark && <ConfettiExplosion />}
                  </Button>

                  <Button
                    color={likedByUser?.fire || tempFire ? "success" : "default"}
                    variant={likedByUser?.fire || tempFire ? "solid" : "faded"}
                    radius="lg"
                    size="sm"
                    onPress={() => handleLike(video.id, "fire", likedByUser?.fire, tempFire)}
                  >
                    <div className="flex items-center gap-2">
                      <HandThumbUpIcon width={15} />
                      <span>Fire</span>
                      <div className="flex flex-row items-center gap-1">
                        <FireIcon width={15} />
                        <span>2x</span>
                      </div>
                    </div>
                    {isExplodingFire && <ConfettiExplosion />}
                  </Button>

                  <Button
                    color={likedByUser?.supernova || tempSupernova ? "success" : "default"}
                    variant={likedByUser?.supernova || tempSupernova ? "solid" : "faded"}
                    radius="lg"
                    size="sm"
                    onPress={() => handleLike(video.id, "supernova", likedByUser?.supernova, tempSupernova)}
                  >
                    <div className="flex items-center gap-2">
                      <HandThumbUpIcon width={15} />
                      <span>Supernova</span>
                      <div className="flex flex-row items-center gap-1">
                        <FireIcon width={15} />
                        <span>3x</span>
                      </div>
                    </div>
                    {isExplodingSupernova && <ConfettiExplosion />}
                  </Button>
                </div>
                
                {video.description && <div className="text-sm mt-2 opacity-75">{video.description}</div>}
              </div>
              <div className="flex flex-col bg-base-100 rounded-lg p-4 mt-2 mb-2 grow overflow-scroll">
                <h1 className="text-lg font-bold">Discussion</h1>
                {/* COMMENTS */}
                {/* Comment input */}
                {isAuthenticated && (
                  <div className="w-full min-w-[200px] my-2">
                    <div className="flex flex-row w-full border-b-2 border-b-slate-500">
                      <div className="">
                        <Avatar profile={profile} width={10} height={10} />
                      </div>
                      {replyButton !== null ? (
                        <textarea
                          className="w-full ml-2 mt-2 bg-transparent placeholder:text-slate-400 text-slate-600 dark:text-slate-300 text-sm"
                          placeholder="Type your reply..."
                          value={replyInput}
                          onChange={e => setReplyInput(e.target.value)}
                          maxLength={3000}
                        />
                      ) : (
                        <textarea
                          className="w-full ml-2 mt-2 bg-transparent placeholder:text-slate-400 text-slate-600 dark:text-slate-300 text-sm"
                          placeholder="Type your comment..."
                          value={commentInput}
                          onChange={e => setCommentInput(e.target.value)}
                          maxLength={3000}
                        />
                      )}
                      {commentInput.length > 0 && replyButton == null && (
                        <div
                          className="text-sm w-fit h-5 top-2.5 right-6 p-4 bg-blue-600 hover:bg-blue-800 rounded-lg text-white font-semibold cursor-pointer flex flex-row items-center"
                          onClick={() => handleCommentSubmit()}
                        >
                          <span>Comment</span>
                          {loadingComment && <span className="loading loading-ring loading-xs ml-1"></span>}
                        </div>
                      )}
                      {replyInput.length > 0 && (
                        <div
                          className="text-sm w-fit h-5 top-2.5 right-6 p-4 bg-blue-600 hover:bg-blue-800 rounded-lg text-white font-semibold cursor-pointer flex flex-row items-center"
                          onClick={() => handleReplySubmit()}
                        >
                          <span>Reply</span>
                          {loadingComment && <span className="loading loading-ring loading-xs ml-1"></span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="grow m-h-[180px] overflow-scroll relative">
                  {/* Render be first to comment */}
                  {video.long_form_comments.length == 0 && !tempComment && (
                    <div className="flex flex-row gap-2 items-center justify-center h-full">
                      Be first to comment <ChatBubbleOvalLeftEllipsisIcon width={20} />
                    </div>
                  )}
                  {/* Render tempComment if it exists */}
                  {tempComment && (
                    <div className="">
                      <div className="flex flex-col gap-2 p-3 rounded-full">
                        <div className="flex flex-row gap-2 justify-between items-center">
                          <div className="flex flex-row items-center gap-2">
                            <Avatar profile={profile} width={10} height={10} />
                            <span className="text-sm font-semibold">@{profile.username}</span>
                          </div>
                          <div className="text-sm opacity-55">just now</div>
                        </div>
                        <div className="text-base opacity-50">{tempComment}</div>
                      </div>
                    </div>
                  )}
                  {/* Render comments */}
                  {video.long_form_comments
                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort in descending order
                    .map((comment: any, id: number) => (
                      <div key={comment.id || id} className="flex flex-col gap-2 p-4 rounded-full">
                        <div className="flex flex-row gap-1 justify-between items-center">
                          <Link
                            href={"/" + comment.profile?.username}
                            className="flex flex-row gap-2 justify-between items-center"
                          >
                            <Avatar profile={comment.profile} width={10} height={10} />
                            <span className="text-sm font-medium">@{comment.profile?.username}</span>
                          </Link>
                          <div className="text-sm opacity-55">
                            <TimeAgo timestamp={comment.created_at} />
                          </div>
                        </div>
                        <div className="text-base">{comment.comment}</div>

                        {/* Render like & reply buttons */}
                        <div className="text-xs flex flex-row gap-5">
                          {/* <div
                            className="flex flex-row gap-1 cursor-pointer opacity-60"
                            onClick={() => handleLikeComment()}
                          >
                            <HeartIcon width={18} />
                            Like
                          </div> */}
                          <div
                            className={`cursor-pointer ${
                              replyButton !== null && replyButton == comment.id && "text-primary block"
                            } flex flex-row items-center justify-center gap-1 opacity-60`}
                            onClick={() => handleReply(comment.id)}
                          >
                            <ChatBubbleOvalLeftEllipsisIcon width={18} height={18} />
                            Reply
                            <div className={replyButton !== null && replyButton == comment.id ? "block" : "hidden"}>
                              <XMarkIcon width={10} height={10} />
                            </div>
                          </div>
                        </div>

                        {/* Render replies */}
                        {comment.long_form_replies && comment.long_form_replies.length > 0 && (
                          <>
                            <div
                              className="cursor-pointer text-base font-semibold text-blue-400 flex flex-row items-center gap-1"
                              onClick={() => toggleShowReplies(comment.id)}
                            >
                              <ChevronDownIcon width={20} height={20} />
                              {comment.long_form_replies.length}{" "}
                              {comment.long_form_replies.length === 1 ? "reply" : "replies"}
                            </div>

                            {showReplies && replyButton === comment.id && (
                              <div className="ml-4">
                                {comment.long_form_replies
                                  .filter((reply: any) => reply.comment_id === comment.id) // Show only replies for this comment
                                  .sort(
                                    (a: any, b: any) =>
                                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                                  )
                                  .map((reply: any, index: number) => (
                                    <div key={reply.id || index} className="text-base p-3 flex flex-col gap-1">
                                      <div className="flex flex-row justify-between items-center gap-1">
                                        <a
                                          href={`/${reply.profile.username}`}
                                          className="flex flex-row items-center gap-1"
                                        >
                                          <Avatar profile={reply.profile} width={10} height={10} />
                                          <span className="text-sm font-semibold">@{reply.profile.username}</span>
                                        </a>
                                        <span className="text-sm opacity-65">
                                          <TimeAgo timestamp={reply.created_at} />
                                        </span>
                                      </div>

                                      <div className="text-base">{reply.reply}</div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </>
                        )}

                        {/* Render temporary reply */}
                        {tempReply !== null && tempReply.commentId === comment.id && (
                          <div className="text-base p-1 ml-4 flex flex-col gap-1">
                            <div className="flex flex-row items-center justify-between">
                              <div className="flex flex-row items-center gap-2">
                                <Avatar profile={profile} width={10} height={10} />
                                <span className="text-sm font-semibold">@{profile.username}</span>
                              </div>
                              <span className="text-sm opacity-65">now</span>
                            </div>
                            <div className="text-base">{tempReply.text}</div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* TOASTS */}
        {toast && (
          <div className="toast z-20">
            <div className="alert alert-info">
              <span>{toast}</span>
            </div>
          </div>
        )}

        <div className="long_form flex flex-col gap-2">
          {loadingVideo &&
            <div>
              <RotatingSquare
                visible={true}
                height="100"
                width="100"
                color="#4fa94d"
                ariaLabel="rotating-square-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            </div>}
          {posterProfile && (
            <>
              <div className="stats shadow flex flex-col lg:w-[350px] py-5 ml-0 lg:ml-2 items-center justify-center text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium text-sm">
                <div className="stat flex flex-row justify-between cursor-pointer hover:opacity-85">
                  <div>
                    <div className="flex flex-row gap-1 items-center">
                      <span>{levelName}</span>
                      {levelName == "Spark" && <CheckBadgeIcon width={20} height={20} className="text-primary" />}
                    </div>
                    <Link href={"/" + posterProfile?.username} className="font-bold text-xl">{posterProfile?.username}</Link>
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
              <div className="stats shadow flex flex-col lg:w-[350px] py-5 ml-0 lg:ml-2">
                <div className="stat cursor-pointer hover:opacity-85 py-2" onClick={() => setKinsModalOpen(true)}>
                  <div className="stat-figure text-primary">
                    <UserIcon width={30} />
                  </div>
                  <div className="stat-title">Kins</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber
                      number={
                        tempFollow ? followers?.length + following.length + 1 : followers?.length + following.length
                      }
                    />
                  </div>
                  <div className="stat-desc">See kins</div>
                </div>
                <div className="px-5 my-2">
                  {isAuthenticated == false && (
                    <Link href="/login" className="btn bg-base-200 w-full relative text-content-200">
                      Connect
                      <UserPlusIcon width={23} className="absolute right-3 opacity-65" />
                    </Link>
                  )}
                  {isAuthenticated == true && (
                    <div className="btn bg-base-200 w-full relative" onClick={() => handleConnect()}>
                      {!tempFollow ? (
                        <>
                          {followed == true && (
                            <>
                              <span>Connected</span>
                              <CheckCircleIcon width={23} className="absolute right-3 opacity-65" />
                            </>
                          )}
                          {followed == false && (
                            <>
                              <span>Connect</span>
                              <UserPlusIcon width={23} className="absolute right-3 opacity-65" />
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span>Connected</span>
                          <CheckCircleIcon width={23} className="absolute right-3 opacity-65" />
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-5">
                  {isAuthenticated == true && (
                    <div className="btn btn-secondary w-full" onClick={() => setTipModalOpen(true)}>
                      Send Love
                      <div className="">
                        <Hearts
                          height="40"
                          width="40"
                          color="#fff"
                          ariaLabel="hearts-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                          visible={true}
                        />
                      </div>
                    </div>
                  )}
                  {isAuthenticated == false && (
                    <Link href="/login" className="btn btn-secondary w-full text-content-200">
                      Send Love
                      <div className="">
                        <Hearts
                          height="40"
                          width="40"
                          color="#fff"
                          ariaLabel="hearts-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                          visible={true}
                        />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
              <div className="stats shadow flex flex-col lg:w-[350px] py-5 ml-0 lg:ml-2 h-fit">
                <Link href="https://www.livepeer.org/" target="_blank" className="self-center">
                <Image
                  src={isDarkMode ? `/lp_white_no_bg.png` : `/lp_black_no_bg.png`} // Change image based on theme
                  alt="hero"
                  height={462}
                  width={158}
                  className=""
                  draggable={false}
                /></Link></div>
              <div className="stats shadow flex flex-col lg:w-[350px] py-5 ml-0 lg:ml-2 mb-2 h-fit">
              
                <div className="stat hover:opacity-85 py-2">
                  <div className="stat-figure text-primary">
                    <EyeIcon width={30} />
                  </div>
                  <div className="stat-title">Views</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber number={video.long_form_views[0].view_count} />
                  </div>
                </div>
                <div className="stat hover:opacity-85 py-2">
                  <div className="stat-figure text-primary">
                    <FireIcon width={30} />
                  </div>
                  <div className="stat-title">Passion</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber number={calculatePoints(video.long_form_fires)} />
                  </div>
                </div>
                <div className="stat hover:opacity-85 py-2">
                  <div className="stat-figure text-primary">
                    <ChatBubbleOvalLeftIcon width={30} />
                  </div>

                  <div className="stat-title">Discussion</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber number={calculateComments(video.long_form_comments)} />
                  </div>
                </div>
                <div className="px-5 my-2" onClick={() => setShareModalOpen(true)}>
                  <div className="btn bg-base-200 w-full relative">
                    <span>Spread Video</span>
                    <PaperAirplaneIcon width={23} className="absolute right-3 opacity-65" />
                  </div>
                </div>
                
                
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Video;
