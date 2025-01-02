import React from "react";
import Image from "next/image";

type Props = {
  profile: any;
  width: any;
  height: any;
};

export const Avatar = ({ profile, width, height }: Props) => {
  let textSize;
  if (width > 8) {
    textSize = "text-2xl";
  } else {
    textSize = "text-sm";
  }
  return (
    <>
      {profile?.avatar_url && (
        <div className={`rounded-full w-${width} h-${height} border border-primary glow`}>
          <Image
            alt="img"
            src={profile.avatar_url}
            className="avatar-img rounded-full object-cover w-full h-full"
            width={100}
            height={100}
            unoptimized
          />
        </div>
      )}
      {!profile?.avatar_url && (
        <div
          className={`flex justify-center items-center w-${width} h-${width} rounded-full border border-primary bg-base-200 glow`}
        >
          <div className={`${textSize} text-primary`}>{profile?.username.charAt(0).toUpperCase()}</div>
        </div>
      )}
    </>
  );
};
