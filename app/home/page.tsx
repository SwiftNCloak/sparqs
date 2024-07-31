"use client"

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPencilAlt, faTrash, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

export default function Homepage() {
  const [bubbles, setBubbles] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    document.title = 'Home | Sparqs';
    fetchCurrentUser();
    fetchBubbles();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

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
            code,
            created_by
          )
        `)
        .eq('user_id', user.id);
      if (data) setBubbles(data.map(item => item.bubbles));
    }
  };

  const createBubble = async () => {
    if (currentUser) {
      const teamName = prompt("Enter team name:");
      const description = prompt("Enter description:");
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data, error } = await supabase
        .from('bubbles')
        .insert({
          team_name: teamName,
          description: description,
          code,
          created_by: currentUser.id
        })
        .select()
        .single();
      
      if (data) {
        await supabase.from('bubble_members').insert({
          bubble_id: data.id,
          user_id: currentUser.id
        });
        router.push(`/bubble/${data.id}`);
      }
    }
  };

  const joinBubble = async () => {
    const code = prompt("Enter bubble code:");
    if (code && currentUser) {
      const { data, error } = await supabase
        .from('bubbles')
        .select('id')
        .eq('code', code)
        .single();
      
      if (data) {
        const { error } = await supabase.from('bubble_members').insert({
          bubble_id: data.id,
          user_id: currentUser.id
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

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    router.push(`/bubble/${id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this bubble? This action cannot be undone.")) {
      const { error: membersError } = await supabase
        .from('bubble_members')
        .delete()
        .eq('bubble_id', id);
  
      if (membersError) {
        alert("Failed to delete bubble members: " + membersError.message);
        return;
      }
  
      const { error: bubbleError } = await supabase
        .from('bubbles')
        .delete()
        .eq('id', id);
  
      if (bubbleError) {
        alert("Failed to delete bubble: " + bubbleError.message);
      } else {
        fetchBubbles();
      }
    }
  };

  const handleLeave = async (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to leave this bubble?")) {
      const { error } = await supabase
        .from('bubble_members')
        .delete()
        .eq('bubble_id', id)
        .eq('user_id', currentUser.id);

      if (error) {
        alert("Failed to leave bubble: " + error.message);
      } else {
        fetchBubbles();
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
    <div className="min-h-[500px] w-full p-2">
      <h2 className="text-2xl font-bold mb-4">Your Bubbles</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            onClick={() => router.push(`/bubble/${bubble.id}`)}
            className="relative px-4 py-3 border text-white border-gray-300 bg-themeOrange-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer w-full sm:w-72 h-24 max-h-24"
          >
            <div className="items-center justify-between flex">
              <h3 className="font-semibold truncate">{bubble.team_name}</h3>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEllipsis}
                  className="w-4 h-4 cursor-pointer"
                  onClick={(e) => handleMenuClick(e, bubble.id)}
                />
                {openMenuId === bubble.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {currentUser && currentUser.id === bubble.created_by ? (
                        <>
                          <button
                            onClick={(e) => handleEdit(e, bubble.id)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, bubble.id)}
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => handleLeave(e, bubble.id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
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