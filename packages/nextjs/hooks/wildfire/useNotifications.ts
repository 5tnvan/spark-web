"use client";

import { useEffect, useState } from "react";
import { createClient } from "~~/utils/supabase/client";
import { fetchLongFormCommentsNotifications, fetchLongFormFiresNotifications, fetchLongFormRepliesNotifications } from "~~/utils/wildfire/fetch/fetchLongFormNotifications";
import { fetchDirectTipsNotifications, fetchFollowersNotifications } from "~~/utils/wildfire/fetch/fetchNotifications";
import { fetchShortCommentsNotifications, fetchShortFiresNotifications, fetchShortRepliesNotifications, fetchTipsNotifications } from "~~/utils/wildfire/fetch/fetchShortsNotifications";
import { 
  fetchIdeaCommentsNotifications, 
  fetchIdeaFiresNotifications, 
  fetchIdeaRepliesNotifications 
} from "~~/utils/wildfire/fetch/fetchIdeaNotifications";
import { fetchUser } from "~~/utils/wildfire/fetch/fetchUser";

const getRange = (page: number, range: number) => {
  const from = page * range;
  const to = from + range - 1;
  return { from, to };
};

/**
 *  HOOK
 * Use this to get notification data of currently authenticated user
 **/
export const useNotifications = (range: number) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [followersNotifications, setFollowersNotifications] = useState<any>();
  const [directTipsNotifications, setDirectTipsNotifications] = useState<any>();
  const [shortFiresNotifications, setShortFiresNotifications] = useState<any>();
  const [shortCommentsNotifications, setShortCommentsNotifications] = useState<any>();
  const [shortRepliesNotifications, setShortRepliesNotifications] = useState<any>();
  const [shortTipsNotifications, setShortTipsNotifications] = useState<any>();
  const [longFormFiresNotifications, setLongFormFiresNotifications] = useState<any>();
  const [longFormCommentsNotifications, setLongFormCommentsNotifications] = useState<any>();
  const [longFormRepliesNotifications, setLongFormRepliesNotifications] = useState<any>();
  const [ideaFiresNotifications, setIdeaFiresNotifications] = useState<any>();
  const [ideaCommentsNotifications, setIdeaCommentsNotifications] = useState<any>();
  const [ideaRepliesNotifications, setIdeaRepliesNotifications] = useState<any>();
  const [triggerRefetch, setTriggerRefetch] = useState(false);
  const supabase = createClient();

  const refetch = () => {
    setTriggerRefetch(prev => !prev); //toggle triggerRefetch to false/true
  };
  
  const fetchMore = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const init = async () => {
    setIsLoading(true);
    const { from, to } = getRange(page, range);
    const user = await fetchUser();
    if (user.user?.id) {
      setUser(user);
      const followers = await fetchFollowersNotifications(user?.user?.id, from, to);
      const shortsFires = await fetchShortFiresNotifications(user?.user?.id, from, to);
      const shortsComments = await fetchShortCommentsNotifications(user?.user?.id, from, to);
      const shortsReplies = await fetchShortRepliesNotifications(user?.user?.id, from, to);
      const longFormFires = await fetchLongFormFiresNotifications(user?.user?.id, from, to);
      const longFormComments = await fetchLongFormCommentsNotifications(user?.user?.id, from, to);
      const longFormReplies = await fetchLongFormRepliesNotifications(user?.user?.id, from, to);
      const ideaFires = await fetchIdeaFiresNotifications(user.user.id, from, to);
      const ideaComments = await fetchIdeaCommentsNotifications(user.user.id, from, to);
      const ideaReplies = await fetchIdeaRepliesNotifications(user.user.id, from, to);
      const shortsTips = await fetchTipsNotifications(user?.user?.id, from, to);
      const directTipsNotificationsRes = await fetchDirectTipsNotifications(user?.user?.id, from, to);
    
      setFollowersNotifications((prev: any) => [...(prev || []), ...(followers || [])]);
      setShortFiresNotifications((prev: any) => [...(prev || []), ...(shortsFires || [])]);
      setShortCommentsNotifications((prev: any) => [...(prev || []), ...(shortsComments || [])]);
      setShortRepliesNotifications((prev: any) => [...(prev || []), ...(shortsReplies || [])]);
      setShortTipsNotifications((prev: any) => [...(prev || []), ...(shortsTips || [])]);
      setLongFormFiresNotifications((prev: any) => [...(prev || []), ...(longFormFires || [])]);
      setLongFormCommentsNotifications((prev: any) => [...(prev || []), ...(longFormComments || [])]);
      setLongFormRepliesNotifications((prev: any) => [...(prev || []), ...(longFormReplies || [])]);
      setIdeaFiresNotifications((prev: any) => [...(prev || []), ...(ideaFires || [])]);
      setIdeaCommentsNotifications((prev: any) => [...(prev || []), ...(ideaComments || [])]);
      setIdeaRepliesNotifications((prev: any) => [...(prev || []), ...(ideaReplies || [])]);
      setDirectTipsNotifications((prev: any) => [...(prev || []), ...(directTipsNotificationsRes || [])]);
    }
    setIsLoading(false);
  };
  
  

  //REFETCH WHEN NEW NOTIF DETECTED
  const handleFollowersChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleShortsFiresChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleShortsCommentsChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleShortsRepliesChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleLongFormFiresChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleLongFormCommentsChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleLongFormRepliesChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleIdeaFiresChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleIdeaCommentsChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleIdeaRepliesChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleShortsTipsChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };
  const handleDirectTipsChange = (payload: any) => {
    console.log("Change received!", payload);
    refetch();
  };

  //LISTEN TO REALTIME CHANGES
  supabase
    .channel("test")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user?.user?.id}` },
      handleFollowersChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_fires", filter: `user_id=eq.${user?.user?.id}` },
      handleShortsFiresChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_comments", filter: `user_id=eq.${user?.user?.id}` },
      handleShortsCommentsChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_replies", filter: `user_id=eq.${user?.user?.id}` },
      handleShortsRepliesChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_long_form_fires", filter: `user_id=eq.${user?.user?.id}` },
      handleLongFormFiresChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_long_form_comments", filter: `user_id=eq.${user?.user?.id}` },
      handleLongFormCommentsChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_long_form_replies", filter: `user_id=eq.${user?.user?.id}` },
      handleLongFormRepliesChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_idea_fires", filter: `user_id=eq.${user?.user?.id}` },
      handleIdeaFiresChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_idea_comments", filter: `user_id=eq.${user?.user?.id}` },
      handleIdeaCommentsChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_idea_replies", filter: `user_id=eq.${user?.user?.id}` },
      handleIdeaRepliesChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_tips", filter: `user_id=eq.${user?.user?.id}` },
      handleShortsTipsChange,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications_direct_tips", filter: `user_id=eq.${user?.user?.id}` },
      handleDirectTipsChange,
    )
    .subscribe();

  useEffect(() => {
    init();
  }, [page, triggerRefetch]);

  return { 
    isLoading, 
    followersNotifications,
    shortFiresNotifications,
    shortCommentsNotifications,
    shortRepliesNotifications,
    shortTipsNotifications,
    longFormFiresNotifications,
    longFormCommentsNotifications,
    longFormRepliesNotifications,
    ideaFiresNotifications,
    ideaCommentsNotifications,
    ideaRepliesNotifications,
    directTipsNotifications, 
    fetchMore, 
    refetch };
};
