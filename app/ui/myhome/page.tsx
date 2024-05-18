'use client';
// Import necessary modules and types
import { useEffect, useState, Fragment } from 'react';
// import { useRouter } from 'next/router'; // Removed
import Link from 'next/link';
import { parseCookies } from 'nookies'; // Ensure to install this package
import RedditCard from '../../components/RedditCard/redditcard';// Ensure this component exists
import { RedditPostData, SavedSubredditResponse, RedditApiResponse } from '../types';// Adjust path as necessary

 // Define the functional component
export default function MyHomePage() {
 // const router = useRouter(); // Removed

 // State management for the component
 const [savedSubreddits, setSavedSubreddits] = useState<string[]>([]);
 const [fetchedPosts, setFetchedPosts] = useState<RedditPostData[]>([]);
 const [isLoading, setIsLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);
 const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

 // Fetch saved subreddits on component mount
 useEffect(() => {
 const fetchSavedSubreddits = async () => {
 try {
 setIsLoading(true);
 const response = await fetch('/ui/api/fetchsavedsubreddits', { // Adjusted the API path
 method: 'GET', 
credentials: 'include',
 });

 if (response.ok){
 const data: SavedSubredditResponse = await response.json();
setSavedSubreddits(data.mySubs);
} else {
 const errorData = await response.json();
setError(errorData.error|| 'An error occurred');
 }
 } catch (err) {
 setError('An error occurred');
 } finally {
 setIsLoading(false);
 }
 };

 fetchSavedSubreddits();
 }, []);

 // Fetch posts based on saved subreddits
 useEffect(() => {
 const fetchPosts = async () => {
 if (Array.isArray(savedSubreddits)&& savedSubreddits.length> 0) {
 try {
 const allPosts = await Promise.all(
savedSubreddits.map(async(subreddit) => {
 const response = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10`);
const json: RedditApiResponse = await response.json();
if (json && json.data&& Array.isArray(json.data.children)){
 return json.data.children.map((child:{ data: RedditPostData }) => child.data);
} else {
 return [];
 }
 })
 );
 setFetchedPosts(allPosts.flat());
} catch (error) {
 console.error('Errorfetching posts:', error);
 }
 }
 };

 fetchPosts();
 }, [savedSubreddits]);

 const handleLogout = () => {
 localStorage.removeItem("jwtToken");
// router.push("/ui/login"); // Removed
 };

 const handleCardClick = (postId: string) => {
 setExpandedPostId(expandedPostId === postId ? null : postId);
 };

 const handleRemoveSubreddit = (subredditToRemove: string) => {
 const updatedSubreddits = savedSubreddits.filter(subreddit=> subreddit !== subredditToRemove);
 setSavedSubreddits(updatedSubreddits);
 localStorage.setItem('savedSubreddits',JSON.stringify(updatedSubreddits));
};

 return (
 <div className="myhome-page">
 {isLoading ? (
 <p>Loading...</p>
) : (
 <>
 <div className="fixed top-4 right-4 z-10">
 <Link
 href="/ui/login"
 onClick={handleLogout}
 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
 >
 Logout
 </Link>
 </div>

 <h1 className="text-3xl font-bold mb-4">My Home</h1>
 <div className ="saved-subreddits-container">
 <h2 className="text-xl font-semibold mb-2">Saved Subreddits</h2>
 <ul className="saved-subreddits-list">
 {Array.isArray(savedSubreddits)&& savedSubreddits.length> 0 ? (
 savedSubreddits.map((subreddit)=> (
 <li key={subreddit} className="subreddit-item">
 <span>{subreddit}</span>
 <button onClick={() => handleRemoveSubreddit(subreddit)}>Remove</button>
 </li>
 ))
 ) : (
 <p>No saved subreddits yet.</p>
)}
 </ul>
 </div>

 <div className="card-grid">
 {fetchedPosts.map((postData,index) => (
 <Fragment key={index}>
 <RedditCard
 postData={postData}
 isExpanded={expandedPostId === postData.id}
onClick={() => handleCardClick(postData.id)}
/>
 </Fragment>
 ))}
 </div>
 </>
 )}
 </div>
 );
};
