"use client"

import { useEffect } from "react";

export default function Calendar() {
  useEffect(() => {
    document.title = 'Calendar | Sparqs';
  }, []);

  return (
    <div>
      CALENDAR
    </div>
  );
}
  