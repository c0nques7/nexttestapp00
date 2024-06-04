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
import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';
import { CardPositionsProvider, useCardPositions } from '@/app/context/cardPositionsContext';

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
  const [tickers, setTickers] = useState<Array<{symbol: string}>>([]);
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
  const [tickerSymbols, setTickerSymbols] = useState<string[]>([]); // Use string for ticker symbols
  const savedSubreddits = ["popular", "pics", "reactjs", "javascript", "programming"];
  const [newTicker, setNewTicker] = useState('');
  const [addTickerResponse, setAddTickerResponse] = useState<
  { message: string } | { error: string } | null
>(null);

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
        router.refresh();
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
        const response = await fetch('/api/tickers'); 
        if (response.ok) {
          const data = await response.json();

          // Split the symbols string into an array before setting the state
          if (typeof data.symbols === 'string') {  
            setTickerSymbols(data.symbols.split(',').map((symbol: string) => symbol.trim())); // Trim any extra spaces
          } else {
            console.error('Invalid data format for symbols:', data.symbols);
            // Handle the error appropriately (e.g., show a default message)
          }
        } else {
          console.error('Failed to fetch tickers');
        }
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

  const handleAddTicker = async () => {
    try {
      const response = await fetch(`/api/tickers?symbol=${encodeURIComponent(newTicker)}`, {
        method: 'POST',
      }); // Cookies will be automatically sent if present
  
      if (response.ok) {
        const data = await response.json();
        setAddTickerResponse(data);
        setNewTicker(''); 
      } else {
        const errorData = await response.json();
        setAddTickerResponse(errorData);
      }
    } catch (error) {
      console.error('Error adding ticker:', error);
      setAddTickerResponse({ error: 'Failed to add ticker' }); 
    }
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

  const handleCardClick = (postType: PostType) => {
    if (postType === PostType.TEXT || postType === PostType.IMAGE || postType === PostType.VIDEO) {
      console.log("Post Type:", postType);
    } else {
      console.error("Invalid Post Type:", postType);
    }
  };

  return (
    <CardPositionsProvider>
      <div className="myhome-page flex flex-col">
      {isLoading ? ( // Conditional rendering based on isLoading
          <p className="text-center text-lg">Loading...</p> // Display loading message
        ) : (
          <>
        <div className={`neumorphic-sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
          <button className="menu-button" onClick={toggleSidebar}>☰</button>
          <div className="sidebar-content">
            <a href="#" className="sidebar-link">Home</a>
            <a href="#" className="sidebar-link">Profile</a>
            <a href="/settings" className="sidebar-link">Settings</a>
          </div>
        </div>

        <button className="neumorphic-button" onClick={resetPositions}>Reset Card Positions</button>

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
            <div className="stock-search-bar-container neumorphic">
              <h2 className="text-xl font-semibold mb-4">Search for Stock Symbol</h2>
              <div className="stocksearch-header flex"> {/* Removed justify-center and items-center, since it's handled by the container */}
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="Enter stock symbol"
                  className="stock-search-bar-container" 
                />
                <button onClick={fetchStockData} className="neumorphic-button">
                  Search
                </button>
              </div>
            </div>
          )}
          

        <div className="posts-container w-full justify-center gap-4 mb-4">
          {userPosts.map((post) => (
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
          }
        </div>

        

        <div className="financial-cards-container w-full justify-center gap-4 mb-4">
            {isStockSearchEnabled && (<div>{tickerSymbols.map((symbol) => ( 
              <FinanceCard data={stockData} key={symbol} symbol={symbol} onAddTicker={handleAddTicker} /> 
              ))}
            </div>
            )}
            {showChart && stockData && (
              <FinanceCard symbol={symbol} data={stockData} onAddTicker={handleAddTicker} />
            )}
        </div>


        

        <Fab className="fab-bottom-right" onClick={handleOpenCreatePostModal}>
        <AddIcon />
        </Fab>        

        {showCreatePostModal && (
          <CreatePost onClose={handleCloseCreatePostModal} onPostCreated={handlePostCreated} />
        )}

        </>
        )}
      </div>
    </CardPositionsProvider>
  );
}
