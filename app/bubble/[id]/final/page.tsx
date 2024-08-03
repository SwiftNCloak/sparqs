"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface BubbleData {
  id: string;
  team_name: string;
  winning_tag: string | null;
  created_by: string;
}

interface TitleData {
  id: string;
  title: string;
  is_approved: boolean;
}

export default function BubbleTitlePage() {
  const params = useParams();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [allTitles, setAllTitles] = useState<TitleData[]>([]);
  const [displayedTitles, setDisplayedTitles] = useState<TitleData[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [approvedTitle, setApprovedTitle] = useState<TitleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Add this line
  const supabase = createClient();

  useEffect(() => {
    document.title = 'Choose your Title | Sparqs';
    fetchBubbleData();
    fetchUserId();
  }, []);

  useEffect(() => {
    if (bubble && userId) {
      setIsCreator(bubble.created_by === userId);
      if (bubble.winning_tag) {
        fetchTitles();
      }
    }
  }, [bubble, userId]);

  const fetchUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else if (error) {
      console.error('Error fetching user:', error);
      setError('Error fetching user information. Please try refreshing the page.');
    }
  };

  const fetchBubbleData = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('id, team_name, winning_tag, created_by')
      .eq('id', params.id)
      .single();

    if (data) {
      setBubble(data);
    } else if (error) {
      console.error('Error fetching bubble:', error);
      setError('Error fetching bubble information. Please try refreshing the page.');
    }
  };

  const fetchTitles = async () => {
    const { data, error } = await supabase
      .from('title_list')
      .select('id, title, is_approved')
      .eq('bubble_id', params.id)
      .order('id', { ascending: true });

    if (data) {
      console.log('Fetched titles:', data);
      const approved = data.find(title => title.is_approved);
      if (approved) {
        setApprovedTitle(approved);
      } else {
        setDisplayedTitles(data.slice(0, 5));
        setAllTitles(data);
      }
    } else if (error) {
      console.error('Error fetching titles:', error);
      setError('Error fetching titles. Please try refreshing the page.');
    }
  };

  const generateTitles = async () => {
    if (!bubble?.winning_tag || approvedTitle) return;
  
    try {
      setMessage('Generating titles...');
      const response = await fetch(`http://localhost:8000/chat?final_idea=${encodeURIComponent(bubble.winning_tag)}`);
      const data = await response.json();
      console.log('Generated titles:', data.titles);
  
      if (!Array.isArray(data.titles) || data.titles.length === 0) {
        throw new Error('No titles returned from the API');
      }
  
      // Insert new titles into the database
      const { data: insertedData, error } = await supabase
        .from('title_list')
        .insert(data.titles.map((title: string) => ({
          id: uuidv4(),  // Generate a new UUID for each title
          bubble_id: bubble.id,
          title: title,
        })))
        .select();
  
      if (error) {
        console.error('Error inserting titles:', error);
        setError('Error saving generated titles. Please try again.');
      } else if (insertedData) {
        console.log('Inserted titles:', insertedData);
        setAllTitles(insertedData);
        setDisplayedTitles(insertedData.slice(0, 5));
        setCurrentIndex(5); 
        setMessage('Titles generated successfully!');
      }
    } catch (error) {
      console.error('Error generating titles:', error);
      setError('Error generating titles. Please try again.');
    }
  };
  

  const handleRegenerate = () => {
    const newTitles = allTitles.slice(currentIndex, currentIndex + 5);
    if (newTitles.length > 0) {
      setDisplayedTitles(newTitles);
      setCurrentIndex(prevIndex => prevIndex + 5);
    }
  };  

  const handleApproveTitle = async (titleId: string, titleText: string) => {
    setMessage(`Are you sure you want to approve the title "${titleText}"? This action cannot be undone.`);
    setApprovedTitle({ id: titleId, title: titleText, is_approved: false });
  };

  const confirmApproval = async () => {
    if (!approvedTitle) return;

    const { error: updateTitleError } = await supabase
      .from('title_list')
      .update({ is_approved: true })
      .eq('id', approvedTitle.id);

    if (updateTitleError) {
      console.error('Error approving title:', updateTitleError);
      setError('An error occurred while approving the title. Please try again.');
      return;
    }

    const { error: updateBubbleError } = await supabase
      .from('bubbles')
      .update({ final_title: approvedTitle.title })
      .eq('id', bubble?.id);

    if (updateBubbleError) {
      console.error('Error updating bubble with final title:', updateBubbleError);
      setError('An error occurred while updating the bubble. Please try again.');
      return;
    }

    setMessage(`Title "${approvedTitle.title}" has been approved. All other titles for this bubble will be deleted.`);

    // Delete all other titles for this bubble
    const { error: deleteError } = await supabase
      .from('title_list')
      .delete()
      .eq('bubble_id', bubble?.id)
      .neq('id', approvedTitle.id);

    if (deleteError) {
      console.error('Error deleting other titles:', deleteError);
    }

    setAllTitles([]);
    setDisplayedTitles([]);
    setApprovedTitle((prev) => ({ ...prev, is_approved: true }));
  };

  const cancelApproval = () => {
    setApprovedTitle(null);
    setMessage(null);
  };

  if (!bubble) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble.team_name} - Final Idea</h1>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>{message}</p>
          {approvedTitle && !approvedTitle.is_approved && (
            <div className="mt-2">
              <button onClick={confirmApproval} className="mr-2 px-4 py-2 bg-green-500 text-white rounded">Confirm</button>
              <button onClick={cancelApproval} className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
            </div>
          )}
        </div>
      )}
      {bubble.winning_tag ? (
        <div>
          <p className="mb-4">Winning Tag: {bubble.winning_tag}</p>
          {isCreator ? (
            approvedTitle?.is_approved ? (
              <div>
                <h2 className="text-xl font-semibold mb-2">Approved Title:</h2>
                <p className="text-lg">{approvedTitle.title}</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-2">Title Suggestions:</h2>
                {displayedTitles.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {displayedTitles.map((title) => (
                      <li key={title.id} className="mb-2">
                        {title.title}
                        <button
                          onClick={() => handleApproveTitle(title.id, title.title)}
                          className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                        >
                          Approve
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No titles generated yet. Click the button below to generate titles.</p>
                )}
                {displayedTitles.length === 0 && (
                  <button
                    onClick={generateTitles}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Generate Titles
                  </button>
                )}
                {displayedTitles.length > 0 && (
                  <button
                    onClick={handleRegenerate}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Regenerate
                  </button>
                )}
              </div>
            )
          ) : (
            <p>Only the creator of this bubble can generate and approve titles.</p>
          )}
        </div>
      ) : (
        <p>No winning tag found. Please complete the voting process.</p>
      )}
    </div>
  );
}