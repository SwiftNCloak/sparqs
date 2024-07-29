"use client"

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BubblePage() {
  const params = useParams();
  const [bubble, setBubble] = useState(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchBubble();
  }, [params.id]);

  const fetchBubble = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('*')
      .eq('id', params.id)
      .single();
    if (data) {
      setBubble(data);
      setNewTeamName(data.team_name);
    }

    const { count } = await supabase
      .from('bubble_members')
      .select('*', { count: 'exact', head: true })
      .eq('bubble_id', params.id);
    
    setMemberCount(count);
  };

  const handleEdit = async () => {
    if (isEditing) {
      const { data, error } = await supabase
        .from('bubbles')
        .update({ team_name: newTeamName })
        .eq('id', bubble.id);
      
      if (!error) {
        fetchBubble();
      } else {
        alert("Failed to update bubble name");
      }
    }
    setIsEditing(!isEditing);
  };

  if (!bubble) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <input 
            type="text" 
            value={newTeamName} 
            onChange={(e) => setNewTeamName(e.target.value)}
            className="text-2xl font-bold border-b-2 border-themeOrange-200 focus:outline-none"
          />
        ) : (
          <h1 className="text-2xl font-bold">{bubble.team_name}</h1>
        )}
        <button 
          onClick={handleEdit}
          className="px-3 py-1 bg-themeOrange-200 text-white rounded"
        >
          {isEditing ? "Save" : "Edit"}
        </button>
      </div>
      <p className="mb-2">{bubble.description}</p>
      <p className="mb-2">Code: {bubble.code}</p>
      <p>Members: {memberCount}</p>
    </div>
  );
}