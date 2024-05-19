'use client';
import '@/app/styles/global.css';
import { useEffect, useState, useRef } from 'react';
import PostCard from '../components/PostCard/postcard';
import FinancialCard from '../components/FinanceCard/financecard';
import { UserProvider, useUserContext } from '../context/userContext';
import { useRouter } from 'next/navigation';

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

interface Ticker {
  symbol: string;
  data: any; // Replace `any` with the actual type if known
}

export default function MyHomePage() {
  const router = useRouter(); 
  const [isTextPostFormOpen, setIsTextPostFormOpen] = useState(false);
  const [textPostContent, setTextPostContent] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<{ id: number; content: string; userId: number; channel: string; timestamp: string; }[]>([]);
  const [stockData, setStockData] = useState<any>(null);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tickers, setTickers] = useState<{ data: any; symbol: string }[]>([]);

  const { userId } = useUserContext();

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

  const handleAddTicker = async (newTickerSymbol: string) => {
    try {
      // 1. Fetch existing tickers (assuming they're returned in an array format)
      const response = await fetch(`/api/tickers`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch tickers");
      const { tickers: existingTickers } = await response.json();

      // 2. Check if the ticker already exists
      if (existingTickers && existingTickers.some((t: Ticker) => t.symbol === newTickerSymbol)) {
        throw new Error("Ticker already in the list");
      }

      // 3. Fetch stock data for the new symbol
      const stockResponse = await fetch(`/api/fetchstockdata?symbol=${newTickerSymbol}`);
      if (!stockResponse.ok) throw new Error("Failed to fetch stock data");
      const newStockData = await stockResponse.json();

      // 4. Update the list of tickers
      const updatedTickers = [...existingTickers, { symbol: newTickerSymbol, data: newStockData.data }];

      // 5. Send a POST request to update the user's tickers in the database
      const updateResponse = await fetch(`/api/tickers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: updatedTickers }),
      });

      if (!updateResponse.ok) throw new Error("Failed to update tickers in the database");

      // 6. Update the local state
      setTickers(updatedTickers);
    } catch (error) {
      console.error("Error adding ticker:", error);
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSubmitTextPost = async () => {
    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textPostContent,
          postType: "TEXT",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred while creating the post.");
      } else {
        setTextPostContent(""); // Clear the content
        setIsTextPostFormOpen(false); // Close the form
        setUserPosts([ data, ...userPosts]); // Add new post to state
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating post:", error);
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
        router.refresh();
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchUserPosts();
  }, []);

  return (
    <UserProvider>
      <div className="myhome-page" style={{ width: '100%' }}>
        {/* Post Dropdown Button & Text Post Form */}
        <div className="flex justify-center w-full">
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
                <p onClick={() => handleAddTicker('text post')}>Text Post</p>
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

        <div className="stock-chart-container">
          <FinancialCard data={stockData} symbol={symbol} onAddTicker={handleAddTicker} />
        </div>

        {/* Post Cards */}
        {userPosts && userPosts.length > 0 && userPosts.map((userPost, index) => (
          <PostCard
            key={index}
            id={userPost.id}
            content={userPost.content}
            userId={userPost.userId.toString()}
            channel={userPost.channel}
            timestamp={userPost.timestamp}
          />
        ))}
      </div>
    </UserProvider>
  );
}
