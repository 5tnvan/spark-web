"use server";

import { createClient } from "~~/utils/supabase/server";

/**
 * FETCH: fetchFollowersNotifications()
 * DB: supabase
 * TABLE: notifications
 * RETURN: { data }
 **/

export const fetchFollowersNotifications = async (user_id: any, from: number, to: number) => {
  console.log("fetchFollowersNotifications from to", from, to);
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from("notifications")
      .select("*, follower:follower_id(id, username, avatar_url)")
      .eq("user_id", user_id)
      .order("follower_created_at", { ascending: false })
      .range(from, to)
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

export const fetchDirectTipsNotifications = async (user_id: any, from: number, to: number) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("notifications_direct_tips")
      .select(`
        *,
        direct_tips (*,
          tipper:wallet_id_from (id, username, avatar_url),
          tipped:wallet_id_to (id, username, avatar_url)
        )
      `)
      .order("created_at", { ascending: false })
      .filter("direct_tips.tipped.id", "eq", user_id)
      .range(from, to)
      
    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};
