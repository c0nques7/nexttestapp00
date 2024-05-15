"use client";
import '@/app/ui/global.css'; // Replace with your global CSS file
import React, { useState, useEffect } from 'react';
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
  return (
    <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
  );
}

function RedditCard({ postData, isExpanded, onClick }: { postData: RedditPostData | null, isExpanded: boolean, onClick: () => void }) {
  return (
    <div 
      className={`card ${isExpanded ? 'expanded' : ''}`} 
      onClick={onClick}
    >
      <div className="card-inner">
        {postData ? (
          <>
            <div className="front w-full h-full">
              <img src={postData.thumbnail || "https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png"} alt={postData.title} className="w-full h-full object-cover rounded-t-xl" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-xl">
                <h3 className="font-semibold text-lg line-clamp-2">{postData.title}</h3>
                <p className="text-sm">r/{postData.subreddit} by u/{postData.author}</p>
              </div>
            </div>

            {isExpanded && (
              <div className="expanded-content absolute w-full h-full top-0 left-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-center z-10 rounded-xl">
                <div>
                  <p className="text-sm">Score: {postData.score} | Comments: {postData.num_comments}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(postData.permalink, '_blank'); }}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    View on Reddit
                  </button>
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

  useEffect(() => {
    const fetchRedditPosts = async () => {
      const subreddits = ['reactjs', 'javascript', 'webdev', 'programming', 'technology'];
      const posts: RedditPostData[] = [];

      for (const subreddit of subreddits) {
        try {
          const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10`);
          if (!response.ok) {
            continue;
          }
          const json: RedditApiResponse = await response.json();

          if (!json || !json.data || !json.data.children) {
            throw new Error('Unexpected data format from Reddit API');
          }

          const subredditPosts = json.data.children.map(child => child.data);
          posts.push(...subredditPosts);
        } catch (error) {
          console.error(`Error fetching from r/${subreddit}:`, error);
        }
      }
      setCardData(posts);
    };

    fetchRedditPosts();
  }, []);

  const handleCardClick = (index: number) => {
    // Toggle the expanded state of the clicked card
    if (expandedCardIndex === index) {
      setExpandedCardIndex(null); // Close if it was already open
    } else {
      setExpandedCardIndex(index); // Open
    }
  };

  return (
    <div className="card-grid">
      {cardData.map((postData, index) => (
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

export default function HomePageWithLogin() {
  return (
    <div>
      <div className="fixed top-4 right-4 z-10">
        <Link href="/ui/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        </Link>
      </div>
      <CardGrid />
    </div>
  );
}
