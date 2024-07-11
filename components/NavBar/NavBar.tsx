import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";

export default function NavBar() {
    return (
      // The navigtion bar
      <div className="w-full px-6 py-3 bg-themeOrange-100 text-themeWhite-100 items-center 
                justify-between flex">
        {/* Logo and Hamburger Icon */}
        <div className="items-center justify-between flex gap-3">
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
            <Link href="/">
              <h2 className="text-2xl font-extrabold">SparQs</h2>
            </Link>
        </div>

        {/* Profile Picture and Notification Bell */}
        <div className="items-center justify-between flex gap-4">
            <FontAwesomeIcon icon={faBell} className="text-2xl" />
            <div className="border border-white rounded-full w-8 h-8"></div>
        </div>
      </div>
    );
  }
  