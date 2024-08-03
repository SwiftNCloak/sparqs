import Link from "next/link";
import { logout } from "@/app/logout/page";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';

interface UserData {
  id: string;
  firstname: string;
  lastname: string;
  middlename: string;
  email: string;
  contact: string;
  username: string;
  is_premium: boolean;
}

export default function NavBar() {
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const supabase = createClient();
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Error fetching session:', sessionError);
                return;
            }

            if (session?.user) {
                const { data: userDataFromDB, error: userDataError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();
                
                if (userDataError) {
                    console.error('Error fetching user data:', userDataError);
                } else {
                    setUserData(userDataFromDB as UserData);
                    document.title = `${userDataFromDB.username} | Kodiwize`;
                }
            }
        };

        fetchUserData();
    }, []);

    if (!userData) {
        return (
            <div className="w-full px-6 py-3 bg-themeOrange-100 text-themeWhite-100 items-center 
                justify-between flex box-border">
                {/* Logo and Hamburger Icon */}
                <div className="items-center justify-between flex gap-3">
                    <FontAwesomeIcon icon={faBars} className="text-2xl" />
                    <Link href="/">
                    <h2 className="text-2xl font-extrabold">SparQs</h2>
                    </Link>
                </div>

                {/* Profile Picture and Notification Bell */}
                <div className="items-center justify-between flex gap-4">
                    {/* <FontAwesomeIcon icon={faBell} className="text-2xl" /> */}
                    <div className="border border-white rounded-full min-w-8 h-8 items-center 
                        justify-between flex px-3">
                    <p className="text-md"></p>
                    </div>
                    <form action={logout}>
                    <button type="submit">Logout</button>
                    </form>
                </div>
            </div>
        )
    }

    return (
      // The navigtion bar
      <div className="w-full px-6 py-3 bg-themeOrange-100 text-themeWhite-100 items-center 
                justify-between flex box-border">
        {/* Logo and Hamburger Icon */}
        <div className="items-center justify-between flex gap-3">
            <FontAwesomeIcon icon={faBars} className="text-2xl" />
            <Link href="/">
              <h2 className="text-2xl font-extrabold">SparQs</h2>
            </Link>
        </div>

        {/* Profile Picture and Notification Bell */}
        <div className="items-center justify-between flex gap-4">
            {/* <FontAwesomeIcon icon={faBell} className="text-2xl" /> */}
            <div className="border border-white rounded-full min-w-8 h-8 items-center 
                justify-between flex px-3">
              <p className="text-md">{userData.username}</p>
            </div>
            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
        </div>
      </div>
    );
  }
  