"use client";

import { useState } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useScroll, useTransform } from "framer-motion";
import type { NextPage } from "next";
import { Card, Carousel } from "~~/components/ui/apple-cards-carousel";
import AndroidTestModal from "~~/components/wildfire/AndroidTestModal";
import { TypewriterEffectSmooth } from "~~/components/ui/typewriter-effect";
import { GoogleGeminiEffect } from "~~/components/ui/google-gemini-effect";

const Landing: NextPage = () => {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
    const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
    const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
    const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
    const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

    const words2 = [
        {
            text: "From an idea to a revolution.",
            className: "text-primary dark:text-primary",
        },
    ];

    //TIP MODAL
    const [isAndroidTestModalOpen, setAndroidTestModalOpen] = useState(false);

    const closeAndroidTestModal = () => {
        setAndroidTestModalOpen(false);
    };

    const cards = data.map((card, index) => <Card key={card.src} card={card} index={index} />);

    return (
        <>
            <div className="">
                {isAndroidTestModalOpen && <AndroidTestModal onClose={closeAndroidTestModal} />}
                {/* BLOCK */}
                <div
                    className="h-[400vh] bg-black w-full dark:border dark:border-white/[0.1] rounded-md relative pt-40 overflow-clip"
                    ref={ref}
                >
                    <GoogleGeminiEffect
                        pathLengths={[
                            pathLengthFirst,
                            pathLengthSecond,
                            pathLengthThird,
                            pathLengthFourth,
                            pathLengthFifth,
                        ]} title={"Open media, powered by you."} description={"Ad-Free. Censorship-Free. Peer-to-peer donations."} className={""} />
                </div>

                {/* BLOCK */}
                <div className="w-full h-full mt-20">
                    {/* <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                        The future of 3C's:
                    </h2>
                    <h3 className="max-w-7xl pl-4 mx-auto text-xl font-normal text-neutral-800 dark:text-neutral-200 font-sans">
                        Content & Commerce & Community
                    </h3> */}
                    <Carousel items={cards} />
                </div>

                {/* BLOCK */}
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center h-[30rem]">
                        <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
                            Ad-Free. Censorship-Free. Peer-to-peer donations.
                        </p>
                        <TypewriterEffectSmooth words={words2} className={undefined} cursorClassName={undefined} />
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
                            <Link href="/login" className="flex flex-row font-semibold justify-center items-center w-40 h-10 font-semibold rounded-xl bg-black border dark:border-white border-transparent text-white text-base transform transition-transform duration-300 hover:-translate-y-2">
                                Join now
                            </Link>
                            <Link href="/home" className="flex flex-row font-semibold justify-center items-center w-40 h-10 rounded-xl bg-white text-black border border-black text-base transform transition-transform duration-300 hover:-translate-y-2">
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
                                Launch App
                            </Link>
                            
                        </div>
                        <Link href="https://t.me/sparkarevolution" className="flex flex-row px-2 mt-4 justify-center items-center w-40 h-10 rounded-xl bg-transparent border border-blue-500 text-base hover:opacity-85">
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

                {/* BLOCK */}
                <div className="w-full rounded-lg m-auto mt-20 mb-20">
                    <h2 className="text-lg font-sans text-center">
                        Apps (beta)
                    </h2>
                    <div className="flex flex-col md:flex-row justify-center items-center md:gap-4">
                        <Link
                            href="https://apps.apple.com/us/app/wildfire-3-seconds-app/id6503965553"
                            target="new"
                            className="flex items-center justify-center w-48 mt-3 text-white bg-black h-14 rounded-xl border border-zinc-500"
                        >
                            <div className="mr-3">
                                <svg viewBox="0 0 384 512" width="30">
                                    <path
                                        fill="currentColor"
                                        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                                    ></path>
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs">Download on the</div>
                                <div className="-mt-1 font-sans text-xl font-semibold">App Store</div>
                            </div>
                        </Link>
                        <Link
                            href="/"
                            onClick={() => setAndroidTestModalOpen(true)}
                            type="button"
                            className="flex items-center justify-center w-48 mt-3 text-white bg-black rounded-lg h-14 border border-zinc-500"
                        >
                            <div className="mr-3">
                                <svg viewBox="30 336.7 120.9 129.2" width="30">
                                    <path
                                        fill="#FFD400"
                                        d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7  c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"
                                    ></path>
                                    <path
                                        fill="#FF3333"
                                        d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3  c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"
                                    ></path>
                                    <path
                                        fill="#48FF48"
                                        d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1  c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"
                                    ></path>
                                    <path
                                        fill="#3BCCFF"
                                        d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6  c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"
                                    ></path>
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs">GET IT ON</div>
                                <div className="-mt-1 font-sans text-xl font-semibold">Google Play</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* BLOCK */}
                <div className="flex flex-col items-center my-40">
                    <div className="bg-neutral-800 rounded-xl p-20">
                    <h2 className="text-lg text-neutral-100 font-sans">
                        Ecosystem
                    </h2>
                    <div className="grid grid-cols-2 grid-rows-3 justify-center items-center gap-10 ">
                        <Link href="https://www.livepeer.org/" target="_blank" className=" self-center">
                            <Image
                                src={"/livepeer/Livepeer-Logo-Full-Light.svg"}
                                alt="hero"
                                height={600}
                                width={200}
                                className=""
                                draggable={false}
                                style={{ width: "200px", height: "auto" }}
                            />
                        </Link>
                        <Link href="https://www.kinnectwallet.com/" target="_blank" className=" self-center">
                            <Image
                                src={"/kinnect/kinnect-full-logo-blue.svg"}
                                alt="hero"
                                height={600}
                                width={200}
                                className=""
                                draggable={false}
                                style={{ width: "200px", height: "auto" }}
                            />
                        </Link>
                        <Link href="https://thegraph.com/" target="_blank" className=" self-center">
                            <Image
                                src={"/thegraph/TheGraph-Logo-Light.svg"}
                                alt="hero"
                                height={600}
                                width={200}
                                className=""
                                draggable={false}
                                style={{ width: "200px", height: "auto" }}
                            />
                        </Link>
                        <Link href="https://base.org/" target="_blank" className=" self-center">
                            <Image
                                src={"/base/Base_Wordmark_White.svg"}
                                alt="hero"
                                height={600}
                                width={200}
                                className=""
                                draggable={false}
                                style={{ width: "140px", height: "auto" }}
                            />
                        </Link>
                        <Link href="https://ethereum.org/" target="_blank" className=" self-center">
                            <Image
                                src={"/ethereum/ethereum-logo-landscape-purple.png"}
                                alt="hero"
                                height={600}
                                width={200}
                                className=""
                                draggable={false}
                                style={{ width: "180px", height: "auto" }}
                            />
                        </Link>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center"></div>
                    </div>
                    
                </div>
            </div>
        </>
    );
};

const DummyContent = () => {
    return (
        <>
            {[...new Array(3).fill(1)].map((_: any, index: number) => {
                return (
                    <div key={"dummy-content" + index} className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
                        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
                            <span className="font-bold text-neutral-700 dark:text-neutral-200">
                                Text
                            </span>{" "}
                            Text
                        </p>
                        <Image
                            src="https://assets.aceternity.com/macbook.png"
                            alt="Spark App"
                            height={200}
                            width={200}
                            className="md:w-1/2 md:h-1/2 h-full w-full mx-auto object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority
                        />
                    </div>
                );
            })}
        </>
    );
};

const data = [
    {
        category: "#decentralized",
        title: "",
        src: "https://images.unsplash.com/photo-1719937206930-84afb0daf141?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        content: <DummyContent />,
    },
    {
        category: "#shorts",
        title: "",
        src: "/ezgif-4-e1d7762367.gif",
        content: <DummyContent />,
    },
    {
        category: "#sparks",
        title: "",
        src: "/premium_photo-1687989651281-d9dfee04ec74.png",
        content: <DummyContent />,
    },
    {
        category: "#videos",
        title: "",
        src: "/ezgif-3-489a4dc383.gif",
        content: <DummyContent />,
    },
];

export default Landing;
