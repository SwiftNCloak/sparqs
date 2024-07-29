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
  const [newDescription, setNewDescription] = useState('');
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
      setNewDescription(data.description);
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
        .update({ 
          team_name: newTeamName,
          description: newDescription
        })
        .eq('id', bubble.id);
      
      if (!error) {
        fetchBubble();
      } else {
        alert("Failed to update bubble information");
      }
    }
    setIsEditing(!isEditing);
  };

  if (!bubble) return <div>Loading...</div>;

  return (
    <div className="p-2">
      <div className="bg-[#8cb9bd] rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          {isEditing ? (
            <input 
              type="text" 
              value={newTeamName} 
              onChange={(e) => setNewTeamName(e.target.value)}
              className="text-3xl font-bold bg-transparent border-b-2 border-white focus:outline-none text-white w-full mr-4"
            />
          ) : (
            <h1 className="text-3xl font-bold text-white">{bubble.team_name}</h1>
          )}
          <button 
            onClick={handleEdit}
            className="px-4 py-2 bg-themeOrange-200 text-white rounded-md hover:bg-themeOrange-300 transition-colors duration-200 whitespace-nowrap"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>
        {isEditing ? (
          <textarea 
            value={newDescription} 
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full bg-transparent border-b-2 border-white focus:outline-none text-white mb-2 resize-none"
            rows="3"
          />
        ) : (
          <p className="text-white mb-2">{bubble.description}</p>
        )}
        <p className="text-white text-sm">Invite Code: {bubble.code}</p>
      </div>
      <p className="text-gray-600">Members: {memberCount}</p>
    </div>
  );
}