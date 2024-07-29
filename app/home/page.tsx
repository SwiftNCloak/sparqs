"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Homepage() {
  const [bubbles, setBubbles] = useState([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    document.title = 'Home | Sparqs';
    fetchBubbles();
  }, []);

  const fetchBubbles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('bubble_members')
        .select(`
          bubble_id,
          bubbles:bubble_id (
            id,
            team_name,
            description,
            code
          )
        `)
        .eq('user_id', user.id);
      if (data) setBubbles(data.map(item => item.bubbles));
    }
  };

  const createBubble = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const teamName = prompt("Enter team name:");
      const description = prompt("Enter description:");
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('bubbles')
        .insert({
          team_name: teamName,
          description: description,
          code,
          created_by: user.id
        })
        .select()
        .single();
      
      if (data) {
        await supabase.from('bubble_members').insert({
          bubble_id: data.id,
          user_id: user.id
        });
        router.push(`/bubble/${data.id}`);
      }
    }
  };

  const joinBubble = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const code = prompt("Enter bubble code:");
    if (code && user) {
      const { data, error } = await supabase
        .from('bubbles')
        .select('id')
        .eq('code', code)
        .single();
      
      if (data) {
        const { error } = await supabase.from('bubble_members').insert({
          bubble_id: data.id,
          user_id: user.id
        });
        if (!error) {
          router.push(`/bubble/${data.id}`);
        } else {
          alert("You're already a member of this bubble");
        }
      } else {
        alert("Invalid bubble code");
      }
    }
  };

  if (bubbles.length === 0) {
    return (
      <div className="min-h-[500px] w-full flex flex-col items-center justify-center">
        <img src="/image/home_empty.png" alt="No bubbles" className="mb-6" width={350} height={350} />
        <div className="flex space-x-4">
          <button onClick={createBubble} className="px-4 py-2 rounded-md bg-themeOrange-200 text-white hover:bg-themeOrange-300 transition-colors duration-200">
            Create bubble
          </button>
          <button onClick={joinBubble} className="px-4 py-2 rounded-md bg-themeOrange-200 text-white hover:bg-themeOrange-300 transition-colors duration-200">
            Join bubble
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] w-full p-6">
      <h2 className="text-2xl font-bold mb-4">Your Bubbles</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            onClick={() => router.push(`/bubble/${bubble.id}`)}
            className="px-4 py-3 border text-white border-gray-300 bg-themeOrange-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer w-72 max-w-72 h-24 max-h-24"
          >
            <h3 className="font-semibold">{bubble.team_name}</h3>
            <p className="text-sm truncate">{bubble.description}</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        <button onClick={createBubble} className="px-4 py-2 rounded-md bg-[#8cb9bd] text-white hover:bg-[#7b9ea1] transition-colors duration-200">
          Create bubble
        </button>
        <button onClick={joinBubble} className="px-4 py-2 rounded-md bg-[#8cb9bd] text-white hover:bg-[#7b9ea1] transition-colors duration-200">
          Join bubble
        </button>
      </div>
    </div>
  );
}