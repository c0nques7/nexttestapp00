"use client";
import { useState, useEffect, useRef } from "react";
import PostCard from '@/app/components/PostCard/postcard'; 
import { PostType, ContentProvider } from '@prisma/client';
// ... other imports

interface FetchPostsResponse {
    posts: any;
    userPosts: Post[];
  }
  
  interface Post {
    userId?: number;
    channel?: string;
    contentProvider: ContentProvider;
    id: string;
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

  const ProfilePage = () => {
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profileUserId, setProfileUserId] = useState(1); 
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
    
  
    useEffect(() => {
      const fetchPublicPosts = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/fetchposts');
  
          if (!response.ok) {
            throw new Error('Failed to fetch posts'); 
          }
  
          const data = await response.json(); // No need to specify interface here
          const posts = data.userPosts; // Access posts directly from the 'userPosts' property
  
          setUserPosts(posts.map((post: any) => ({
            ...post,
            contentProvider: ContentProvider.PEAKEFEED, 
          })));
        } catch (error) {
          console.error("Error fetching posts:", error);
          // Handle error state here 
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchPublicPosts();
    }, []);
    
    const handleCardClick = (postType: PostType) => {
        if (postType === PostType.TEXT || postType === PostType.IMAGE || postType === PostType.VIDEO) {
          console.log("Post Type:", postType);
        } else {
          console.error("Invalid Post Type:", postType);
        }
      };
      
    return (
      <div ref={containerRef}> 
        <h1>User Profile</h1>
  
        {isLoading ? (
          <p>Loading posts...</p>
        ) : (
          <div className="posts-container">
            {userPosts.map((post, index) => (
              <PostCard 
              key={post.id}
              id={post.id.toString()}
              content={post.content || ''}
              userId={post.userId ?? 0}
              channel={post.channel || 'Unknown'}
              timestamp={post.timestamp}
              postType={post.postType || 'TEXT'}
              mediaUrl={post.mediaUrl}
              expanded={expandedPostId === parseInt(post.id, 10)}
              onCardClick={handleCardClick} 
              index={index} 
              containerWidth={containerWidth}
              />
            ))}
          </div>
        )}
      </div>
    );
  };
  
  export default ProfilePage;
