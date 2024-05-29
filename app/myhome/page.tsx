'use client';
import '@/app/styles/global.css';
import { useEffect, useState, useRef } from 'react';
import PostCard from '../components/PostCard/postcard';
import FinancialCard from '../components/FinanceCard/financecard';
import { UserProvider, useUserContext } from '../context/userContext';
import { useRouter } from 'next/navigation';
import CreatePost from '../components/CreatePost/createpost';
import { PostType, ContentProvider } from '@prisma/client';
import { RedditPostData, RedditApiResponse} from '../lib/types';
import RedditCard from '../components/RedditCard/redditcard';



interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  permalink: string;
  url_overridden_by_dest: string;
  thumbnail: string;
  post_hint?: string;
  score: number;
  num_comments: number;
  author: string;
  created_utc: number;
  contentProvider: "REDDIT"; 
}

interface PeakeFeedPost {
  contentProvider: "PEAKEFEED"; // This explicitly sets the content provider
  id: string; // or number if your IDs are numbers
  content: string; // Assuming you have a 'content' property
  userId: number;
  channel: string;
  timestamp: string; 
  mediaUrl?: string; // Optional for media attachments
  postType: 'TEXT' | 'IMAGE' | 'VIDEO';
  // Add any other properties specific to PeakeFeed posts here
}

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
  // Add more properties if needed
}

interface Post {
  contentProvider: ContentProvider;
  id: string;
  title: string;
  content?: string;
  subreddit?: string;
  author?: string;
  timestamp: Date;
  mediaUrl?: string;
}

