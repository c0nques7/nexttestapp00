'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import PostCard from '@/app/components/PostCard/postcard';
import { Post } from '@/app/lib/types';
import { PostType, ContentProvider } from '@prisma/client';
import { Rnd } from 'react-rnd';
import { CardPositionsProvider, useCardPositions } from '@/app/context/cardPositionsContext';

function ChannelPage() {
  const { channelName } = useParams();
  const [channelPosts, setChannelPosts] = useState<Post[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { cardPositions, setCardPosition } = useCardPositions();

  const handleDragStop = (postId: string, { x, y }: { x: number; y: number }) => {
    setCardPosition(postId, { x, y });
  };

  const handleResizeStop = (postId: string, size: { width: number; height: number }, position: { x: number; y: number }) => {
    setCardPosition(postId, position);
  };

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
          <Rnd
            key={post.id}
            default={{
              x: cardPositions[post.id]?.x || 0,
              y: cardPositions[post.id]?.y || 0,
              width: 350, // Default width
              height: 350, // Default height
            }}
            onDragStop={(e, d) => handleDragStop(post.id.toString(), d)}
            onResizeStop={(e, dir, ref, delta, pos) => handleResizeStop(post.id.toString(), { width: ref.offsetWidth, height: ref.offsetHeight }, pos)}
            enableResizing={{ bottomRight: true }} // Enable resizing from the bottom right corner
          >
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
          </Rnd>
        ))}
      </div>
    </div>
  );
}

export default ChannelPage;