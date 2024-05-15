"use client";

import '@/app/ui/global.css'; // Replace with your global CSS file
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RedditPostData {
  title: string;
  subreddit: string;
  author: string;
  thumbnail: string | null;
  permalink: string;
  score: number;
  num_comments: number;
}

interface RedditApiResponse {
  data: {
    children: {
      data: RedditPostData;
    }[];
  };
}

// Placeholder Skeleton Component
function CardSkeleton() {
  return <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>;
}

function RedditCard({ postData, isExpanded, onClick }: { postData: RedditPostData | null, isExpanded: boolean, onClick: () => void }) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(postData?.thumbnail || undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (postData?.thumbnail) {
      const img = new Image();
      img.src = postData.thumbnail;
      img.onload = () => setIsLoading(false);
      img.onerror = () => setImageSrc(undefined); 
    } else {
      setImageSrc(undefined); 
      setIsLoading(false);
    }
  }, [postData?.thumbnail]); 

  return (
    <div className={`card ${isExpanded ? 'expanded' : ''}`} onClick={onClick}>
      <div className="card-inner">
        {postData ? ( 
          <>
            <div className="front w-full h-full">
              {isLoading ? (
                <CardSkeleton /> 
              ) : (
                <img src={imageSrc} alt={postData.title} className="w-full h-full object-cover rounded-t-xl" style={{ display: imageSrc ? "block" : "none" }} />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-xl">
                <h3 className="font-semibold text-lg line-clamp-2">{postData?.title ?? "No Title Available"}</h3>
                <p className="text-sm">r/{postData.subreddit} by u/{postData.author}</p>
              </div>
            </div>
            {isExpanded && (
              <div className="expanded-content absolute w-full h-full top-0 left-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-center z-10 rounded-xl">
                <div>
                  <p className="text-sm">Score: {postData.score} | Comments: {postData.num_comments}</p>
                  {(() => {
                    const handleViewOnRedditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      window.open(`https://www.reddit.com${postData.permalink}`, '_blank');
                    };

                    return (
                      <button
                        onClick={handleViewOnRedditClick}
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      >
                        View on Reddit
                      </button>
                    );
                  })()} 
                </div>
              </div>
            )}
          </>
        ) : (
          <CardSkeleton />
        )}
      </div>
    </div>
  );
}



function CardGrid() {
  const [cardData, setCardData] = useState<RedditPostData[]>([]);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subredditSelection, setSubredditSelection] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const defaultSubreddits = ['reactjs', 'javascript', 'webdev', 'programming', 'technology'];

  useEffect(() => {
    const fetchRedditPosts = async (subreddits: string[]) => {
      setIsLoading(true);
      const uniquePosts: RedditPostData[] = [];
      const seenPostIds = new Set<string>();

      for (const subreddit of subreddits) {
        try {
          const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=20`);
          if (!response.ok) {
            continue;
          }
          const json: RedditApiResponse = await response.json();

          if (!json || !json.data || !json.data.children) {
            throw new Error('Unexpected data format from Reddit API');
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
        }
      }
      setCardData(uniquePosts);
      setIsLoading(false);
    };

    if (shouldFetch) {
      if (subredditSelection === 'default') {
        fetchRedditPosts(defaultSubreddits);
      } else if (searchQuery) {
        fetchRedditPosts([searchQuery]);
      }
    }
  }, [subredditSelection, searchQuery, shouldFetch]);

  const handleCardClick = (index: number) => {
    setExpandedCardIndex(expandedCardIndex === index ? null : index);
  };

  const handleSubredditSelection = (selection: 'default' | 'custom') => {
    setSubredditSelection(selection);
    setShouldFetch(true);
  };

  return (
    <div className="card-grid">
      {/* Subreddit Selection */}
      {cardData.length === 0 && !isLoading && (
        <div className="subreddit-selection">
          <button onClick={() => handleSubredditSelection('default')}>Use Default Subreddits</button>
          <button onClick={() => handleSubredditSelection('custom')}>Select Subreddits</button>
        </div>
      )}

      {/* Search Bar (only when 'custom' is selected) */}
      {subredditSelection === 'custom' && (
        <input
          type="text"
          placeholder="Search subreddit"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          {/* Add your loading indicator here (e.g., spinner, text) */}
          Loading...
        </div>
      )}

      {/* Cards */}
      {!isLoading && cardData.map((postData, index) => (
        <RedditCard
          key={index}
          postData={postData}
          isExpanded={expandedCardIndex === index}
          onClick={() => handleCardClick(index)}
        />
      ))}
    </div>
  );
}

export default function HomePageWithStatus() {
  return (
    <div>
      <div className="fixed top-4 right-4 z-10">
        <Link href="/ui/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </Link>
      </div>
      <CardGrid />
    </div>
  );
}