export default function MyHomePage() {
  const router = useRouter(); 
  const [isTextPostFormOpen, setIsTextPostFormOpen] = useState(false);
  const [textPostContent, setTextPostContent] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userPosts, setUserPosts] = useState<{ id: number; content: string; userId: number; channel: string; timestamp: string; postType: PostType; mediaUrl: string | null; }[]>([]);
  const [stockData, setStockData] = useState<any>(null);
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tickers, setTickers] = useState<{ data: any; symbol: string }[]>([]);
  const [showChart, setShowChart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStockSearchEnabled, setIsStockSearchEnabled] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [subreddit, setSubreddit] = useState('');
  const [redditSearchResults, setRedditSearchResults] = useState<any[]>([]);
  const [isRedditSearchEnabled, setIsRedditSearchEnabled] = useState(false);
  const [fetchedPosts, setFetchedPosts] = useState<RedditPostData[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [combinedPosts, setCombinedPosts] = useState<
    (PeakeFeedPost | RedditPostData)[]
  >([]);
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

  const handleOpenCreatePostModal = () => {
    setShowCreatePostModal(true);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  const handlePostCreated = () => {
    router.push('/myhome'); // Navigate to home page directly
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings'); // Fetch settings data (including isStockSearchEnabled)
        if (response.ok) {
          const data = await response.json();
          setIsStockSearchEnabled(data.settings.isStockSearchEnabled);
          setIsRedditSearchEnabled(data.settings.isRedditSearchEnabled);
        } else {
          // Handle error if settings are not fetched
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


  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
  
      try {
        const [userPostsResponse, ...redditResponses] = await Promise.all([
          fetch('/api/fetchposts'),
          ...savedSubreddits.map(subreddit => fetch(`https://www.reddit.com/r/${subreddit}/top.json?limit=10`)),
        ]);
  
        const userData: FetchPostsResponse = await userPostsResponse.json();
        const redditData = await Promise.all(redditResponses.map(res => res.json()));
  
        const allPosts: Post[] = [
          ...userData.userPosts.map((post) => ({ 
            contentProvider: ContentProvider.PEAKEFEED, 
            id: post.id.toString(),
            timestamp: new Date(post.timestamp),
            title: post.content.substring(0, 100),
          })),
          ...redditData.flatMap((data) =>
            data.data.children.map((child: {data: RedditPost}) => ({
              contentProvider: ContentProvider.REDDIT, // Explicitly setting contentProvider for Reddit posts
              id: child.data.id,
              title: child.data.title,
              subreddit: child.data.subreddit,
              author: child.data.author,
              timestamp: new Date(child.data.created_utc * 1000),
              mediaUrl: child.data.url_overridden_by_dest,
            }))
          ),
        ] as Post[];

        // Filter unique posts (same as before)
        const uniquePosts = allPosts.filter((post, index, self) => index === self.findIndex(p => p.id === post.id));
  
        // Sort by timestamp (same as before)
        uniquePosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
  
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPosts();
  }, [isRedditSearchEnabled]); 
  
  

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
        setRedditSearchResults([]); // Clear results on error
      }
    } catch (error) {
      console.error('Error fetching subreddit data:', error);
    }
  };

  const handleCardClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // Filter and map PeakeFeed posts
  combinedPosts.map((post) => {
    // Use the 'contentProvider' property to distinguish post types
    if (post.contentProvider === ContentProvider.PEAKEFEED) {
      return (
        <PostCard
        key={post.id} 
        id={post.id} // Pass the id
        postType={post.postType} 
        content={post.content}
        mediaUrl={post.postType !== 'TEXT' ? post.mediaUrl : undefined}
        timestamp={post.timestamp}  // Pass the timestamp (now a string)
        userId={post.userId}
        channel={post.channel} 
        />
      );
    } else {
      // Now it's safe to assume it's a Reddit post, but refine the type for is_video
      const redditPost = post as RedditPostData;
      return (
        <RedditCard
          key={post.id}
          postData={post} // Pass the post data as before
          isExpanded={expandedPostId === post.id}
          onClick={() => handleCardClick(post.id)}
          mediaUrl={redditPost.is_video ? redditPost.url : undefined} // Conditionally pass mediaUrl
          postUrl={redditPost.url} // Include the direct URL to the Reddit post
        />
      );
    }
  });


  return (
    <UserProvider>
      <div className="myhome-page flex flex-col"> {/* Removed inline style */}
      <div className={`neumorphic-sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
        <button className="menu-button" onClick={toggleSidebar}>☰</button>
        <div className="sidebar-content">
          {/* Your sidebar links/content here */}
          <a href="#" className="sidebar-link">Home</a>
          <a href="#" className="sidebar-link">Profile</a>
          <a href="/settings" className="sidebar-link">Settings</a>
        </div>
        </div>

  {/* Reddit Search Section (Conditional) */}
  {isRedditSearchEnabled && (
    <div className="redditsearch w-full justify-center gap-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Reddit Subreddit Search</h2>
      <input
        type="text"
        placeholder="Enter subreddit name (e.g., reactjs)"
        value={subreddit}
        onChange={(e) => setSubreddit(e.target.value)}
        className="neumorphic-input p-4 rounded-md mb-2"
      />
      <button onClick={handleRedditSearch} className="neumorphic-button">
        Search Subreddit
      </button>

      {/* Display Reddit Search Results */}
      {redditSearchResults.length > 0 && (
        <div>
          {redditSearchResults.map((post) => (
            <div key={post.id}>
              <a
                href={`https://www.reddit.com${post.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <h3>{post.title}</h3>
                <p>Subreddit: r/{post.subreddit}</p>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

{isStockSearchEnabled && (
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
        </div>)}

        {/* Stock Chart Container */}
        <div className="flex-grow">
        <div className="stock-chart-container">
          {showChart && (
            <FinancialCard data={stockData} symbol={symbol} onAddTicker={handleAddTicker} />
          )}
        </div>

  {/* Combined Post Cards */}
  <div className="flex flex-col gap-4 mt-4">
  {isLoading ? (
    <p>Loading posts...</p>
  ) : (
    combinedPosts.map((post) => {
      if (post.contentProvider === ContentProvider.PEAKEFEED) {
        const peakeFeedPost = post as PeakeFeedPost;
        return (
          <PostCard 
            key={peakeFeedPost.id.toString()} 
            id={peakeFeedPost.id.toString()} // Ensure id is a string
            postType={peakeFeedPost.postType}
            content={peakeFeedPost.content}
            timestamp={peakeFeedPost.timestamp}
            mediaUrl={peakeFeedPost.postType !== 'TEXT' ? peakeFeedPost.mediaUrl : undefined}
            userId={peakeFeedPost.userId}
            channel={peakeFeedPost.channel} 
          />
        );
      } else {
        const redditPost = post as RedditPostData;
        return (
          <RedditCard 
            key={redditPost.id} 
            postData={redditPost} 
            isExpanded={expandedPostId === redditPost.id} 
            onClick={() => handleCardClick(redditPost.id)} 
          />
        );
      }
    })
  )}
</div>

  {/* Stock Chart Container */}
  <div className="flex-grow">
    <div className="stock-chart-container">
      {showChart && (
        <FinancialCard
          data={stockData}
          symbol={symbol}
          onAddTicker={handleAddTicker}
        />
      )}
    </div>
  </div>

  {/* Create Post Button */}
  <button
    className="neumorphic-button add-post-button"
    onClick={handleOpenCreatePostModal}
  >
    Add Post
  </button>

  {/* Create Post Modal (Conditional) */}
  {showCreatePostModal && (
    <CreatePost
      onClose={handleCloseCreatePostModal}
      onPostCreated={handlePostCreated}
    />
  )}
  </div>
</div>
    </UserProvider>
  );
}
