'use client';
import '@/app/styles/global.css';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard/postcard';
import FinanceCard from '../components/FinanceCard/financecard';
import { useRouter } from 'next/navigation';
import CreatePost from '../components/CreatePost/createpost';
import { PostType, ContentProvider } from '@prisma/client';
import { RedditPostData, RedditApiResponse } from '../lib/types';
import RedditCard from '../components/RedditCard/redditcard';
import { CardPositionsProvider, useCardPositions } from '/root/newapp00/nexttestapp00/app/context/cardPositionsContext.tsx';

interface FetchPostsResponse {
  userPosts: {
    id: number;
    content: string;
    userId: number;
    channel: string;
    timestamp: string;
    postType: PostType;
    mediaUrl: string;
  }[];
}

interface Post {
  userId?: number;
  channel?: string;
  contentProvider: ContentProvider;
  id: number;
  title?: string;
  content?: string;
  subreddit?: string;
  author?: string;
  timestamp: string;
  mediaUrl?: string;
  postType?: 'TEXT' | 'IMAGE' | 'VIDEO';
  permalink?: string;
  thumbnail?: string | null;
  url?: string;
  score?: number;
  num_comments?: number;
  is_video?: boolean;
  created_utc?: number;
}

export default function MyHomePage() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [stockData, setStockData] = useState<any>(null);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tickers, setTickers] = useState<{ symbol: string; data: any }[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStockSearchEnabled, setIsStockSearchEnabled] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [subreddit, setSubreddit] = useState('');
  const [redditSearchResults, setRedditSearchResults] = useState<any[]>([]);
  const [isRedditSearchEnabled, setIsRedditSearchEnabled] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [expandedPostIdString, setExpandedPostIdString] = useState<string | null>(null);
  const { resetPositions } = useCardPositions();
  const savedSubreddits = ["popular", "pics", "reactjs", "javascript", "programming"];

  useEffect(() => {
    const fetchUserPosts = async () => { 
      setIsLoading(true);

      try {
        const response = await fetch('/api/fetchposts'); // Fetch only user posts
        if (!response.ok) {
          throw new Error('Failed to fetch user posts');
        }

        const userData: FetchPostsResponse = await response.json();
        setUserPosts(
          userData.userPosts.map((post) => ({
            ...post,
            contentProvider: ContentProvider.PEAKEFEED, 
          }))
        );
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts(); // Call the function to fetch only user posts
  }, []);

  const handleOpenCreatePostModal = () => {
    setShowCreatePostModal(true);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  const handlePostCreated = () => {
    router.push('/myhome');
    window.location.reload();
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setIsStockSearchEnabled(data.settings.isStockSearchEnabled);
          setIsRedditSearchEnabled(data.settings.isRedditSearchEnabled);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const tickersResponse = await fetch(`/api/tickers`);
        if (!tickersResponse.ok) {
          throw new Error('Failed to fetch tickers');
        }
        const { tickers } = await tickersResponse.json();
        setTickers(tickers ?? []);;
      } catch (error) {
        console.error('Error fetching tickers:', error);
      }
    };

    fetchTickers();
  }, []);

  const fetchStockData = async () => {
    if (!symbol.trim()) {
      setError("Please enter a stock symbol.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fetchchart?symbol=${symbol}`);
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch stock data");
        return;
      }

      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("An error occurred while fetching stock data");
    } finally {
      setIsLoading(false);
      setShowChart(true);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    await fetchStockData();
    setIsLoading(false);
    setShowChart(true);
  };

  const handleAddTicker = async (newTickerSymbol: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/tickers`);
        if (!response.ok) throw new Error("Failed to fetch tickers");
        const { tickers: existingTickers } = await response.json();

        if (existingTickers && existingTickers.includes(newTickerSymbol)) {
          throw new Error("Ticker already in the list");
        }

        const stockResponse = await fetch(`/api/fetchstockdata?symbol=${newTickerSymbol}`);
        if (!stockResponse.ok) throw new Error("Failed to fetch stock data");
        const newStockData = await stockResponse.json();

        const updatedTickers = existingTickers ? [...existingTickers, newTickerSymbol] : [newTickerSymbol];

        const updateResponse = await fetch(`/api/tickers?symbol=${newTickerSymbol}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol: newTickerSymbol }),
        });

        if (!updateResponse.ok) throw new Error("Failed to update tickers in the database");

        setTickers([...tickers, { data: newStockData.data, symbol: newTickerSymbol }]);

        resolve();
      } catch (error) {
        console.error("Error adding ticker:", error);
        reject(error);
      }
    });
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRedditSearch = async () => {
    if (!subreddit.trim()) {
      setRedditSearchResults([]);
      console.error('Please enter a subreddit name');
      return;
    }

    try {
      const response = await fetch(`/api/redditsearch?subreddit=${subreddit}`);
      if (response.ok) {
        const data: RedditApiResponse = await response.json();
        setRedditSearchResults(data.data.children.map(child => child.data));
      } else {
        console.error('Error fetching subreddit data:', response.status);
        setRedditSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching subreddit data:', error);
    }
  };

  const handleCardClick = () => {
  };

  return (
    <CardPositionsProvider>
      <div className="myhome-page flex flex-col">
        <div className={`neumorphic-sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
          <button className="menu-button" onClick={toggleSidebar}>☰</button>
          <div className="sidebar-content">
            <a href="#" className="sidebar-link">Home</a>
            <a href="#" className="sidebar-link">Profile</a>
            <a href="/settings" className="sidebar-link">Settings</a>
          </div>
        </div>

        {isRedditSearchEnabled && (
          <div className="redditsearch w-full justify-center gap-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Search for Subreddit</h2>
            <div className="redditsearch-header flex justify-center items-center">
              <input
                type="text"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                placeholder="Enter subreddit name"
                className="subreddit-input"
              />
              <button onClick={handleRedditSearch} className="search-button">Search</button>
            </div>
          </div>
        )}

        {isStockSearchEnabled && (
          <div className="stocksearch w-full justify-center gap-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Search for Stock Ticker</h2>
            <div className="stocksearch-header flex justify-center items-center">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol"
                className="stock-input"
              />
              <button onClick={fetchStockData} className="nuemorphic-button">Search</button>
            </div>
          </div>
        )}

        <div className="posts-container w-full justify-center gap-4 mb-4">
          {isLoading ? (
            <p>Loading posts...</p>
          ) : (
            userPosts.map((post) => (
              <PostCard
              key={post.id}
              id={post.id.toString()}
              content={post.content || ''}
              userId={post.userId ?? 0}
              channel={post.channel || 'Unknown'}
              timestamp={post.timestamp}
              postType={post.postType || 'TEXT'}
              mediaUrl={post.mediaUrl}
              expanded={expandedPostId === post.id}
              onCardClick={handleCardClick}
              
              />
            ))
          )}
        </div>

        <div className="financial-cards-container w-full justify-center gap-4 mb-4">
        {tickers.length > 0 && tickers.map((ticker) => (
                    <FinanceCard
                      key={ticker.symbol}
                      symbol={ticker.symbol}
                      data={ticker.data}
                      onAddTicker={handleAddTicker}
                    />
                  ))}
        </div>

        <button className="neumorphic-button" onClick={handleOpenCreatePostModal}>
          Create Post
        </button>
        <button className="neumorphic-button" onClick={resetPositions}>Reset Card Positions</button>

        {showCreatePostModal && (
          <CreatePost onClose={handleCloseCreatePostModal} onPostCreated={handlePostCreated} />
        )}
      </div>
    </CardPositionsProvider>
  );
}
