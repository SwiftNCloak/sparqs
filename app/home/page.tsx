"use client"

import { useEffect } from "react";

export default function Homepage() {
  useEffect(() => {
    document.title = 'Home | Sparqs';
  }, []);

  return (
    <div className="items-center justify-center flex flex-col h-[500px]">
      <img src="/image/home_empty.png" alt="No bubbles" width={350} height={350} />
      <div className="items-center justify-center flex space-x-3 text-themeWhite-100">
        <button className="px-3 py-2 rounded-md bg-themeOrange-200 ">
            Create bubble
        </button>
        <button className="px-3 py-2 rounded-md bg-themeOrange-200 ">
            Join bubble
        </button>
      </div>
    </div>
  );
}
