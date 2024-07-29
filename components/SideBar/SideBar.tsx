"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faHouse, faCalendarDays, faGear } from "@fortawesome/free-solid-svg-icons";

interface NavLinkProps {
  href: string;
  icon: IconDefinition;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label }) => {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const baseClasses = "px-6 py-2 font-medium no-underline rounded-r-2xl flex items-center gap-4";
    const activeClasses = "bg-themeOrange-200 text-themeWhite-100";
    const inactiveClasses = "hover:bg-themeOrange-300";
    
    return `${baseClasses} ${pathname === href ? activeClasses : inactiveClasses}`;
  };

  return (
    <Link href={href} className={`${getLinkClassName(href)} space-x-1`}>
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export default function SideBar() {
  return (
    <div className="border-r hidden border-themeWhite-200 bg-themeWhite-100 box-border w-52 md:flex flex-col h-screen">
      {/* Upper div with Home and Calendar */}
      <div className="flex flex-col pr-2 py-3 h-full overflow-auto">
        <NavLink href="/" icon={faHouse} label="Home" />
        <NavLink href="/calendar" icon={faCalendarDays} label="Calendar" />
      </div>
      
      {/* Lower div with Settings */}
      <div className="flex flex-col pr-2 py-3 border-t border-themeWhite-200 h-36">
        <NavLink href="/settings" icon={faGear} label="Settings" />
      </div>
    </div>
  );
}