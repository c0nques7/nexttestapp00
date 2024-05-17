"use client";
import '@/app/ui/global.css';
import React, { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import Link from 'next/link';
import { RedditPostData, RedditApiResponse } from '../types';
import RedditCard from '../../components/RedditCard/redditcard';
import { parseCookies } from 'nookies';

export default function MyHomePage() {
  const router = useRouter();
  const [savedSubreddits, setSavedSubreddits] = useState<string[]>([]);
  const [fetchedPosts, setFetchedPosts] = useState<RedditPostData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add isLoading state

  // Check JWT and Redirect if Not Authenticated
 useEffect(() => {
    const checkAuthentication = async () => {
      const cookies = parseCookies(); 
      const token = cookies.token; 

      if (!token) {
        router.push("/ui/login");
      }

      setIsLoading(false); // Set loading to false when authentication is done
    };

    checkAuthentication();
  }, [router]); 

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
          const response = await fetch(
            `https://www.reddit.com/r/${subreddit}/top.json?limit=10`
          );
          const json: RedditApiResponse = await response.json();
          allPosts.push(...json.data.children.map((child) => child.data));
        } catch (error) {
          console.error(error);
        }
      }
      setFetchedPosts(allPosts);
    };

    if (savedSubreddits.length > 0) {
      fetchPosts();
    }
  }, [savedSubreddits]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/ui/login");
  };

  return (
    <div className="myhome-page">
      {/* Show loading state */}
      {isLoading ? (
        <p>Loading...</p> 
      ) : (
        // Show content when not loading
        <>
          {/* Your logout button */}
          <div className="fixed top-4 right-4 z-10">
            {/* Logout Button */}
            <div className="fixed top-4 right-4 z-10">
              <Link
                href="/ui/login"
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </Link>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">My Home</h1>

          {/* Your RedditCard components */}
          <div className="card-grid">
            {fetchedPosts.map((postData, index) => (
              <Fragment key={index}>
                <RedditCard postData={postData} isExpanded={false} onClick={() => { /* ... */ }} />
              </Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}