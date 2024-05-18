"use client";
import '@/app/styles/global.css';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import TextCard from '../components/TextCard/textcard';
import PostCard from '../components/PostCard/postcard';
import FinancialCard from '../components/FinanceCard/financecard';
import {LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';
interface FetchPostsResponse {
  userPosts: {
    id: number;
    content: string;
    userId: number;
    channel: string;
    timestamp: string;
  }[];
  // Add more properties if needed
}

export default function MyHomePage() {
  const [isTextPostFormOpen, setIsTextPostFormOpen] = useState(false);
  const [textPostContent, setTextPostContent] = useState('');
  const [isTextCardVisible, setIsTextCardVisible] = useState(false);
  const textPostFormRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: textPostContent,
    postType: "TEXT", // Assuming "TEXT" is a valid PostType enum value
  });
  const [postError, setPostError] = useState(null);
  const [userPosts, setUserPosts] = useState<{ id: number; content: string; userId: number; channel: string; timestamp: string; }[]>([]); // Initialize userPosts as an empty array
  const [stockData, setStockData] = useState<any>(null);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fetchStockData = async () => {
    try {
      const response = await fetch(`/api/fetchchart?symbol=${symbol}`);
      const data = await response.json();
      if (response.ok) {
        setStockData(data);
      } else {
        setError(data.error || 'Failed to fetch stock data');
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError('An error occurred while fetching stock data');
    }
  };

  const handleDropdownToggle = () => {
    setIsTextPostFormOpen(!isTextPostFormOpen);
  };

  const handleSubmitTextPost = async () => {
    try {
      setNewPost({
        content: textPostContent,
        postType: "TEXT", // Assuming "TEXT" is a valid PostType enum value
      });

      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setPostError(data.error || "An error occurred while creating the post.");
      } else {
        setTextPostContent(""); // Clear text post content
        setIsTextPostFormOpen(false); // Close the form
        setIsTextCardVisible(true); // Show the TextCard
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleOptionClick = (option: string) => {
    console.log(`Selected option: ${option}`);
    if (option === 'text post') {
      setIsTextPostFormOpen(true);
    }
  };

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await fetch('/api/fetchposts');
        if (!response.ok) {
          throw new Error('Failed to fetch user posts');
        }
        const responseData: FetchPostsResponse = await response.json();
        setUserPosts(responseData.userPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserPosts();
  }, []);

  return (
    <div className="myhome-page" style={{ width: '100%' }}>
      {/* Post Dropdown Button & Text Post Form */}
      <div className="flex justify-center w-full"> {/* Add flex container for centering */}
      <h2 className="text-xl font-semibold mb-2">Stock Lookup</h2>
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="neumorphic-input w-full p-4 rounded-md mb-2"
        />
        <button onClick={fetchStockData} className="neumorphic-button">
          Fetch Data
        </button>
        <div className="post-dropdown relative">
          <button onClick={handleDropdownToggle} className="neumorphic-button py-2 px-4 rounded">
            Post+
          </button>

          {/* Conditionally render the dropdown content */}
          {isDropdownOpen && (
            <div className="dropdown-content absolute mt-2 w-full neumorphic p-4 rounded-lg shadow-md">
              <p onClick={() => handleOptionClick('text post')}>Text Post</p>
              {/* ... other post types ... */}
            </div>
          )}

          {/* Text Post Form (conditionally rendered) */}
          {isTextPostFormOpen && (
            <div className="neumorphic-container p-4 rounded-lg mt-4 transition-all duration-300 ease-in-out overflow-hidden max-h-96">
              <textarea
                value={textPostContent}
                onChange={(e) => setTextPostContent(e.target.value)}
                placeholder="Enter your text post content..."
                className="neumorphic-input w-full h-32 p-4 rounded-md mb-2"
              />
              <button onClick={handleSubmitTextPost} className="neumorphic-button">
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="stock-chart-container"> {/* Container for the stock chart */}
          {stockData && stockData.length > 0 && ( // Conditionally render the chart
            <FinancialCard data={stockData} symbol={symbol} />
          )}
        </div>

      {/* Post Cards */}
      {userPosts && userPosts.length > 0 && userPosts.map((userPost, index) => (
        <PostCard
          key={index}
          id={userPost.id}
          content={userPost.content}
          userId={userPost.userId.toString()} // Assuming `userId` is an integer in your database
          channel={userPost.channel}
          timestamp={userPost.timestamp}
        />
      ))}
    </div>
  );
}