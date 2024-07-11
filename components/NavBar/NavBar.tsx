export default function NavBar() {
    return (
      // The navigtion bar
      <div className="w-full px-6 py-3 bg-themeOrange-100 text-themeWhite-100 items-center 
                justify-between flex">
        {/* Logo and Hamburger Icon */}
        <div className="items-center justify-between flex">
            <h2 className="text-2xl font-extrabold">SparQs</h2>
        </div>

        {/* Profile Picture and Notification Bell */}
        <div className="items-center justify-between flex">
            <div className="border border-white rounded-full w-8 h-8"></div>
        </div>
      </div>
    );
  }
  