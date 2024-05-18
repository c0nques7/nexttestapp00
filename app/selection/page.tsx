'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/button'; // Make sure you have this component
import { useRouter } from 'next/navigation';

export default function SubredditSelection() {
  const [showCustom, setShowCustom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const searchQueryRef = useRef(searchQuery); 
  const router = useRouter();

  useEffect(() => {
    const searchSubreddits = async () => {
      if (searchQueryRef.current.length >= 3) {
        try {
          const response = await fetch(
            `https://www.reddit.com/api/subreddit_autocomplete_v2.json?query=${searchQueryRef.current}&include_over_18=false&limit=5`
          );
          const data = await response.json();
          setSearchResults(data.data.children.map((child: any) => child.data.display_name));
        } catch (error) {
          console.error("Error searching subreddits:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimeout = setTimeout(() => {
      searchSubreddits();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleClick = () => setShowCustom(!showCustom);

  const handleDefaultClick = () => {
    router.push('/ui/home/');
  };
  
  const handleAddSubreddit = (subreddit: string) => {
    // Handle the addition of the custom subreddit here (e.g., navigate to it)
    // You'll likely want to use the router.push() method here as well
    router.push(`/ui/home/page?subreddit=${subreddit}`);
  };

  return (
    <div className="subreddit-selection p-4 mt-4">
      {/* Default Subreddits Button */}
      <Button onClick={handleDefaultClick}>Default Subreddits</Button>

      {/* Toggle Button */}
      <Button onClick={handleClick} className="mt-4">
        {showCustom ? "Hide Custom Search" : "Add Custom Subreddit"}
      </Button>

      {showCustom && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter a subreddit"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchQueryRef.current = e.target.value;
            }}
            className="border rounded p-2 w-full"
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <ul className="mt-2 list-disc list-inside">
              {searchResults.map((subreddit) => (
                <li
                  key={subreddit}
                  onClick={() => handleAddSubreddit(subreddit)}
                  className="cursor-pointer hover:underline"
                >
                  {subreddit}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
