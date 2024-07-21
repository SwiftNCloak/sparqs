"use client"

import { useEffect } from "react";

export default function Settings() {
  useEffect(() => {
    document.title = 'Settings | Sparqs';
  }, []);

  return (
    <div>
      SETTINGS
    </div>
  );
}
