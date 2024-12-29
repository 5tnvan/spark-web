"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SparkApp from "./sparkLayout";
import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { fetchShort } from "~~/utils/wildfire/fetch/fetch3Sec";
import { NextUIProvider } from "@nextui-org/react";

/**
 * SE-2 APP LAYOUT
 * Entry point to the app
 **/
const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const { video_id } = useParams();
  const [videoMetadata, setVideoMetadata] = useState<any>();

  const init = async () => {
    const res = await fetchShort(video_id);
    setVideoMetadata(res);
  };

  useEffect(() => {
    if (video_id) {
      init();
    }
  }, [video_id]);

  return (
    <html suppressHydrationWarning>
      {videoMetadata && (
        <head>
          <title>{videoMetadata.profile.username}</title>
          <meta name="description" content={"3-second app"} />
          <meta property="og:image" content={videoMetadata.thumbnail_url} />
          <meta name="twitter:image" content={videoMetadata.thumbnail_url} />
        </head>
      )}
      <body>
        <ThemeProvider>
        <NextUIProvider>
          <ScaffoldEthAppWithProviders>
            <SparkApp>{children}</SparkApp>
          </ScaffoldEthAppWithProviders>
          </NextUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
