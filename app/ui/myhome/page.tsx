"use client";

import '@/app/ui/global.css'; 
import React, { Fragment, useEffect, useState } from 'react';
import RedditCard from '../home/page';
import Link from 'next/link';
import { RedditPostData, RedditApiResponse } from '../types';

export default function MyHomePage() {
  const [savedSubreddits, setSavedSubreddits] = useState<string[]>([]);
  const [fetchedPosts, setFetchedPosts] = useState<RedditPostData[]>([]);

  useEffect(() => {
    const storedSubreddits = localStorage.getItem("savedSubreddits");
    if (storedSubreddits) {
      setSavedSubreddits(JSON.parse(storedSubreddits));
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const allPosts: RedditPostData[] = [];
      for (const subreddit of savedSubreddits) {
        try {
          const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10`);
          const json: RedditApiResponse = await response.json();
          allPosts.push(...json.data.children.map(child => child.data));
        } catch (error) {
          console.error(error);
        }
      }
      setFetchedPosts(allPosts);
    };

    if (savedSubreddits.length > 0) {
      fetchPosts();
    }
  }, [savedSubreddits]); // Fetch posts when savedSubreddits changes

  return (
    <div className="myhome-page">
      {/* Logout Button */}
      <div className="fixed top-4 right-4 z-10">
        <Link href="/ui/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Logout
          </button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">My Home</h1>

      <div className="card-grid">
        {fetchedPosts.map((postData, index) => (
          <React.Fragment key={index}>
            <RedditCard postData={postData} isExpanded={false} onClick={() => {}} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}