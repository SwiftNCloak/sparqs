"use client"

import React, { useEffect, useState } from 'react';
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
  const [initialTagCount, setInitialTagCount] = useState(0);
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
    if (bubble) {
      fetchTags();
    }
  }, [bubble, currentPhase]);

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

    setInitialTagCount(count || 0);
  };

  const getTargetTagCount = (currentCount: number): number => {
    if (currentCount <= 3) return 1;
    if (currentCount <= 5) return 3;
    if (currentCount <= 10) return 5;
    return Math.ceil(currentCount / 2);
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

    const sortedTags = tags.filter(tag => tag.votes > 0).sort((a, b) => b.votes - a.votes);
    
    if (sortedTags.length <= 1) {
      await handleFinalPhase();
      return;
    }

    const targetTagCount = getTargetTagCount(sortedTags.length);
    
    // Special case for the final 3 tags
    if (sortedTags.length === 3 && targetTagCount === 1) {
      const [firstPlace, secondPlace] = sortedTags;
      
      if (firstPlace.votes === secondPlace.votes) {
        // There's a tie, so we'll restart the voting for these 3 tags
        await restartVotingForTags(sortedTags);
        return;
      }
    }

    let topTags = sortedTags.slice(0, targetTagCount);
    
    // Check for ties at the cutoff point
    if (topTags.length > 0) {
      const lastIncludedVoteCount = topTags[topTags.length - 1].votes;
      const tiedTags = sortedTags.filter(tag => tag.votes === lastIncludedVoteCount);
      topTags = sortedTags.filter(tag => tag.votes > lastIncludedVoteCount).concat(tiedTags);
    }

    const nextPhase = currentPhase + 1;

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

  const restartVotingForTags = async (tagsToKeep: Tag[]) => {
    // Delete all votes for the current phase
    const { error: deleteVotesError } = await supabase
      .from('tag_votes')
      .delete()
      .eq('bubble_id', params.id)
      .eq('phase', currentPhase);

    if (deleteVotesError) {
      console.error('Error deleting votes for current phase:', deleteVotesError);
      return;
    }

    // Update the phase for the tags we're keeping
    for (const tag of tagsToKeep) {
      const { error: updateTagError } = await supabase
        .from('bubble_tags')
        .update({ phase: currentPhase })
        .eq('id', tag.id);
    
      if (updateTagError) {
        console.error('Error updating tag phase:', updateTagError);
        return;
      }
    }
    
    // Delete any other tags that might be in this phase
    const { error: deleteTagsError } = await supabase
      .from('bubble_tags')
      .delete()
      .eq('bubble_id', params.id)
      .eq('phase', currentPhase)
      .not('id', 'in', `(${tagsToKeep.map(tag => tag.id).join(',')})`);
    
    if (deleteTagsError) {
      console.error('Error deleting other tags:', deleteTagsError);
      return;
    }
    

    await fetchTags();
    setUserVotes([]);  // Clear the current votes
  };

  const handleFinalPhase = async () => {
    const winningTag = tags[0];
    
    const { error: deleteVotesError } = await supabase
      .from('tag_votes')
      .delete()
      .eq('bubble_id', params.id)
      .eq('phase', currentPhase);

    if (deleteVotesError) {
      console.error('Error deleting votes for current phase:', deleteVotesError);
      return;
    }
    
    // 1. Delete other tags
    const { error: deleteTagsError } = await supabase
      .from('bubble_tags')
      .delete()
      .eq('bubble_id', params.id)
      .neq('id', winningTag.id);

    if (deleteTagsError) {
      console.error('Error deleting other tags:', deleteTagsError);
      return;
    }

    // 2. Update winning tag in bubbles table
    const { error: updateBubbleError } = await supabase
      .from('bubbles')
      .update({ winning_tag: winningTag.name })
      .eq('id', params.id);

    if (updateBubbleError) {
      console.error('Error updating winning tag:', updateBubbleError);
      return;
    }

    console.log('Bubble has ended. Winning tag:', winningTag.name);

    // Refresh bubble data
    await fetchBubbleData();
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

  const handleProceedToNextStage = () => {
    router.push(`/bubble/${params.id}/final`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble?.team_name} - Tag Voting</h1>
      <p className="mb-4">Current Phase: {currentPhase}</p>
      <p className="mb-4">Tags Remaining: {tags.length}</p>
      <p className="mb-4">Target Tag Count for Next Phase: {getTargetTagCount(tags.length)}</p>
        
      <div>
        {tags.length === 1 && bubble?.winning_tag ? (
          <div>
            <p className="mb-4">Winning Tag: {bubble.winning_tag}</p>
            <button
              onClick={handleProceedToNextStage}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Proceed to Next Stage
            </button>
          </div>
        ) : tags.length === 0 ? (
          <p>No tags available for voting in this phase.</p>
        ) : (
          <>
            <p className="mb-4">Vote for your favorite tags. You can vote for multiple tags, but only once per tag.</p>
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
                      >
                        {hasVoted ? 'Remove Vote' : 'Vote'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {isCreator && tags.length > 1 && (
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