import React, { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faHouse, faCalendarDays, faGear } from "@fortawesome/free-solid-svg-icons";

interface NavLinkProps {
  href: string;
  icon: IconDefinition;
  label: string;
  isExpanded: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, isExpanded }) => {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const baseClasses = "px-6 py-2 font-medium no-underline rounded-r-2xl flex items-center gap-4 transition-all duration-300";
    const activeClasses = "bg-themeOrange-200 text-themeWhite-100";
    const inactiveClasses = "hover:bg-themeOrange-300";
    
    return `${baseClasses} ${pathname === href ? activeClasses : inactiveClasses}`;
  };

  return (
    <Link href={href} className={getLinkClassName(href)}>
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      {isExpanded && <span className="transition-opacity duration-300">{label}</span>}
    </Link>
  );
};

export default function SideBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`border-r hidden border-themeWhite-200 bg-themeWhite-100 box-border md:flex flex-col h-screen transition-all duration-300 ${isExpanded ? 'w-52' : 'w-16'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Upper div with Home and Calendar */}
      <div className={`flex flex-col py-3 h-full overflow-auto pr-2`}>
        <NavLink href="/" icon={faHouse} label="Home" isExpanded={isExpanded} />
        {/* <NavLink href="/calendar" icon={faCalendarDays} label="Calendar" isExpanded={isExpanded} /> */}
      </div>
      
      {/* Lower div with Settings */}
      {/* <div className={`flex flex-col py-3 border-t border-themeWhite-200 h-36 pr-2`}>
        <NavLink href="/settings" icon={faGear} label="Settings" isExpanded={isExpanded} />
      </div> */}
    </div>
  );
}