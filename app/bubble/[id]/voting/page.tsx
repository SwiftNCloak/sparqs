"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Tag {
  id: string;
  name: string;
  votes: number;
}

interface BubbleData {
  id: string;
  team_name: string;
  description: string;
  is_started: boolean;
  created_by: string;
  current_phase: number;
  winning_tag: string | null;
}

interface UserVote {
  userId: string;
  tagId: string;
}

export default function BubbleTagVotingPage() {
  const params = useParams();
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseTagCounts, setPhaseTagCounts] = useState<number[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchBubbleData();
    fetchCurrentUser();
  }, [params.id]);

  useEffect(() => {
    if (bubble) {
      calculatePhaseTagCounts();
    }
  }, [bubble]);

  useEffect(() => {
    if (bubble && phaseTagCounts.length > 0) {
      fetchTags();
    }
  }, [bubble, currentPhase, phaseTagCounts]);

  useEffect(() => {
    if (bubble && currentUserId) {
      const isCreator = bubble.created_by === currentUserId;
      setIsCreator(isCreator);
    }
  }, [bubble, currentUserId]);

  const fetchBubbleData = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('*')
      .eq('id', params.id)
      .single();
    if (data) {
      setBubble(data);
      setCurrentPhase(data.current_phase || 1);
      if (data.current_phase === null) {
        updateBubblePhase(1);
      }
    } else if (error) {
      console.error('Error fetching bubble:', error);
    }
  };

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchTags = async () => {
    const { data: tagData, error: tagError } = await supabase
      .from('bubble_tags')
      .select('*')
      .eq('bubble_id', params.id)
      .eq('phase', currentPhase);
    
    if (tagError) {
      console.error('Error fetching tags:', tagError);
      return;
    }

    const { data: voteData, error: voteError } = await supabase
      .from('tag_votes')
      .select('*')
      .eq('bubble_id', params.id)
      .eq('phase', currentPhase);
      
    if (voteError) {
      console.error('Error fetching votes:', voteError);
      return;
    }
    
    const tagsWithVotes = tagData.map(tag => ({
      ...tag,
      votes: voteData.filter(vote => vote.tag_id === tag.id).length
    }));
    
    // Sort tags by votes in descending order
    const sortedTags = tagsWithVotes.sort((a, b) => b.votes - a.votes);
    setTags(sortedTags);
    setUserVotes(voteData.map(vote => ({ userId: vote.user_id, tagId: vote.tag_id })));
  };

  const calculatePhaseTagCounts = async () => {
    const { count, error } = await supabase
      .from('bubble_tags')
      .select('*', { count: 'exact', head: true })
      .eq('bubble_id', params.id)
      .eq('phase', 1);
  
    if (error) {
      console.error('Error counting initial tags:', error);
      return;
    }

    let remainingTags = count || 0;
    const counts: number[] = [10, 5, 3, 1]; // Adjust based on your requirements
      
    setPhaseTagCounts(counts);
  };

  const handleVote = async (tagId: string) => {
    if (!currentUserId) return;
    const hasVoted = userVotes.some(vote => vote.userId === currentUserId && vote.tagId === tagId);
    if (hasVoted) {
      // Remove vote
      const { error } = await supabase
        .from('tag_votes')
        .delete()
        .eq('user_id', currentUserId)
        .eq('tag_id', tagId)
        .eq('bubble_id', params.id)
        .eq('phase', currentPhase);
      if (error) {
          console.error('Error removing vote:', error);
          return;
      }
    } else {
      // Add vote
      const { error } = await supabase
        .from('tag_votes')
        .insert({
          user_id: currentUserId,
          tag_id: tagId,
          bubble_id: params.id,
          phase: currentPhase
        });

      if (error) {
        console.error('Error adding vote:', error);
        return;
      }
    }

    // Refresh tags and votes
    fetchTags();
  };

  const handleEndPhase = async () => {
    if (!bubble) return;

    const nextPhase = currentPhase + 1;
    const maxPhase = phaseTagCounts.length;

    if (nextPhase > maxPhase) {
      console.log('All phases completed');
      await handleFinalPhase();
      return;
    }

    const sortedTags = tags.sort((a, b) => b.votes - a.votes);
    const topTagsCount = phaseTagCounts[nextPhase - 1];
    const topTags = sortedTags.slice(0, topTagsCount);

    for (const tag of topTags) {
      const { error: updateTagError } = await supabase
        .from('bubble_tags')
        .update({ phase: nextPhase })
        .eq('id', tag.id);

      if (updateTagError) {
        console.error('Error updating tag phase:', updateTagError);
        return;
      }
    }

    // Delete votes for the current phase
    const { error: deleteVotesError } = await supabase
      .from('tag_votes')
      .delete()
      .eq('bubble_id', params.id)
      .eq('phase', currentPhase);

    if (deleteVotesError) {
      console.error('Error deleting votes for current phase:', deleteVotesError);
      return;
    }

    await updateBubblePhase(nextPhase);
    await fetchTags();

    setCurrentPhase(nextPhase);
    setTags([]);  // Clear the current tags
    setUserVotes([]);  // Clear the current votes
  };

  const handleFinalPhase = async () => {
    if (tags.length !== 1) {
      console.error('Unexpected number of tags in final phase');
      return;
    }

    const winningTag = tags[0];

    // Update the winning_tag in the bubbles table
    const { error: updateBubbleError } = await supabase
      .from('bubbles')
      .update({ winning_tag: winningTag.id })
      .eq('id', params.id);

    if (updateBubbleError) {
      console.error('Error updating winning tag:', updateBubbleError);
      return;
    }

    // Remove all other tags from bubble_tags
    const { error: deleteTagsError } = await supabase
      .from('bubble_tags')
      .delete()
      .eq('bubble_id', params.id)
      .neq('id', winningTag.id);

    if (deleteTagsError) {
      console.error('Error removing non-winning tags:', deleteTagsError);
      return;
    }

    // Clear all votes
    const { error: deleteVotesError } = await supabase
      .from('tag_votes')
      .delete()
      .eq('bubble_id', params.id);

    if (deleteVotesError) {
      console.error('Error clearing votes:', deleteVotesError);
      return;
    }

    // Update the UI
    setBubble({ ...bubble!, winning_tag: winningTag.id });
    setTags([winningTag]);
    setUserVotes([]);
    setCurrentPhase(phaseTagCounts.length + 1); // Set to a phase beyond the last voting phase
  };

  const updateBubblePhase = async (phase: number) => {
    const { error } = await supabase
      .from('bubbles')
      .update({ current_phase: phase })
      .eq('id', params.id);
      
    if (error) {
      console.error('Error updating bubble phase:', error);
    } else {
      setCurrentPhase(phase);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble?.team_name} - Tag Voting</h1>
      <p className="mb-4">Current Phase: {currentPhase > phaseTagCounts.length ? 'Final' : currentPhase}</p>
      
      {currentPhase > phaseTagCounts.length ? (
        <div>
          <p className="mb-4">Voting has concluded. The winning tag is:</p>
          <p className="text-xl font-bold">{tags[0]?.name}</p>
        </div>
      ) : (
        <div>
          <p className="mb-4">Vote for your favorite tags. You can vote for multiple tags, but only once per tag.</p>
          {tags.length === 0 ? (
            <p>No tags available for voting in this phase.</p>
          ) : (
            <ul className="space-y-4">
              {tags.map(tag => {
                const hasVoted = userVotes.some(vote => vote.userId === currentUserId && vote.tagId === tag.id);
                return (
                  <li key={tag.id} className="flex items-center justify-between">
                    <span>{tag.name}</span>
                    <div>
                      <span className="mr-4">Votes: {tag.votes}</span>
                      <button
                        onClick={() => handleVote(tag.id)}
                        className={`px-4 py-2 rounded ${hasVoted ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                        disabled={currentPhase > phaseTagCounts.length}
                      >
                        {hasVoted ? 'Remove Vote' : 'Vote'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {isCreator && tags.length > 0 && currentPhase <= phaseTagCounts.length && (
        <button
          onClick={handleEndPhase}
          className="mt-8 bg-green-500 text-white px-4 py-2 rounded"
        >
          End Current Phase
        </button>
      )}
    </div>
  );
}