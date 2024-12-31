"use server";

import { createClient } from "~~/utils/supabase/server";

export const fetchFiresNotifications = async (user_id: any) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_fires")
      .select("*, liker:liked_by(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const fetchCommentsNotifications = async (user_id: any) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_comments")
      .select("*, commenter:commented_by(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const fetchRepliesNotifications = async (user_id: any) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_replies")
      .select("*, replier:reply_by(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const fetchTipsNotifications = async (user_id: any) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_tips")
      .select("*, 3sec_tips(*, tipper:wallet_id(id, username, avatar_url))")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};