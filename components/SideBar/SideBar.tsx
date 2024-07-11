"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendarDays, faGear } from "@fortawesome/free-solid-svg-icons";

export default function SideBar() {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const baseClasses = "px-6 py-2 font-medium no-underline rounded-r-2xl flex items-center gap-4";
    const activeClasses = "bg-themeOrange-200 text-themeWhite-100";
    const inactiveClasses = "hover:bg-themeOrange-300";
    
    return `${baseClasses} ${pathname === href ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="border-r border-themeWhite-200 bg-themeWhite-100 box-border w-52 flex flex-col h-screen">
      {/* Upper div with Home and Calendar */}
      <div className="flex flex-col pr-2 py-3 h-full overflow-auto">
        <Link href='/' className={getLinkClassName('/')}>
          <FontAwesomeIcon icon={faHouse} className="text-base" />
          <h4>Home</h4>
        </Link>

        <Link href='/calendar' className={getLinkClassName('/calendar')}>
          <FontAwesomeIcon icon={faCalendarDays} className="text-xl" />
          <h4>Calendar</h4>
        </Link>
      </div>
      
      <div className="flex flex-col pr-2 py-3 border-t border-themeWhite-200 h-36">
        <Link href='/settings' className={getLinkClassName('/settings')}>
          <FontAwesomeIcon icon={faGear} className="text-lg" />
          <h4>Settings</h4>
        </Link>
      </div>
    </div>
  );
}