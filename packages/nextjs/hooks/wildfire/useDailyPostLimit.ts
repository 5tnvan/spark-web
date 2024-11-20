"use client";

import { useEffect, useState } from "react";
import { fetchLastVideoPosts, fetchLevel } from "~~/utils/wildfire/fetch/fetch3Sec";
import { fetchUser } from "~~/utils/wildfire/fetch/fetchUser";

/**
 * useFeed HOOK
 * Use this to check daily posting limit
 **/
export const useDailyPostLimit = () => {
  // State variables to manage loading state, post limit, remaining posts, and fetched posts
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState<boolean | null>(null);
  const [postLeft, setPostLeft] = useState<number | null>(null);
  const [posts, setPosts] = useState<any>([]);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  // Function to toggle triggerRefetch, causing a refetch of data
  const refetch = () => {
    setTriggerRefetch(prev => !prev);
  };

  // Function to initialize and fetch data
  const init = async () => {
    setIsLoading(true); // Start loading

    const now = new Date();
    const user = await fetchUser();

    // Fetch last video posts
    const posts = await fetchLastVideoPosts(user.user?.id);
    setPosts(posts);
    const levelData = await fetchLevel(user.user?.id);

    if (!levelData) {
      if (posts && posts.length > 0) {
        const postDate = new Date(posts[0].created_at);
        const diff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60); // difference in hours

        if (diff < 24) {
          setLimit(true);
          setPostLeft(0);
        } else {
          setLimit(false);
          setPostLeft(1);
        }
      } else {
        setLimit(false);
        setPostLeft(1);
      }
    }

    if (levelData) {
      if (posts && posts.length > 1) {
        const postDate1 = new Date(posts[0].created_at);
        const postDate2 = new Date(posts[1].created_at);
        const diff1 = (now.getTime() - postDate1.getTime()) / (1000 * 60 * 60); // difference in hours
        const diff2 = (now.getTime() - postDate2.getTime()) / (1000 * 60 * 60); // difference in hours

        if (diff1 < 24 && diff2 < 24) {
          setLimit(true);
          setPostLeft(0);
        } else if (diff1 < 24) {
          setLimit(false);
          setPostLeft(1);
        } else {
          setLimit(false);
          setPostLeft(2);
        }
      } else if (posts && posts?.length === 1) {
        const postDate = new Date(posts[0].created_at);
        const diff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60); // difference in hours

        if (diff < 24) {
          setLimit(false);
          setPostLeft(1);
        } else {
          setLimit(false);
          setPostLeft(2);
        }
      } else {
        setLimit(false);
        setPostLeft(2);
      }
    }

    setIsLoading(false); // Stop loading
  };

  // useEffect to initialize data fetching when component mounts or triggerRefetch changes
  useEffect(() => {
    init();
  }, [triggerRefetch]);

  // Return the loading state, post limit, posts, remaining posts, and refetch function
  return { isLoading, limit, posts, postLeft, refetch };
};
