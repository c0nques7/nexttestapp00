'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import PostCard from '@/app/components/PostCard/postcard';
import { Post } from '@/app/lib/types';
import { PostType, ContentProvider } from '@prisma/client';

function ChannelPage() {
  const { channelName } = useParams();
  const [channelPosts, setChannelPosts] = useState<Post[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  return (
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
  );
}

export default ChannelPage;