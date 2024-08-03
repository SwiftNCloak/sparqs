"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface BubbleData {
  id: string;
  team_name: string;
  winning_tag: string | null;
  final_title: string | null;
}

export default function BubbleTitlePage() {
  const params = useParams();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [allTitles, setAllTitles] = useState<string[]>([]);
  const [displayedTitles, setDisplayedTitles] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    document.title = 'Choose your Title | Sparqs';
    fetchBubbleData();
  }, []);

  useEffect(() => {
    if (bubble?.winning_tag && !bubble.final_title) {
      fetchTitleSuggestions(bubble.winning_tag);
    }
  }, [bubble]);

  useEffect(() => {
    updateDisplayedTitles();
  }, [allTitles, currentIndex]);

  const fetchBubbleData = async () => {
    const { data, error } = await supabase
      .from('bubbles')
      .select('id, team_name, winning_tag, final_title')
      .eq('id', params.id)
      .single();

    if (data) {
      setBubble(data);
    } else if (error) {
      console.error('Error fetching bubble:', error);
    }
  };

  const fetchTitleSuggestions = async (finalIdea: string) => {
    try {
      const response = await fetch(`http://localhost:8000/chat?final_idea=${encodeURIComponent(finalIdea)}`);
      const data = await response.json();
      setAllTitles(data.titles);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching title suggestions:', error);
    }
  };

  const updateDisplayedTitles = () => {
    setDisplayedTitles(allTitles.slice(currentIndex, currentIndex + 5));
  };

  const handleRegenerate = () => {
    const nextIndex = (currentIndex + 5) % allTitles.length;
    setCurrentIndex(nextIndex);
  };

  const handleApproveTitle = async (title: string) => {
    const { error } = await supabase
      .from('bubbles')
      .update({ final_title: title })
      .eq('id', bubble?.id);

    if (error) {
      console.error('Error updating final title:', error);
    } else {
      setBubble(prev => prev ? { ...prev, final_title: title } : null);
    }
  };

  if (!bubble) {
    return <div>Loading...</div>;
  }

  if (bubble.final_title) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{bubble.team_name} - Final Title</h1>
        <p className="text-xl">Approved Title: {bubble.final_title}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble.team_name} - Final Idea</h1>
      {bubble.winning_tag ? (
        <div>
          <p className="mb-4">Winning Tag: {bubble.winning_tag}</p>
          <h2 className="text-xl font-semibold mb-2">Title Suggestions:</h2>
          <ul className="list-disc pl-5">
            {displayedTitles.map((title, index) => (
              <li key={index} className="mb-2">
                {title}
                <button
                  onClick={() => handleApproveTitle(title)}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                >
                  Approve
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleRegenerate}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Regenerate
          </button>
        </div>
      ) : (
        <p>No winning tag found. Please complete the voting process.</p>
      )}
    </div>
  );
}