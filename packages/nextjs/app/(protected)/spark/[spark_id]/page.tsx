"use client";

import { useContext, useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { NextPage } from "next";
import ConfettiExplosion from "react-confetti-explosion";
import { Hearts, RotatingSquare } from "react-loader-spinner";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleOvalLeftIcon,
  ChevronDownIcon,
  EyeIcon,
  FireIcon,
  UserIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  HandThumbUpIcon
} from "@heroicons/react/24/solid";
import { AuthContext, AuthUserContext, AuthUserFollowsContext } from "~~/app/context";
import { Avatar } from "~~/components/Avatar";
import { FormatDate } from "~~/components/wildfire/FormatDate";
import FormatNumber from "~~/components/wildfire/FormatNumber";
import KinsModal from "~~/components/wildfire/KinsModal";
import ShareSparkModal from "~~/components/wildfire/ShareSparkModal";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import TipModal from "~~/components/wildfire/TipModal";
import { useIdea } from "~~/hooks/wildfire/useIdea";
import { calculateIdeaComments, calculatePoints } from "~~/utils/wildfire/calculatePoints";
import { insertFollow } from "~~/utils/wildfire/crud/followers";
import { insertComment } from "~~/utils/wildfire/crud/idea_comments";
import { insertLike } from "~~/utils/wildfire/crud/idea_fires";
import { insertReply } from "~~/utils/wildfire/crud/idea_replies";
import { incrementSparkViews } from "~~/utils/wildfire/incrementSparkViews";
import { Button, Card, CardBody, CardFooter, CardHeader, Code, Divider, Link, Snippet } from "@nextui-org/react";

