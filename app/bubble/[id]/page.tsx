"use client"

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPencilAlt, faTrash, faSignOutAlt, faPlay } from "@fortawesome/free-solid-svg-icons";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchCurrentUser();
    fetchBubble();
    fetchMembers();

    const unsubscribe = subscribeToMemberChanges();

    return () => {
      unsubscribe();
    };
  }, [params.id]);

  const subscribeToMemberChanges = () => {
    const subscription = supabase
      .channel('bubble_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bubble_members',
          filter: `bubble_id=eq.${params.id}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

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
  };

  const fetchMembers = async () => {
    console.log('Fetching members for bubble:', params.id);
    const { data: memberData, error: memberError, count } = await supabase
      .from('bubble_members')
      .select('user_id', { count: 'exact' })
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
        const membersWithRoles = userData.map(user => ({
          ...user,
          isCreator: user.id === bubble?.created_by,
          role: user.id === bubble?.created_by ? "Owner" : "Member"
        }));
        setMembers(membersWithRoles);
        setMemberCount(count || 0);
      }
    } else {
      console.log('No members found for this bubble');
      setMembers([]);
      setMemberCount(0);
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
    setIsMenuOpen(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this bubble? This action cannot be undone.")) {
      const { error: membersError } = await supabase
        .from('bubble_members')
        .delete()
        .eq('bubble_id', bubble?.id);
  
      if (membersError) {
        alert("Failed to delete bubble members: " + membersError.message);
        return;
      }
  
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

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the bubble?")) {
      const { error } = await supabase
        .from('bubble_members')
        .delete()
        .eq('bubble_id', bubble?.id)
        .eq('user_id', memberId);

      if (error) {
        alert("Failed to remove member: " + error.message);
      } else {
        console.log("Member removed successfully");
        fetchMembers(); // Refresh members list after removal
      }
    }
  };

  const handleStart = () => {
    // Your logic to start the bubble
    alert("Bubble started!");
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    handleEdit();
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleDelete();
  };

  const handleLeaveClick = (e) => {
    e.stopPropagation();
    handleLeave();
  };

  const handleStartClick = (e) => {
    e.stopPropagation();
    handleStart();
  };

  const isCreator = currentUser && bubble && currentUser.id === bubble.created_by;

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
          <div className="relative">
            <FontAwesomeIcon
              icon={faEllipsis}
              className="w-6 h-6 cursor-pointer text-white"
              onClick={handleMenuClick}
            />
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  {isCreator ? (
                    <>
                      <button
                        onClick={handleEditClick}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                        {isEditing ? "Save" : "Edit"}
                      </button>
                      <button
                        onClick={handleDeleteClick}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        Delete
                      </button>
                      <button
                        onClick={handleStartClick}
                        className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                      >
                        <FontAwesomeIcon icon={faPlay} className="mr-2" />
                        Start
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleLeaveClick}
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
              <li key={member.id} className="text-gray-700 flex items-center justify-between">
                <span>{`${member.username} (${member.role})`}</span>
                {isCreator && !member.isCreator && (
                  <button 
                    onClick={() => handleRemoveMember(member.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                  >
                    Remove
                  </button>
                )}
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