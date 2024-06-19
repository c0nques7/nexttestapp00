'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import PostCard from '@/app/components/PostCard/postcard';
import { Post } from '@/app/lib/types';
import { PostType, ContentProvider } from '@prisma/client';
import { CardPositionsProvider, useCardPositions } from '@/app/context/cardPositionsContext';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { Channel } from '@/app/lib/types';
import { useRouter } from 'next/navigation';

function ChannelPage() {
  const params = useParams();
  const channelName = params.channelName as string; // Get channelName from params
  const [channelPosts, setChannelPosts] = useState<Post[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const router = useRouter();
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchChannelPosts = async () => {
      try {
        const response = await fetch(`/api/channels/${channelName}/posts`);
        if (response.ok) {
          const data = await response.json();
          setChannelPosts(data);
        } else {
          console.error('Failed to fetch channel posts:', response.status);
        }
      } catch (error) {
        console.error('Error fetching channel posts:', error);
      }
    };

    if (channelName) { // Check if channelName is available
      fetchChannelPosts();
    }
  }, [channelName]); // Fetch posts whenever channelName changes

  const handleCardClick = (postType: PostType) => {
    if (postType === PostType.TEXT || postType === PostType.IMAGE || postType === PostType.VIDEO) {
      console.log("Post Type:", postType);
    } else {
      console.error("Invalid Post Type:", postType);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

  const handleOnSelect = (item: unknown) => {
    const channel = item as Channel
    handleNavigateToChannel(channel.name);
  };

  const handleNavigateToChannel = (channelName: string) => {
    router.push(`/channels/${channelName}`); // Navigate using router.push
  };
  return (
    <CardPositionsProvider>

      <div className={`neumorphic-sidebar ${isSidebarOpen ? 'expanded' : ''}`}>
          <button className="menu-button" onClick={toggleSidebar}>☰</button>
          <div className="sidebar-content">
            <a href="/myhome" className="sidebar-link">Home</a>
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
            placeholder="Enter channel name"
          />
        )}
        </div>
    <div>
      <h1>Channel: {channelName}</h1>
      <div className="posts-container">
        {channelPosts.map((post, index) => (
          <PostCard
          key={post.id}
          id={post.id.toString()}
          content={post.content || ''}
          userId={post.userId ?? 0}
          channel={post.channel ? post.channel.name : 'Unknown'}
          timestamp={post.timestamp}
          postType={post.postType || 'TEXT'}
          mediaUrl={post.mediaUrl}
          expanded={expandedPostId === post.id}
          onCardClick={handleCardClick} 
          index={index} 
          containerWidth={containerWidth}
          />
        ))}
      </div>
    </div>
    </CardPositionsProvider>
  );
}

export default ChannelPage;