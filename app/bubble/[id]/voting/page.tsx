// - it will retrieve the tags from tags page... and database
// - looping structure until 1 final idea remains
// - final idea is then passed to the final page

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
  description: string;
  is_started: boolean;
  voting_phase: 'not_started' | 'first_round' | 'second_round' | 'completed';
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchBubbleData();
    fetchTags();
    checkIfCreator();
    fetchCurrentUser();
  }, [params.id]);

  const fetchBubbleData = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('*')
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
      setIsCreator(user.id === bubble.created_by);
    }
  };

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleStartVoting = async () => {
    const { error } = await supabase
      .from('bubbles')
      .update({ voting_phase: 'first_round' })
      .eq('id', params.id);
    
    if (!error) {
      setBubble({ ...bubble!, voting_phase: 'first_round' });
    } else {
      console.error('Error starting voting:', error);
    }
  };

  const handleVote = async (tagId: string, voteType: 'like' | 'dislike') => {
    const updatedTags = tags.map(tag => {
      if (tag.id === tagId) {
        return {
          ...tag,
          [voteType]: tag[voteType] + 1
        };
      }
      return tag;
    });
    setTags(updatedTags);

    // In a real application, you'd want to save this vote to the database
    // and ensure each user can only vote once per tag.
  };

  const handleEndFirstRound = async () => {
    const likedTags = tags.filter(tag => tag.likes > tag.dislikes);
    setTags(likedTags.map(tag => ({ ...tag, likes: 0, dislikes: 0 })));

    const { error } = await supabase
      .from('bubbles')
      .update({ voting_phase: 'second_round' })
      .eq('id', params.id);
    
    if (!error) {
      setBubble({ ...bubble!, voting_phase: 'second_round' });
    } else {
      console.error('Error ending first round:', error);
    }
  };

  const handleEndSecondRound = async () => {
    const winningTag = tags.reduce((prev, current) => 
      (prev.likes > current.likes) ? prev : current
    );

    const { error } = await supabase
      .from('bubbles')
      .update({ voting_phase: 'completed', winning_tag: winningTag.id })
      .eq('id', params.id);
    
    if (!error) {
      setBubble({ ...bubble!, voting_phase: 'completed' });
    } else {
      console.error('Error ending second round:', error);
    }
  };

  if (!bubble) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble.team_name} - Voting</h1>
      
      {bubble.voting_phase === 'not_started' && isCreator && (
        <button
          onClick={handleStartVoting}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Start Voting
        </button>
      )}

      {(bubble.voting_phase === 'first_round' || bubble.voting_phase === 'second_round') && (
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
          <p>The winning tag is: {tags.find(tag => tag.id === bubble.winning_tag)?.name}</p>
        </div>
      )}
    </div>
  );
}