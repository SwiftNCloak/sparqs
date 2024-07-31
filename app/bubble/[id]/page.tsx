"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  isCreator?: boolean;
}

interface BubbleData {
  id: string;
  team_name: string;
  description: string;
  code: string;
  created_by: string;
}

export default function BubblePage() {
  const params = useParams();
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [members, setMembers] = useState<UserData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCurrentUser();
    fetchBubble();
    fetchMembers();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchBubble = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('*, created_by')
      .eq('id', params.id)
      .single();
    if (data) {
      setBubble(data);
      setNewTeamName(data.team_name);
      setNewDescription(data.description);
    } else if (error) {
      console.error('Error fetching bubble:', error);
    }

    const { count, error: countError } = await supabase
      .from('bubble_members')
      .select('*', { count: 'exact', head: true })
      .eq('bubble_id', params.id);
    
    if (countError) {
      console.error('Error fetching member count:', countError);
    } else {
      setMemberCount(count || 0);
    }
  };

  const fetchMembers = async () => {
    console.log('Fetching members for bubble:', params.id);
    const { data: memberData, error: memberError } = await supabase
      .from('bubble_members')
      .select('user_id')
      .eq('bubble_id', params.id);

    if (memberError) {
      console.error('Error fetching member data:', memberError);
      return;
    }

    console.log('Member data:', memberData);

    if (memberData && memberData.length > 0) {
      const userIds = memberData.map(member => member.user_id);
      console.log('User IDs:', userIds);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        console.log('User data:', userData);
        const membersWithCreatorTag = userData.map(user => ({
          ...user,
          isCreator: user.id === bubble?.created_by
        }));
        setMembers(membersWithCreatorTag);
      }
    } else {
      console.log('No members found for this bubble');
      setMembers([]);
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      const { data, error } = await supabase
        .from('bubbles')
        .update({ 
          team_name: newTeamName,
          description: newDescription
        })
        .eq('id', bubble?.id);
      
      if (!error) {
        fetchBubble();
      } else {
        alert("Failed to update bubble information");
      }
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bubble? This action cannot be undone.")) {
      // First, delete all associated bubble members
      const { error: membersError } = await supabase
        .from('bubble_members')
        .delete()
        .eq('bubble_id', bubble?.id);
  
      if (membersError) {
        alert("Failed to delete bubble members: " + membersError.message);
        return;
      }
  
      // Then, delete the bubble itself
      const { error: bubbleError } = await supabase
        .from('bubbles')
        .delete()
        .eq('id', bubble?.id);
  
      if (bubbleError) {
        alert("Failed to delete bubble: " + bubbleError.message);
      } else {
        router.push('/home');
      }
    }
  };

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this bubble?")) {
      const { error } = await supabase
        .from('bubble_members')
        .delete()
        .eq('bubble_id', bubble?.id)
        .eq('user_id', currentUser.id);

      if (error) {
        alert("Failed to leave bubble: " + error.message);
      } else {
        router.push('/home');
      }
    }
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
          {currentUser && currentUser.id === bubble.created_by ? (
            <div className="flex space-x-2">
              <button 
                onClick={handleEdit}
                className="px-4 py-2 bg-themeOrange-200 text-white rounded-md hover:bg-themeOrange-300 transition-colors duration-200 whitespace-nowrap"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLeave}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 whitespace-nowrap"
            >
              Leave
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea 
            value={newDescription} 
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full bg-transparent border-b-2 border-white focus:outline-none text-white mb-2 resize-none"
            rows={3}
          />
        ) : (
          <p className="text-white mb-2">{bubble.description}</p>
        )}
        <p className="text-white text-sm">Invite Code: {bubble.code}</p>
      </div>
      <p className="text-xl font-bold text-gray-600">Members: {memberCount}</p>
      <div>
        {members.length > 0 ? (
          <ul className="list-disc list-inside">
            {members.map((member) => (
              <li key={member.id} className="text-gray-700">
                {member.username} {member.isCreator && "(Creator)"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">No members found for this bubble.</p>
        )}
      </div>
    </div>
  );
}