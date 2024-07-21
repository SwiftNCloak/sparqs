"use client"

import { useEffect } from "react";
import { logout } from "./logout/page";

export default function Home() {
  useEffect(() => {
    document.title = 'Home | Sparqs';
  }, []);
     <form action={logout}>
        <button type="submit">
          Logout
        </button>

     </form>
  return (
    <div>
      HOMEPAGE
    </div>
  );
}
