"use client";

import { useRef } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { Avatar } from "~~/components/Avatar";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import { useOutsideClick } from "~~/hooks/scaffold-eth/useOutsideClick";
import { useNotifications } from "~~/hooks/wildfire/useNotifications";
import { useGlobalState } from "~~/services/store/store";
import { convertEthToUsd } from "~~/utils/wildfire/convertEthToUsd";
import {
  updateDirectTipRead,
  updateFollowerRead,
  updateShortCommentRead,
  updateShortFireRead,
  updateShortReplyRead,
  updateShortTipRead,
  updateLongFormFireRead,
  updateLongFormCommentRead,
  updateLongFormReplyRead,
  updateIdeaFireRead,
  updateIdeaCommentRead,
  updateIdeaReplyRead,
} from "~~/utils/wildfire/crud/notifications";

const Notifications: NextPage = () => {
  const { 
    followersNotifications, directTipsNotifications,
    shortFiresNotifications, shortCommentsNotifications, shortRepliesNotifications, shortTipsNotifications,
    longFormFiresNotifications, longFormCommentsNotifications, longFormRepliesNotifications, 
    ideaFiresNotifications, ideaCommentsNotifications, ideaRepliesNotifications, 
    fetchMore, refetch } = useNotifications(5);
  const ethPrice = useGlobalState(state => state.nativeCurrency.price);
  const fusePrice = useGlobalState(state => state.fuseCurrency.price);

  // Dropdown
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  // Merge and sort notifications by date
  const allNotifications = [
    ...(followersNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "follow",
      created_at: notif.follower_created_at, // Use follower_created_at for sorting
      isUnread: !notif.follower_read,
    })),
    ...(shortFiresNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "short_like",
      isUnread: !notif.read,
    })),
    ...(shortCommentsNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "short_comment",
      isUnread: !notif.read,
    })),
    ...(shortRepliesNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "short_reply",
      isUnread: !notif.read,
    })),
    ...(shortTipsNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "short_tip",
      isUnread: !notif.read,
    })),
    ...(directTipsNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "direct_tip",
      isUnread: !notif.read,
    })),
    ...(longFormFiresNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "long_like",
      isUnread: !notif.read,
    })),
    ...(longFormCommentsNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "long_comment",
      isUnread: !notif.read,
    })),
    ...(longFormRepliesNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "long_reply",
      isUnread: !notif.read,
    })),
    ...(ideaFiresNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "idea_like",
      isUnread: !notif.read,
    })),
    ...(ideaCommentsNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "idea_comment",
      isUnread: !notif.read,
    })),
    ...(ideaRepliesNotifications ?? []).map((notif: any) => ({
      ...notif,
      type: "idea_reply",
      isUnread: !notif.read,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Handle notification click
  const handleNotificationClick = async (notif: any) => {
    // Check if the notification is unread
    if (notif.isUnread) {
      switch (notif.type) {
        case "follow":
          await updateFollowerRead(notif.id);
          break;
        case "short_like":
          await updateShortFireRead(notif.id);
          break;
        case "short_comment":
          await updateShortCommentRead(notif.id);
          break;
        case "short_reply":
          await updateShortReplyRead(notif.id);
          break;
        case "short_tip":
          await updateShortTipRead(notif.id);
          break;
        case "direct_tip":
          await updateDirectTipRead(notif.id);
          break;
        case "long_like":
          await updateLongFormFireRead(notif.id);
          break;
        case "long_comment":
          await updateLongFormCommentRead(notif.id);
          break;
        case "long_reply":
          await updateLongFormReplyRead(notif.id);
          break;
        case "idea_like":
          await updateIdeaFireRead(notif.id);
          break;
        case "idea_comment":
          await updateIdeaCommentRead(notif.id);
          break;
        case "idea_reply":
          await updateIdeaReplyRead(notif.id);
          break;
        default:
          break;
      }

      // Refetch notifications after updating read status
      refetch();
    }
  };

  // Clear All Notifications function
  const clearAllNotifications = async () => {
    for (const notif of allNotifications) {
      switch (notif.type) {
        case "follow":
          await updateFollowerRead(notif.id);
          break;
        case "short_like":
          await updateShortFireRead(notif.id);
          break;
        case "short_comment":
          await updateShortCommentRead(notif.id);
          break;
        case "short_reply":
          await updateShortReplyRead(notif.id);
          break;
        case "short_tip":
          await updateShortTipRead(notif.id);
          break;
        case "direct_tip":
          await updateDirectTipRead(notif.id);
          break;
        case "long_like":
          await updateLongFormFireRead(notif.id);
          break;
        case "long_comment":
          await updateLongFormCommentRead(notif.id);
          break;
        case "long_reply":
          await updateLongFormReplyRead(notif.id);
          break;
        case "idea_like":
          await updateIdeaFireRead(notif.id);
          break;
        case "idea_comment":
          await updateIdeaCommentRead(notif.id);
          break;
        case "idea_reply":
          await updateIdeaReplyRead(notif.id);
          break;
        default:
          break;
      }
    }

    // Refetch after marking all as read
    refetch();
  };

  const showMoreNotifications = async () => {
    fetchMore();
  };

  return (
    <div className="flex flex-col h-screen-custom m-auto overflow-y-auto scroll items-top gap-1 p-4 rounded-2xl">
      {allNotifications.map((notif: any, index: number) => {
        let message: React.ReactNode = "";
        if (notif.type === "follow") {
          message = (
            <Link
              href={"/" + notif.follower.username}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.follower} width={6} height={6} />
                  <span className="font-semibold">{notif.follower.username}</span> followed you.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "short_like") {
          message = (
            <Link
              href={"/v/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.liker} width={6} height={6} />
                  <span className="font-semibold">{notif.liker.username}</span> liked your short.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "short_comment") {
          message = (
            <Link
              href={"/v/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.commenter} width={6} height={6} />
                  <span className="font-semibold">{notif.commenter.username}</span> commented on your short.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "short_reply") {
          message = (
            <Link
              href={"/v/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.replier} width={6} height={6} />
                  <span className="font-semibold">{notif.replier.username}</span> replied to you on a short.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                </div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "long_like") {
          message = (
            <Link
              href={"/video/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.liker} width={6} height={6} />
                  <span className="font-semibold">{notif.liker.username}</span> liked your video.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "long_comment") {
          message = (
            <Link
              href={"/video/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.commenter} width={6} height={6} />
                  <span className="font-semibold">{notif.commenter.username}</span> commented on your video.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "long_reply") {
          message = (
            <Link
              href={"/video/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.replier} width={6} height={6} />
                  <span className="font-semibold">{notif.replier.username}</span> replied to you on a video.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "idea_like") {
          message = (
            <Link
              href={"/spark/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.liker} width={6} height={6} />
                  <span className="font-semibold">{notif.liker.username}</span> liked your spark.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "idea_comment") {
          message = (
            <Link
              href={"/spark/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.commenter} width={6} height={6} />
                  <span className="font-semibold">{notif.commenter.username}</span> commented on your spark.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "idea_reply") {
          message = (
            <Link
              href={"/spark/" + notif.post_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.replier} width={6} height={6} />
                  <span className="font-semibold">{notif.replier.username}</span> replied to your spark.
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "short_tip") {
          message = (
            <Link
              href={"/v/" + notif["3sec_tips"].video_id}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 mb-1 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif["3sec_tips"].tipper} width={6} height={6} />
                  <span className="font-semibold">{notif["3sec_tips"].tipper.username}</span> sent you love{" "}
                  <div className="badge badge-primary">
                    $
                    {convertEthToUsd(
                      notif["3sec_tips"].amount,
                      notif["3sec_tips"].network === 122 ? fusePrice : ethPrice,
                    )}
                  </div>
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        } else if (notif.type === "direct_tip") {
          message = (
            <Link
            href={`https://www.kinnectwallet.com/transaction/payment/${
              notif.direct_tips.network === 84532 || notif.direct_tips.network === 8453
                ? "base"
                : notif.direct_tips.network === 11155111 || notif.direct_tips.network === 1
                ? "ethereum"
                : notif.direct_tips.network === 122
                ? "fuse"
                : ""
            }/${notif.direct_tips.transaction_hash}`}
              onClick={() => handleNotificationClick(notif)}
              className={`flex items-center p-4 rounded-md ${notif.isUnread && "bg-base-200"}`}
            >
              <div className="flex flex-row justify-between w-full items-center">
                <div className="flex flex-row gap-1 items-center">
                  <Avatar profile={notif.direct_tips.tipper} width={6} height={6} />
                  <span className="font-semibold">{notif.direct_tips.tipper.username}</span> sent you love{" "}
                  <div className="badge badge-primary">
                    $
                    {convertEthToUsd(
                      notif.direct_tips.amount,
                      notif.direct_tips.network === 122 ? fusePrice : ethPrice,
                    )}
                  </div>
                </div>
                <div className="text-xs opacity-75 flex flex-row gap-1">
                  <TimeAgo timestamp={notif.created_at} />
                {notif.isUnread && <div className="w-[10px] h-[10px] rounded-full bg-blue-500"></div>}</div>
                
              </div>
            </Link>
          );
        }
        return (
          <div key={index}>
            {message}
          </div>
        );
      })}
      {allNotifications.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={clearAllNotifications}
            className="hidden btn btn-outline btn-primary btn-sm"
          >
            Hidden
          </button>
          <button
            onClick={showMoreNotifications}
            className="btn btn-outline btn-primary btn-sm"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
