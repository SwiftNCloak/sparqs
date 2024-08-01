"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Tag {
  id: string;
  name: string;
  likes: number;
  dislikes: number;
}

interface BubbleData {
  id: string;
  team_name: string;
  voting_phase: 'first_round' | 'second_round' | 'completed';
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchBubbleData();
    fetchTags();
    checkIfCreator();
  }, [params.id]);

  const fetchBubbleData = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('id, team_name, voting_phase')
      .eq('id', params.id)
      .single();
    if (data) setBubble(data);
    else if (error) console.error('Error fetching bubble:', error);
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('bubble_tags')
      .select('*')
      .eq('bubble_id', params.id);
    if (data) setTags(data.map(tag => ({ ...tag, likes: 0, dislikes: 0 })));
    else if (error) console.error('Error fetching tags:', error);
  };

  const checkIfCreator = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && bubble) {
      const { data } = await supabase
        .from('bubbles')
        .select('created_by')
        .eq('id', params.id)
        .single();
      setIsCreator(user.id === data?.created_by);
    }
  };

  const handleVote = async (tagId: string, voteType: 'like' | 'dislike') => {
    setTags(tags.map(tag => 
      tag.id === tagId ? {...tag, [voteType]: tag[voteType] + 1} : tag
    ));
    // In a real app, you'd save this vote to the database
  };

  const handleEndFirstRound = async () => {
    const likedTags = tags.filter(tag => tag.likes > tag.dislikes);
    setTags(likedTags.map(tag => ({ ...tag, likes: 0, dislikes: 0 })));
    await updateVotingPhase('second_round');
  };

  const handleEndSecondRound = async () => {
    await updateVotingPhase('completed');
  };

  const updateVotingPhase = async (phase: 'first_round' | 'second_round' | 'completed') => {
    const { error } = await supabase
      .from('bubbles')
      .update({ voting_phase: phase })
      .eq('id', params.id);
    
    if (!error) {
      setBubble(prev => prev ? {...prev, voting_phase: phase} : null);
    } else {
      console.error('Error updating voting phase:', error);
    }
  };

  if (!bubble) return <div>Loading...</div>;

  const winningTag = tags.reduce((prev, current) => 
    (prev.likes > current.likes) ? prev : current
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble.team_name} - Voting Session</h1>
      
      {bubble.voting_phase !== 'completed' && (
        <>
          <h2 className="text-xl font-bold mb-2">
            {bubble.voting_phase === 'first_round' ? 'First' : 'Final'} Voting Round
          </h2>
          <ul className="mb-4">
            {tags.map(tag => (
              <li key={tag.id} className="flex items-center justify-between mb-2">
                {tag.name}
                <div>
                  <button
                    onClick={() => handleVote(tag.id, 'like')}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Like ({tag.likes})
                  </button>
                  <button
                    onClick={() => handleVote(tag.id, 'dislike')}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Dislike ({tag.dislikes})
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {isCreator && (
            <button
              onClick={bubble.voting_phase === 'first_round' ? handleEndFirstRound : handleEndSecondRound}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              End {bubble.voting_phase === 'first_round' ? 'First' : 'Final'} Round
            </button>
          )}
        </>
      )}

      {bubble.voting_phase === 'completed' && (
        <div>
          <h2 className="text-xl font-bold mb-2">Voting Completed</h2>
          <p>The winning tag is: {winningTag.name} with {winningTag.likes} likes</p>
          {isCreator && (
            <button
              onClick={() => router.push(`/bubble/${params.id}`)}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}