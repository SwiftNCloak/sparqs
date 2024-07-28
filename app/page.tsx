"use client"

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import { logout } from "./logout/page";

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

export default function Home() {
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
          <div>
              <h2>Loading...</h2>
          </div>
      );
  }

  return (
      <div>
          <h1 className="text-xl font-bold">@{userData.username}</h1>
          <p className="text-md">{userData.firstname + " " + userData.middlename + " " + userData.lastname}</p>
      </div>
  );
}
