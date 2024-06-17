"use client";
import '@/app/styles/global.css';
import React, { Fragment, useEffect, useState } from 'react';
import { RedditPostData, RedditApiResponse } from '../lib/types';
import RedditCard from '../components/RedditCard/redditcard';
import Link from 'next/link';

export default function MyHomePage() {
  const [fetchedPosts, setFetchedPosts] = useState<RedditPostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  // Hardcoded list of subreddits
  const savedSubreddits = ["popular", "pics", "reactjs", "javascript", "programming"]; 

  useEffect(() => {
    fetchPosts(); 
  }, []); // Run this effect only once on component mount

  // Function to fetch posts from Reddit API
  const fetchPosts = async () => {
    setIsLoading(true);

    const postPromises = savedSubreddits.map(subreddit => 
      fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10`)
        .then(res => res.json() as Promise<RedditApiResponse>)
        .then(json => json.data.children.map(child => child.data))
    );

    try {
      const allPosts = await Promise.all(postPromises);
      const uniquePosts = allPosts.flat().filter((post, index, self) =>
        index === self.findIndex(p => p.id === post.id)
      );
      setFetchedPosts(uniquePosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }

    setIsLoading(false);
  };

  // Function to handle card click
  const handleCardClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="myhome-page">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-10">
        <Link href="/ui/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Logout 
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">Default Home</h1>

      {/* Loading State */}
      {isLoading && <p>Loading posts...</p>}

      {/* Post Display */}
      {!isLoading && (
        <div className="card-grid">
          {fetchedPosts.map(post => (
            <RedditCard 
              key={post.id}
              postData={post} 
              isExpanded={expandedPostId === post.id} 
              onClick={() => handleCardClick(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}