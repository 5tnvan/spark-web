"use server";

import { createClient } from "~~/utils/supabase/server";

export const fetchIdeaFiresNotifications = async (user_id: any, from: number, to: number) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_idea_fires")
      .select("*, liker:liked_by(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(from, to)
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const fetchIdeaCommentsNotifications = async (user_id: any, from: number, to: number) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_idea_comments")
      .select("*, commenter:commented_by(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(from, to)
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const fetchIdeaRepliesNotifications = async (user_id: any, from: number, to: number) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications_idea_replies")
      .select("*, replier:reply_by(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(from, to)
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

// export const fetchLongFormTipsNotifications = async (user_id: any, from: number, to: number) => {
//   const supabase = createClient();
//   try {
//     const { data } = await supabase
//       .from("notifications_tips")
//       .select("*, 3sec_tips(*, tipper:wallet_id(id, username, avatar_url))")
//       .eq("user_id", user_id)
//       .order("created_at", { ascending: false })
//       .range(from, to)
//     return data;
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return null;
//   }
// };