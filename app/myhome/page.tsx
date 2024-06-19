'use client';

import '@/app/styles/global.css';
import { ReactNode, useEffect, useState, useRef, ButtonHTMLAttributes } from 'react';
import { useRouter } from 'next/navigation';
import { PostType, ContentProvider } from '@prisma/client';
import { RedditApiResponse, Channel, Post } from '../lib/types';
import { CardPositionsProvider, useCardPositions } from '@/app/context/cardPositionsContext';
import dynamic from 'next/dynamic';
import { IoAddCircle, IoPencil } from "react-icons/io5";
import { BrowserRouter } from'react-router-dom';
const Fab: React.FC<ButtonHTMLAttributes<HTMLButtonElement> & { icon: ReactNode }> = ({ onClick, icon, ...props }) => (
  <button
      className="fab"
      onClick={onClick}
      {...props}
  >
      {icon} 
  </button>
);

const PostCard = dynamic(() => import('../components/PostCard/postcard'), { ssr: false });
const FinanceCard = dynamic(() => import('../components/FinanceCard/financecard'), { ssr: false });
const CreatePost = dynamic(() => import('../components/CreatePost/createpost'), { ssr: false });
const CreateChannel = dynamic(() => import('../components/CreateChannel/createchannel'), { ssr: false });
const ReactSearchAutocomplete = dynamic(
  () => import('react-search-autocomplete').then((mod) => mod.ReactSearchAutocomplete),
  { ssr: false } 
);
interface FetchPostsResponse {
  userPosts: {
    id: number;
    content: string;
    userId: number;
    channel: string;
    channelId: number;
    timestamp: string;
    postType: PostType;
    mediaUrl: string;
  }[];
}




export default function MyHomePage() {
  const router = useRouter();
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
  const [newTicker, setNewTicker] = useState('');
  const [addTickerResponse, setAddTickerResponse] = useState<
    { message: string } | { error: string } | null
    >(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [channels, setChannels] = useState<Channel[]>([]);  // Store channel names from API
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [channelSearchQuery, setChannelSearchQuery] = useState(''); // Separate state for channel search
  const [addChannelResponse, setAddChannelResponse] = useState<
    { message: string } | { error: string } | null
      >(null);
  const [newChannel, setNewChannel] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Make sure this is declared 
  const fabRef = useRef<any>(null);
  const open = Boolean(anchorEl);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [createChannelError, setCreateChannelError] = useState<string | null>(null);
  const createChannelModalRef = useRef<HTMLDivElement | null>(null);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  

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
            contentProvider: ContentProvider.PEAKEFEED, // Add the contentProvider
            channel: {
              id: post.channelId,       // You need the channelId in the API response
              name: post.channel,
              isCorpAccount: false,       // Use the channel string as the name
            },
          }))
        );
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setIsLoading(false);
        
      }
    };
  
  
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
  
    if (typeof window !== 'undefined') {
      fetchUserPosts();
      fetchTickers();
      fetchSettings();
    }
  }, []); 

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/channels');
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        } else {
          console.error('Failed to fetch channels:', response.status);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();
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

  const handleOpenCreatePostModal = () => {
    setShowCreatePostModal(true);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  const handlePostCreated = () => {
    setShowCreatePostModal(false);
  };

  const handleCloseCreateChannelModal = () => {
    setIsCreateChannelModalOpen(false);
    setNewChannelName('');
    setCreateChannelError(null);
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



  const handleOpenCreateChannelModal = () => {
    setIsCreateChannelModalOpen(true);
    console.log("Open Create Channel Modal"); // Placeholder
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


  


  

  const handleOnSelect = (item: unknown) => {
    const channel = item as Channel
    handleNavigateToChannel(channel.name);
  };

  const formatResult = (item: Channel) => {
    return (
      <>
        <span>{item.name}</span>
      </>
    );
  };

  const handleChannelSearch = async (query: string) => {
    setChannelSearchQuery(query);
    setShowAutocomplete(true); // Show autocomplete on typing

    try {
        const response = await fetch(`/api/channels?query=${encodeURIComponent(query)}`);
        if (response.ok) {
            const data = await response.json();
            setFilteredChannels(data);
        } else {
            console.error('Failed to search channels:', response.status);
            setError('Failed to search channels');
        }
    } catch (error) {
        console.error('Error searching channels:', error);
        setError('An error occurred while searching for channels');
    }
  };

  const handleNavigateToChannel = (channelName: string) => {
    router.push(`/channels/${channelName}`); // Navigate using router.push
  };


  

  return (
    <CardPositionsProvider>
      <div className="myhome-page">
      {isLoading ? ( 
          <p className="text-center text-lg">Loading...</p>
        ) : (
          <>
        <div className={`neumorphic-sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
          <button className="menu-button" onClick={toggleSidebar}>☰</button>
          <div className="sidebar-content">
          <button className="neumorphic-button" onClick={resetPositions}>Reset Card Positions</button>
            <a href="#" className="sidebar-link">Home</a>
            <a href="/profile" className="sidebar-link">Profile</a>
            <a href="/settings" className="sidebar-link">Settings</a>
          </div>
        </div>

        {/* Channel Search Bar */}
        <div className="channel-search-bar-container">
          <h2 className="text-xl font-semibold mb-4">Search for Channel</h2>
          {typeof window!== 'undefined' && (
          <ReactSearchAutocomplete
            items={channels}
            onSearch={handleChannelSearch} // Update your handleChannelSearch function
            onSelect={handleOnSelect}
            inputSearchString={channelSearchQuery} // Input search string
            autoFocus
            formatResult={formatResult} // Format how each item is displayed
            placeholder="Enter channel name"
          />
        )}
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
          

          <div className="posts-container">
          
          {userPosts.map((post, index) => (
              <PostCard
              key={post.id}
              id={post.id.toString()}
              content={post.content || ''}
              userId={post.userId ?? 0}
              channel={post.channelName || 'Unknown'}
              timestamp={post.timestamp}
              postType={post.postType || 'TEXT'}
              mediaUrl={post.mediaUrl}
              expanded={expandedPostId === post.id}
              onCardClick={handleCardClick} 
              index={index} 
              containerWidth={containerWidth}
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

          
            <div>
              {showCreatePostModal && (
                <CreatePost onClose={handleCloseCreatePostModal} onPostCreated={handlePostCreated} channels={channels}/>
              )}

              {isCreateChannelModalOpen && (
                <CreateChannel onClose={handleCloseCreateChannelModal} /> 
              )}
            </div>
            <div className='fab-container'>
            <Fab onClick={handleOpenCreatePostModal} icon={<IoPencil />} />
            <Fab onClick={handleOpenCreateChannelModal} icon={<IoAddCircle />} />
            </div> 
        </>
        )}
      </div>
    </CardPositionsProvider>
  );
}
