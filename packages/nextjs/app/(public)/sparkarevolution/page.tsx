"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import { TypewriterEffectSmooth } from "~~/components/ui/typewriter-effect";
import Link from "next/link";
import Image from "next/image";
import { TextHoverEffect } from "~~/components/ui/text-hover-effect";
import { Vortex } from "~~/components/ui/vortex";
import { useRouter } from "next/navigation";

const Landing: NextPage = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState("Sign up");

  const stepContent: Record<string, JSX.Element> = {
    "Sign up": <><div className="">
      <label className="label cursor-pointer">
        <span className="label-text mr-2">Sign up to join</span>
        <input type="checkbox" defaultChecked className="checkbox checkbox-info" />
      </label>
      <button
                className="w-fit px-4 h-10 font-semibold rounded-xl bg-black border dark:border-white border-transparent text-white text-base"
                onClick={() => router.push("/login")}
              >
                Sign up
              </button>
    </div>
    </>,
    "Connect with kins": <><div className="">
      <label className="label cursor-pointer">
        <span className="label-text mr-2">Connected with +500 kins</span>
        <input type="checkbox" defaultChecked className="checkbox checkbox-info" />
      </label>
    </div>
    </>,
    "Post content": <><div className="">
      <label className="label cursor-pointer">
        <span className="label-text mr-2">Post and share +150 sparks</span>
        <input type="checkbox" defaultChecked className="checkbox checkbox-info" />
      </label>
    </div>
      <div className="">
        <label className="label cursor-pointer">
          <span className="label-text mr-2">Post and share +20 videos</span>
          <input type="checkbox" defaultChecked className="checkbox checkbox-info" />
        </label>
      </div>
      <div className="">
        <label className="label cursor-pointer">
          <span className="label-text mr-2">Post and share +35 shorts</span>
          <input type="checkbox" defaultChecked className="checkbox checkbox-info" />
        </label>
      </div>
    </>,
    "Verified badge": <><div className="">
      <label className="label cursor-pointer">
        <span className="label-text mr-2">Congrats, you are ready tor receive verified badge</span>
        <input type="checkbox" defaultChecked className="checkbox checkbox-success" />
      </label>
    </div>
    </>,
    "Apply for rewards": <><div className="">
      <label className="label cursor-pointer">
        <span className="label-text mr-2">Hit apply for reward program and start earning!</span>
        <input type="checkbox" defaultChecked className="checkbox checkbox-error" />
      </label>
    </div>
    </>,
  };

  const steps = [
    "Sign up",
    "Connect with kins",
    "Post content",
    "Verified badge",
    "Apply for rewards",
  ];

  const words2 = [
    {
      text: "Become a super creator, today.",
      className: "text-primary dark:text-primary",
    },
  ];

  return (
    <>
      <div className="grow">
        <div className="w-[calc(100%)] mx-auto rounded-md h-screen overflow-hidden">
          <Vortex
            backgroundColor="black"
            rangeY={800}
            particleCount={500}
            baseHue={120}
            className="flex items-center flex-col justify-center px-4 md:px-10 py-4 w-full h-full"
          >
            <div className="h-[40rem] flex flex-col items-center justify-center">
              <TextHoverEffect text="SPARK" duration={undefined} />
              <TextHoverEffect text="A" duration={undefined} />
              <TextHoverEffect text="REVOLUTION" duration={undefined} />
            </div>
          </Vortex>
        </div>

        {/* BLOCK */}
        <div className="flex flex-col items-center justify-center">
          
          <div className="flex flex-col items-center justify-center h-[30rem]">
            <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base">
              Join the program now.
            </p>
            <TypewriterEffectSmooth words={words2} className={undefined} cursorClassName={undefined} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
              <button
                className="w-fit px-4 h-10 font-semibold rounded-xl bg-black border dark:border-white border-transparent text-white text-base transform transition-transform duration-300 hover:-translate-y-2"
                onClick={() => router.push("/login")}
              >
                Get started now
              </button>
              <Link
                href="#sparkl"
                className="flex flex-row font-semibold justify-center items-center w-fit px-4 h-10 rounded-xl bg-white text-black border border-black text-base transform transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="mr-2 flex flex-row justify-center items-center">
                  <Image
                    src={`/spark/spark-logo.png`}
                    alt="spark logo"
                    height={120}
                    width={120}
                    className="w-4 h-auto"
                    draggable={false}
                  />
                </div>
                Am I eligible?
              </Link>
            </div>
            <Link
              href="https://t.me/sparkarevolution"
              className="flex flex-row px-3 mt-4 justify-center items-center w-fit h-10 rounded-xl bg-transparent border border-blue-500 text-base hover:opacity-85"
            >
              <div className="mr-2 flex flex-row justify-center items-center">
                <Image
                  src={`/tele/Logo.svg`}
                  alt="spark logo"
                  height={120}
                  width={120}
                  className="w-4 h-auto"
                  draggable={false}
                />
              </div>
              <span className="text-blue-400">sparkarevolution</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center mt-20 mb-40">
        <h2 id="sparkl" className="text-2xl font-semibold mb-4">How to join?</h2>
          <ul className="steps">
            {steps.map((step, index) => (
              <li
                key={step}
                className={`step ${index < 3
                    ? "step-info"
                    : index === 3
                      ? "step-success"
                      : "step-error"
                  }`}
                onClick={() => setActiveStep(step)}
                style={{ cursor: "pointer" }}
                data-content={index === 4 ? "?" : undefined}
              >
                {step}
              </li>
            ))}
          </ul>
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-center">
            {stepContent[activeStep]}
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
