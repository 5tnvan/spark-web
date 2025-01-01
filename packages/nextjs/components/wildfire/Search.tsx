"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "../Avatar";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useDebounce } from "~~/hooks/wildfire/useDebounce";
import { fetchProfileMatching } from "~~/utils/wildfire/fetch/fetchProfile";

export const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const [searchRes, setSearchRes] = useState<any>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue);
  const searchRef = useRef<any>(null);

  useOutsideClick(searchRef, () => {
    resetSearch();
  });

  const resetSearch = () => {
    setSearchValue("");
    setSearchRes(null);
  }

  //fetch profile on search
  useEffect(() => {
    const fetchProfile = async () => {
      console.log("debouncedSearchValue: ", debouncedSearchValue);
      setIsSearchLoading(true);

      const result = await fetchProfileMatching(debouncedSearchValue.toLowerCase());
      setSearchRes(result);

      setIsSearchLoading(false);
    };
    if (debouncedSearchValue.trim() !== "") {
      fetchProfile();
    } else {
      //clear results
      setSearchRes(null);
    }
  }, [debouncedSearchValue]);
  return (
    <div className="flex flex-col grow relative">
      {/* SEARCH INPUT */}
      <label className="input flex grow bg-base-200 rounded-lg">
        <MagnifyingGlassIcon width={20} />
        <input
          type="text"
          placeholder="Search"
          className="ml-2 bg-base-200"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </label>

      {/* SEARCH RESULTS */}
      {isSearchLoading && (
        <div className="bg-base-200 rounded-lg p-4 mt-2 absolute top-11 w-full z-20">
          <div className="flex flex-col gap-2">
            <span className="loading loading-ring loading-sm"></span>
          </div>
        </div>
      )}
      {!isSearchLoading && searchRes && searchRes.length > 0 && (
        <div ref={searchRef} className="bg-base-200 rounded-lg p-4 mt-2 absolute top-11 w-full z-30">
          <div className="flex flex-col gap-2">
            {searchRes.map((searchProfile: any) => (
              <Link
                key={searchProfile.username} // Add a unique key for each result
                href={`/${searchProfile.username}`}
                className="result flex items-center"
                onClick={() => resetSearch()}
              >
                <Avatar profile={searchProfile} width={8} height={8} />
                <div className="ml-2">@{searchProfile.username}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
