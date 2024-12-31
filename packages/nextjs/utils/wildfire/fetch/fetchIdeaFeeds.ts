"use server";

import { createClient } from "~~/utils/supabase/server";


/**
 * FETCH: fetchUserIdeaFeedAll()
 * DB: supabase
 * TABLE: "idea"
 * COMMENT: This is for counting the total amount of sparks belonging to a user
 **/
export const fetchUserIdeaFeedAll = async (user_id: any) => {
  const supabase = createClient();
  const { data } = await supabase.from("idea").select("id", { count: "exact" }).eq("user_id", user_id).neq("archived", true);

  return data;
};

/**
 * FETCH: fetchUserIdeaFeedWithRange()
 * DB: supabase
 * TABLE: "idea_desc_view"
 * COMMENT: This is for fetching feed of sparks belonging to a user, with comments
 **/
export const fetchUserIdeaFeedWithRange = async (user_id: string, from: any, to: any) => {
  const supabase = createClient();
  const { data } = await supabase
    .from("idea_desc_view")
    .select(`*, idea_views(*), idea_fires(*),
      idea_comments(*, profile:user_id(username), idea_replies:id(*, profile:user_id(id, username, avatar_url)))`)
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(from, to)
    .neq("archived", true);

  return data;
};

/**
 * FETCH: fetchRandomFeed()
 * DB: supabase
 * TABLE: "3sec_desc_view"
 **/

export const fetchRandomIdeaFeed = async (limit: any) => {
  const supabase = createClient();
  const { data } = await supabase
    .from("idea_random_view")
    .select(
      `*,
      profile:user_id(*),
      idea_views(*),
      idea_fires(*),
      idea_comments(*, profile:user_id(username), idea_replies:id(*, profile:user_id(id, username, avatar_url)))`,
    )
    .limit(limit)
    .neq("archived", true);

  return data;
};

/**
 * FETCH: fetchMostViewed()
 * DB: supabase
 * TABLE: "3sec_desc_view"
 **/
export const fetchLastestIdeaFeed = async (from: any, to: any) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("idea_desc_view")
    .select(`*,
      profile:user_id(*),
      idea_views(*),
      idea_fires(*),
      idea_comments(*, profile:user_id(username),
      idea_replies:id(*, profile:user_id(id, username, avatar_url)))`)
    .order("created_at", { ascending: false })
    .range(from, to)
    .neq("archived", true);

  if (error) {
    console.error("fetchLastestIdeaFeed", error);
    return null;
  }

  return data;
};

/**
 * FETCH: fetchMostViewedFeed()
 * DB: supabase
 * TABLE: "long_form_views"
 **/
export const fetchMostViewedIdeaFeed = async (from: any, to: any) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("long_form_view_count_view")
    .select(`*, long_form:video_id(*, profile:user_id(*))`)
    .order("view_count", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("fetchMostViewedIdeaFeed", error);
    return null;
  }

  return data;
};

/**
 * FETCH: fetchUserFeedFromArrayOfFollowing()
 * DB: supabase
 * TABLE: "3sec_desc_view"
 **/
export const fetchUserFeedFromArrayOfFollowing = async (followingArray: any, from: number, to: number) => {
  const supabase = createClient();
  const { data } = await supabase
    .from("idea_desc_view")
    .select(`*,
      profile:user_id(*),
      idea_views(*),
      idea_fires(*),
      idea_comments(*, profile:user_id(username), idea_replies:id(*, profile:user_id(id, username, avatar_url)))`)
    .in("user_id", followingArray)
    .range(from, to)
    .neq("archived", true);

  return { data };
};