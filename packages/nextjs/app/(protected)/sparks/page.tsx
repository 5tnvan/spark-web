"use client";

import { useState } from "react";
import React from "react";
import Image from "next/image";
import { NextPage } from "next";
import { ArrowDownCircleIcon, ChatBubbleOvalLeftEllipsisIcon, EyeIcon, FireIcon } from "@heroicons/react/24/solid";
import { TimeAgo } from "~~/components/wildfire/TimeAgo";
import { useIdeasFeed } from "~~/hooks/wildfire/useIdeaFeeds";
import { Avatar } from "~~/components/Avatar";
import { useRouter } from "next/navigation";
import FormatNumber from "~~/components/wildfire/FormatNumber";
import { Card, CardBody, CardFooter, CardHeader, Code, Divider, Link } from "@nextui-org/react";
import { calculateComments, calculatePoints } from "~~/utils/wildfire/calculatePoints";

const Sparks: NextPage = () => {
  const router = useRouter();
  const [filter, setFilter] = useState("latest");

  // FETCH DIRECTLY
  const { loading: loadingFeed, feed, fetchMore, refetch } = useIdeasFeed(filter, 6, 9);

  // Helper function to format text with hashtags and mentions
  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <div key={`line-${i}`}>
        {line
          .split(/(#\w+|@\w+)/g) // Split text into parts with hashtags/mentions
          .map((part, index) => {
            if (part.startsWith("#")) {
              return (
                <Code key={`hash-${i}-${index}`} className="text-blue-500 hover:opacity-80">
                {part}</Code>
                
              );
            } else if (part.startsWith("@")) {
              return (
                <Code
                  key={`mention-${i}-${index}`}
                  color="warning"
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
      <div className="mx-2 h-screen-custom overflow-scroll">
        {/* FILTER */}
        <div className="flex flex-row gap-1 mb-2">
          {/* Button: Most Viewed */}
          {/* <div
            className={`btn btn-sm ${
              filter === "mostViewed"
                ? "bg-gradient-to-r from-cyan-600 via-lime-500 to-lime-500 border-0 text-black"
                : "dark:bg-zinc-800 bg-zinc-200"
            }`}
            onClick={() => {
              setFilter("mostViewed");
              refetch();
            }}
          >
            <div className="flex flex-col w-6 h-6">
              <Image
                src="/yougotthis.png"
                width={150}
                height={150}
                alt="fresh"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <span>Most Viewed</span>
          </div> */}

          {/* Button: Rising */}
          <div
            className={`btn btn-sm ${
              filter === "latest"
                ? "bg-gradient-to-r from-cyan-600 via-lime-500 to-lime-500 border-0 text-black"
                : "dark:bg-zinc-800 bg-zinc-200"
            }`}
            onClick={() => {
              setFilter("latest");
              refetch();
            }}
          >
            <div className="flex flex-col w-6 h-6">
              <Image src="/1f525.gif" width={150} height={150} alt="rising" style={{ width: "auto", height: "auto" }} />
            </div>
            <span>Newest</span>
          </div>
        </div>

        {/* GRID FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {feed.map((idea: any, index: any) => (
            <>
            <Card className="" key={index}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex flex-row items-center space-x-2">
                  <Avatar profile={idea.profile} width={10} height={10} />
                  <Link href={`/${idea.profile.username}`} color="foreground" className="text-sm font-bold">
                    @{idea.profile.username}
                  </Link>
                  <span className="text-xs text-gray-300">
                    <TimeAgo timestamp={idea.created_at} />
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
                  <Link color="foreground" href={`/spark/${idea.id}`} className="flex flex-row items-center gap-1 text-sm">
                    <EyeIcon width={18} height={18} />
                    <FormatNumber number={idea.idea_views[0].view_count} />
                  </Link>
                  <Link color="foreground" href={`/spark/${idea.id}`} className="flex flex-row items-center gap-1 text-sm">
                    <FireIcon width={18} height={18} />
                    <FormatNumber number={calculatePoints(idea.idea_fires)} />
                  </Link>
                  <Link color="foreground" href={`/spark/${idea.id}`} className="flex flex-row items-center gap-1 text-sm">
                    <ChatBubbleOvalLeftEllipsisIcon width={18} height={18} />
                    <FormatNumber number={calculateComments(idea.idea_comments)} />
                  </Link>
                </div>
                <Link color="foreground" showAnchorIcon href={`/spark/${idea.id}`} className="text-sm text-blue-500">
                  View spark
                </Link>
              </CardFooter>
            </Card>
          </>
          ))}
        </div>

        {/* LOADING INDICATOR */}
        {loadingFeed && (
          <div className="flex flex-row justify-evenly items-end my-5">
            <div className="grow flex flex-row justify-center">
              <span className="loading loading-dots loading-sm"></span>
            </div>
          </div>
        )}

        {/* FETCH MORE */}
        <div
          className="btn relative flex flex-row items-center justify-center mt-2 border-b-2 cursor-pointer"
          onClick={() => fetchMore()}
        >
          <ArrowDownCircleIcon width={30} />
        </div>
      </div>
    </>
  );
};

export default Sparks;
