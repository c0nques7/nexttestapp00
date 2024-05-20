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
  const [showChart, setShowChart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        // Fetch tickers from the database
        const tickersResponse = await fetch(`/api/tickers`);
        if (!tickersResponse.ok) {
          throw new Error('Failed to fetch tickers');
        }
        const { tickers } = await tickersResponse.json();

        // Update State (just the tickers, not stockData)
        setTickers(tickers); // Assuming you're using 'tickers' state to store ticker symbols
      } catch (error) {
        console.error('Error fetching tickers:', error);
        // Handle errors (e.g., set an error state)
      }
    };

    fetchTickers();
  }, []); 

  const fetchStockData = async () => {
    // Input Validation
    if (!symbol.trim()) { // Check if symbol is empty or contains only whitespace
      setError("Please enter a stock symbol.");
      return; // Don't proceed if the symbol is invalid
    }

    setIsLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const response = await fetch(`/api/fetchchart?symbol=${symbol}`);
      
      // Handle HTTP errors (4xx, 5xx)
      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch stock data");
        } catch (jsonError) {
          setError(`Failed to fetch stock data (${response.status})`);
        }
        return; 
      }

      const data = await response.json();

      // Handle potential API changes or unexpected data format
      if (!data || !Array.isArray(data)) {
        setError("Invalid stock data format");
        return;
      }

      setStockData(data);
      
      

    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("An error occurred while fetching stock data");
    } finally {
      setIsLoading(false);
      setShowChart(true); // Show the chart even if there's an error
    }
  };
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null); // Clear any previous errors
    await fetchStockData();
    setIsLoading(false);
    setShowChart(true);
  };

  const handleAddTicker = async (newTickerSymbol: string): Promise<void> => {
    return new Promise<void>(async (resolve, reject) => { // Wrap the async logic in a promise
      try {
        // 1. Fetch existing tickers (now using the userId from the cookie)
        const response = await fetch(`/api/tickers`); 

        if (!response.ok) throw new Error("Failed to fetch tickers");
        const { tickers: existingTickers } = await response.json();

        // 2. Check if the ticker already exists
        if (existingTickers && existingTickers.includes(newTickerSymbol)) {
          throw new Error("Ticker already in the list");
        }

        // 3. Fetch stock data for the new symbol
        const stockResponse = await fetch(
          `/api/fetchstockdata?symbol=${newTickerSymbol}`
        );
        if (!stockResponse.ok) throw new Error("Failed to fetch stock data");
        const newStockData = await stockResponse.json();

        // 4. Update the list of tickers
        const updatedTickers = existingTickers 
        ? [...existingTickers, newTickerSymbol]  // Use existingTickers if it's an array
        : [newTickerSymbol]; // Otherwise, create a new array with the new ticker


        // 5. Send a POST request to update the user's tickers in the database
        const updateResponse = await fetch(`/api/tickers?symbol=${newTickerSymbol}`, { 
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Add this header
          },
          body: JSON.stringify({ symbol: newTickerSymbol }), // Include the symbol in the request body as JSON
        });

        if (!updateResponse.ok) {
          throw new Error("Failed to update tickers in the database");
        }


        if (!updateResponse.ok)
          throw new Error("Failed to update tickers in the database");

        // 6. Update the local state
        setTickers([
          ...tickers,
          { data: newStockData.data, symbol: newTickerSymbol },
        ]);

        resolve(); // Resolve the promise
      } catch (error) {
        console.error("Error adding ticker:", error);
        reject(error); // Reject the promise on error
      }
    });
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
      <div className="myhome-page flex flex-col"> {/* Removed inline style */}
        <div className="stocklookup w-full justify-center gap-4 mb-4">  {/* Added gap for spacing */}
            <h2 className="text-xl font-semibold mb-2">Stock Lookup</h2>
            <input 
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="neumorphic-input p-4 rounded-md mb-2"
            />
            <button
              onClick={fetchData}
              className="neumorphic-button"
              disabled={!symbol.trim()}
            >
              {isLoading ? 'Fetching...' : 'Fetch Data'}
            </button>
        </div>

        {/* Stock Chart Container */}
        <div className="flex-grow">
        <div className="stock-chart-container">
          {showChart && (
            <FinancialCard data={stockData} symbol={symbol} onAddTicker={handleAddTicker} />
          )}
        </div>
        </div>

        {/* Post Cards */}
          <div className="flex flex-col gap-4 mt-4"> {/* Added flex-col and margin */}
            {userPosts.map((userPost, index) => (
              <PostCard key={index} {...userPost} /> // Spread props for cleaner code
            ))}
          </div>
      </div>
    </UserProvider>
  );
}
