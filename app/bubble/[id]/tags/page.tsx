"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface Tag {
  id: string;
  name: string;
}

interface BubbleData {
  id: string;
  team_name: string;
  description: string;
  is_started: boolean;
}

export default function BubbleTagsPage() {
  const params = useParams();
  const router = useRouter();
  const [bubble, setBubble] = useState<BubbleData | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
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
    if (data) setTags(data);
    else if (error) console.error('Error fetching tags:', error);
  };

  const checkIfCreator = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && bubble) {
      setIsCreator(user.id === bubble.created_by);
    }
  };

  const handleAddTag = async () => {
    if (newTag.trim() && tags.length < 10) {
      const { data, error } = await supabase
        .from('bubble_tags')
        .insert({ bubble_id: params.id, name: newTag.trim() })
        .select()
        .single();
      
      if (data) {
        setTags([...tags, data]);
        setNewTag('');
      } else if (error) {
        console.error('Error adding tag:', error);
      }
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const { error } = await supabase
      .from('bubble_tags')
      .delete()
      .eq('id', tagId);
    
    if (!error) {
      setTags(tags.filter(tag => tag.id !== tagId));
    } else {
      console.error('Error removing tag:', error);
    }
  };

  const handleStart = async () => {
    const { error } = await supabase
      .from('bubbles')
      .update({ is_started: true })
      .eq('id', params.id);
    
    if (!error) {
      setBubble({ ...bubble!, is_started: true });
    } else {
      console.error('Error starting bubble:', error);
    }
  };

  const handleProceedToInput = () => {
    router.push(`/bubble/${params.id}/voting`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{bubble?.team_name} - Tags</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Enter a new tag"
          className="border p-2 mr-2"
        />
        <button
          onClick={handleAddTag}
          disabled={tags.length >= 10}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Tag
        </button>
      </div>

      <ul className="list-disc pl-5 mb-4">
        {tags.map(tag => (
          <li key={tag.id} className="flex items-center justify-between mb-2">
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="text-red-500 ml-2"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {isCreator && !bubble?.is_started && (
        <button
          onClick={handleStart}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Start Bubble
        </button>
      )}

      {bubble?.is_started && (
        <button
          onClick={handleProceedToInput}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          NEXT
        </button>
      )}
    </div>
  );
}