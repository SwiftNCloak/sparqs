import Link from "next/link";

export default function SideBar() {
    return (
      // The sidebar
      <div className="border-r border-themeWhite-200 py-3 bg-themeWhite-100 box-border w-52">
        <Link href='/' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100">Home</Link>
        <Link href='/calendar' className="px-6 py-2 font-medium no-underline hover:bg-themeOrange-200 hover:text-themeWhite-100">Calendar</Link>
      </div>
    );
  }
  