const Video: NextPage = () => {
  const router = useRouter();
  const { spark_id } = useParams();
  const { loading: loadingIdea, idea, posterProfile, followers, following, followed, likedByUser } = useIdea(spark_id);
  const [tempComment, setTempComment] = useState<any>("");
  const [commentInput, setCommentInput] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [replyButton, setReplyButton] = useState<null | string>(null); //comment id
  const [replyInput, setReplyInput] = useState("");
  const [toast, setToast] = useState<any>(null);
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [tempReply, setTempReply] = useState<{ text: string; commentId: string } | null>(null);
  const [tempFollow, setTempFollow] = useState<boolean | null>(false);
  const [tempSpark, setTempSpark] = useState<boolean | null>(false);
  const [tempFire, setTempFire] = useState<boolean | null>(false);
  const [tempSupernova, setTempSupernova] = useState<boolean | null>(false);
  const [isExplodingSpark, setIsExplodingSpark] = useState(false);
  const [isExplodingFire, setIsExplodingFire] = useState(false);
  const [isExplodingSupernova, setIsExplodingSupernova] = useState(false);

  console.log("idea", idea);

  //CONSUME PROVIDERS
  const { isAuthenticated, user } = useContext(AuthContext);
  const { profile } = useContext(AuthUserContext);
  const { refetchAuthUserFollows } = useContext(AuthUserFollowsContext);

  //FOLLOWS MODAL
  const [isKinsModalOpen, setKinsModalOpen] = useState(false);

  const closeKinsModal = () => {
    setKinsModalOpen(false);
  };

  //DYNAMICALLY GENERATE LEVEL NAME
  const highestLevel = posterProfile?.levels?.reduce(
    (max: number, item: any) => (item.level > max ? item.level : max),
    0,
  );
  const levelNames = ["Ember", "Spark", "Flame", "Blaze", "Inferno", "Nova"];
  const levelName = levelNames[highestLevel] || "unknown";

  const handleLike = async (idea_id: any, type: string, liked: boolean, temp: boolean | null) => {
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
      const error = await insertLike(idea_id, type);
      handleConfetti(type);
      if (!error) {
        // Add points based on the reaction fields
        if (type == "fire") setTempFire(true);
        if (type == "spark") setTempSpark(true);
        if (type == "supernova") setTempSupernova(true);
      }
    }
  };

  useEffect(() => {
    if (idea) {
      (async () => {
        handleIncrementViews();
      })();
    }
  }, [idea]);

  const handleReply = (comment_id: string) => {
    if (isAuthenticated == false) {
      alert("Login to reply");
      return;
    }
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
    if (!commentInput.trim()) {
      return; // Do not submit empty comments
    }
    setLoadingComment(true);
    const error = await insertComment(idea.id, commentInput);
    if (!error) {
      setTempComment(commentInput); // Store the new comment temporarily
      setCommentInput(""); // Clear the input field
      //setShowCommentInput(false);
      setLoadingComment(false);
    }
  };

  const handleReplySubmit = async () => {
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
    incrementSparkViews(idea.id);
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

  // Helper function to format text with hashtags and mentions
  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <div key={`line-${i}`}>
        {line
          .split(/(#\w+|@\w+)/g) // Split text into parts with hashtags/mentions
          .map((part, index) => {
            if (part.startsWith("#")) {
              return (
                <Code color="primary" key={`hash-${i}-${index}`} className="hover:opacity-80">
                  {part}</Code>

              );
            } else if (part.startsWith("@")) {
              return (
                <Code
                  key={`mention-${i}-${index}`}
                  color="secondary"
                  onClick={() => router.push(`/${part.substring(1)}`)}
                  className="cursor-pointer hover:opacity-80"
                >
                  {part}
                </Code>
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

  return (
    <>
      <div className="h-screen-custom overflow-scroll px-2 flex flex-col lg:flex-row">
        {isKinsModalOpen && (
          <KinsModal data={{ posterProfile, followers, following, followed }} onClose={closeKinsModal} />
        )}
        {isShareModalOpen && <ShareSparkModal data={idea.id} onClose={closeShareModal} />}
        {isTipModalOpen && <TipModal data={posterProfile} onClose={closeTipModal} />}
        <div className="w-full">
          <div className="w-full">
            {idea && (
              <>
                <div>
                  <Card className="text-neutral-800 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400">
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                      <div className="flex flex-row items-center space-x-2">
                        <Avatar profile={posterProfile} width={10} height={10} />
                        <Link href={`/${idea.profile.username}`} color="foreground" className="text-sm text-neutral-800 font-bold">
                          @{idea.profile.username}
                        </Link>
                        <span className="text-xs flex flex-row gap-1">
                          <TimeAgo timestamp={idea.created_at} /> ago |
                          <FormatDate timestamp={idea.created_at} />
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
                        <span className="flex flex-row items-center gap-1 text-sm">
                          <EyeIcon width={18} height={18} />
                          <FormatNumber number={idea.idea_views[0].view_count} />
                        </span>
                        <span className="flex flex-row items-center gap-1 text-sm">
                          <FireIcon width={18} height={18} />
                          <FormatNumber number={calculatePoints(idea.idea_fires)} />
                        </span>
                        <span className="flex flex-row items-center gap-1 text-sm">
                          <ChatBubbleOvalLeftEllipsisIcon width={18} height={18} />
                          <FormatNumber number={calculateIdeaComments(idea.idea_comments)} />
                        </span>
                        <button className="flex flex-row items-center gap-1 text-sm text-blue-500 hover:text-blue-600" onClick={() => setShareModalOpen(true)}>
                          <PaperAirplaneIcon width={18} height={18} />
                          Share
                        </button>
                      </div>
                      <Link color="foreground" showAnchorIcon href={`/spark/${idea.id}`} className="text-sm text-blue-500">
                        View spark
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </>
            )}
          </div>

          {idea && (
            <>
              <div className="bg-base-100 rounded-lg p-4 mt-2 grow overflow-scroll">
                <div className="flex flex-row justify-between items-center">{idea.title}</div>
                <div className="flex flex-row gap-2 mt-1">
                  <Button
                    color={likedByUser?.spark || tempSpark ? "success" : "default"}
                    variant={likedByUser?.spark || tempSpark ? "solid" : "faded"}
                    radius="lg"
                    size="sm"
                    onPress={() => handleLike(idea.id, "spark", likedByUser?.spark, tempSpark)}
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
                    onPress={() => handleLike(idea.id, "fire", likedByUser?.fire, tempFire)}
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
                    onPress={() => handleLike(idea.id, "supernova", likedByUser?.supernova, tempSupernova)}
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
                  {idea.idea_comments.length == 0 && !tempComment && (
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
                  {idea.idea_comments
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
                            className={`cursor-pointer ${replyButton !== null && replyButton == comment.id && "text-primary block"
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
                        {comment.idea_replies && comment.idea_replies.length > 0 && (
                          <>
                            <div
                              className="cursor-pointer text-base font-semibold text-blue-400 flex flex-row items-center gap-1"
                              onClick={() => toggleShowReplies(comment.id)}
                            >
                              <ChevronDownIcon width={20} height={20} />
                              {comment.idea_replies.length} {comment.idea_replies.length === 1 ? "reply" : "replies"}
                            </div>

                            {showReplies && replyButton === comment.id && (
                              <div className="ml-4">
                                {comment.idea_replies
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

        <div className="idea flex flex-col gap-2 h-fit">
          {loadingIdea &&
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
              <div className="stats shadow flex flex-col lg:w-[350px] py-5 ml-0 lg:ml-2 mb-2">
                <div className="stat hover:opacity-85 py-2">
                  <div className="stat-figure text-primary">
                    <EyeIcon width={30} />
                  </div>
                  <div className="stat-title">Views</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber number={idea.idea_views[0]?.view_count} />
                  </div>
                </div>
                <div className="stat hover:opacity-85 py-2">
                  <div className="stat-figure text-primary">
                    <FireIcon width={30} />
                  </div>
                  <div className="stat-title">Passion</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber number={calculatePoints(idea.idea_fires)} />
                  </div>
                </div>
                <div className="stat hover:opacity-85 py-2">
                  <div className="stat-figure text-primary">
                    <ChatBubbleOvalLeftIcon width={30} />
                  </div>

                  <div className="stat-title">Discussion</div>
                  <div className="stat-value text-primary text-2xl">
                    <FormatNumber number={calculateIdeaComments(idea.idea_comments)} />
                  </div>
                </div>
                <div className="px-5 my-2" onClick={() => setShareModalOpen(true)}>
                  <div className="btn bg-base-200 w-full relative">
                    <span>Spread Spark</span>
                    <PaperAirplaneIcon width={20} className="absolute right-3 opacity-65" />
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
