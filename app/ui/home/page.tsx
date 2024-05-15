"use client";

import '@/app/ui/global.css';
import { useState, useEffect, Fragment } from 'react';
import { RedditPostData, RedditApiResponse } from '../types';
import RedditCard from '../../components/RedditCard/redditcard';

// Define the default subreddits
const defaultSubreddits = ['popular', 'all' , 'javascript', 'webdev', 'programming', 'technology'];

export default function HomePage() {
  const [cardData, setCardData] = useState<RedditPostData[]>([]);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRedditPosts = async () => {
      setIsLoading(true);
      const uniquePosts: RedditPostData[] = [];
      const seenPostIds = new Set<string>();

      for (const subreddit of defaultSubreddits) {
        try {
          const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=20`);
          if (!response.ok) {
            throw new Error(`Failed to fetch from r/${subreddit}: ${response.status} ${response.statusText}`);
          }

          const json: RedditApiResponse = await response.json();
          if (!json || !json.data || !json.data.children) {
            throw new Error(`Unexpected data format from r/${subreddit}`);
          }

          const subredditPosts = json.data.children.map(child => child.data);
          const newUniquePosts = subredditPosts.filter(post => {
            if (!seenPostIds.has(post.permalink)) {
              seenPostIds.add(post.permalink);
              return true;
            }
            return false;
          });

          uniquePosts.push(...newUniquePosts);
        } catch (error) {
          console.error(`Error fetching from r/${subreddit}:`, error);
          // Consider showing an error message to the user
        }
      }

      setCardData(uniquePosts);
      setIsLoading(false);
    };

    fetchRedditPosts(); // Fetch posts on component mount
  }, []);

  const handleCardClick = (index: number) => {
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  return (
    <div className="card-grid">
      {isLoading && (
        <div className="loading-state">
          {/* Loading indicator (e.g., spinner, text) */}
          Loading...
        </div>
      )}

      {!isLoading && cardData.map((postData, index) => (
        <Fragment key={index}>
          <RedditCard
            postData={postData}
            isExpanded={expandedCardIndex === index}
            onClick={() => handleCardClick(index)}
          />
        </Fragment>
      ))}
    </div>
  );
}
