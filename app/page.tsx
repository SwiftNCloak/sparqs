"use client"

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = 'Home | Sparqs';
  }, []);

  return (
    <div>
      HOMEPAGE
    </div>
  );
}
