import Link from "next/link";

export default function SideBar() {
  return (
    <div className="border-r border-themeWhite-200 bg-themeWhite-100 box-border w-52 flex flex-col h-screen">
      {/* Upper div with Home and Calendar */}
      <div className="flex flex-col pr-2 py-3 h-full overflow-auto">
        <Link href='/' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100 rounded-r-2xl">Home</Link>
        <Link href='/calendar' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100 rounded-r-2xl">Calendar</Link>
        {/* Add more buttons here if needed */}
      </div>
      
      {/* Lower div with Settings */}
      <div className="flex flex-col pr-2 py-3 border-t border-themeWhite-200 h-36">
        <Link href='/settings' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100 rounded-r-2xl">Settings</Link>
      </div>
    </div>
  );
}
