import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendarDays, faGear } from "@fortawesome/free-solid-svg-icons";

export default function SideBar() {
  return (
    <div className="border-r border-themeWhite-200 bg-themeWhite-100 box-border w-52 flex flex-col h-screen">
      {/* Upper div with Home and Calendar */}
      <div className="flex flex-col pr-2 py-3 h-full overflow-auto">
        <Link href='/' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100 rounded-r-2xl flex items-center gap-4">
          <FontAwesomeIcon icon={faHouse} className="text-base" />
          <h4>Home</h4>
        </Link>

        <Link href='/calendar' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100 rounded-r-2xl flex items-center gap-4">
          <FontAwesomeIcon icon={faCalendarDays} className="text-xl" />
          <h4>Calendar</h4>
        </Link>
        {/* Add more buttons here if needed */}
      </div>
      
      {/* Lower div with Settings */}
      <div className="flex flex-col pr-2 py-3 border-t border-themeWhite-200 h-36">
        <Link href='/settings' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100 rounded-r-2xl flex items-center gap-4">
          <FontAwesomeIcon icon={faGear} className="text-lg" />
          <h4>Settings</h4>
        </Link>
      </div>
    </div>
  );
}
