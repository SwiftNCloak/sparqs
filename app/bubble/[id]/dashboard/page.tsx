"use client"

import { useEffect } from "react";

export default function BubbleDashboardPage() {
  useEffect(() => {
    document.title = 'Name of Bubble | Sparqs';
  }, []);

  return (
    <div>
      DASHBOARD
    </div>
  );
}
  