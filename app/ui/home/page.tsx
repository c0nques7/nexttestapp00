// app/page.tsx
"use client";
import '@/app/ui/global.css'; // Replace with your global CSS file path
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface RedditPostData {
  title: string;
  subreddit: string;
  author: string;
  thumbnail: string | null;
  permalink: string;
  score: number;
  num_comments: number;
}

// Placeholder Skeleton Component
function CardSkeleton() {
  return (
    <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div> 
  );
}

function RedditFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [postData, setPostData] = useState<RedditPostData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch Reddit Post Data
  useEffect(() => {
    const fetchRedditPost = async () => {
      try {
        const response = await fetch('https://www.reddit.com/r/popular.json');
        const json = await response.json();
        const randomPost = json.data.children[Math.floor(Math.random() * json.data.children.length)].data;

        setPostData({
          title: randomPost.title,
          subreddit: randomPost.subreddit_name_prefixed,
          author: randomPost.author,
          thumbnail: randomPost.thumbnail !== 'self' && randomPost.thumbnail !== 'default' ? randomPost.thumbnail : null,
          permalink: `https://www.reddit.com${randomPost.permalink}`,
          score: randomPost.score,
          num_comments: randomPost.num_comments,
        });
      } catch (error) {
        console.error("Error fetching Reddit post:", error);
        setPostData(null); // Handle error by setting postData to null
      }
    };

    fetchRedditPost();
  }, []); // Empty dependency array means this runs only once on mount

  // Event Listeners for Flip and Expand
  useEffect(() => {
    let initialX = 0;
    let initialY = 0;

    // Touch Event Handlers
    const handleTouchStart = (event: TouchEvent) => {
      initialX = event.touches[0].clientX;
      initialY = event.touches[0].clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault(); // Prevent scrolling
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const finalX = event.changedTouches[0].clientX;
      const finalY = event.changedTouches[0].clientY;
      handleFlipOrExpand(initialX, finalX);
    };

    // Mouse Event Handlers
    const handleMouseDown = (event: MouseEvent) => {
      initialX = event.clientX;
      initialY = event.clientY;
    };

    const handleMouseMove = (event: MouseEvent) => {
      event.preventDefault(); // Prevent text selection
    };

    const handleMouseUp = (event: MouseEvent) => {
      const finalX = event.clientX;
      handleFlipOrExpand(initialX, finalX);
    };

    // Combined Flip/Expand Logic
    const handleFlipOrExpand = (initialX: number, finalX: number) => {
      const deltaX = finalX - initialX;
      if (Math.abs(deltaX) > 50) {
        setIsFlipped(!isExpanded && deltaX < 0); // Flip only if not expanded
      } else {
        setIsExpanded(!isExpanded); // Expand/collapse
      }
    };

    // Event Listener Attachment
    const cardElement = cardRef.current;
    if (cardElement) {
      cardElement.addEventListener('touchstart', handleTouchStart);
      cardElement.addEventListener('touchmove', handleTouchMove);
      cardElement.addEventListener('touchend', handleTouchEnd);
      cardElement.addEventListener('mousedown', handleMouseDown);
      cardElement.addEventListener('mousemove', handleMouseMove);
      cardElement.addEventListener('mouseup', handleMouseUp);
    }

    // Event Listener Cleanup
    return () => {
      if (cardElement) {
        cardElement.removeEventListener('touchstart', handleTouchStart);
        cardElement.removeEventListener('touchmove', handleTouchMove);
        cardElement.removeEventListener('touchend', handleTouchEnd);
        cardElement.removeEventListener('mousedown', handleMouseDown);
        cardElement.removeEventListener('mousemove', handleMouseMove);
        cardElement.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isExpanded]); // Run effect when isExpanded changes

  // Function to Get Reddit Embed URL
  const getRedditEmbedUrl = (permalink: string) => {
    const postId = permalink.split('/').slice(-2, -1)[0];
    return `https://www.redditmedia.com/r/${postData?.subreddit.replace('/r/', '')}/comments/${postId}/.embed?ref_source=embed&amp;ref=share&amp;embed=true`;
  };

  return (
    <div ref={cardRef} className={`card relative ${isFlipped ? 'flipped' : ''} ${isExpanded ? 'expanded' : ''}`} onClick={handleCardClick}>
      <div className="card-inner">
        {postData ? (
          <>
            {/* Front of the Card */}
            <div className="front absolute w-full h-full">
              {postData.thumbnail && (
                <img src={postData.thumbnail} alt={postData.title} className="w-full h-full object-cover rounded-t-xl" />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-xl">
                <h3 className="font-semibold text-lg line-clamp-2">{postData.title}</h3>
                <p className="text-sm">r/{postData.subreddit} by u/{postData.author}</p>
              </div>
            </div>

            {/* Back of the Card */}
            <div className="back absolute w-full h-full p-4 rounded-xl z-10">
              <p className="text-sm mb-2">
                <span className="font-semibold">Score:</span> {postData.score} | 
                <span className="font-semibold">Comments:</span> {postData.num_comments}
              </p>
              <a
                href={postData.permalink}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                View on Reddit
              </a>
            </div>

            {/* Expanded View with iframe */}
            {isExpanded && (
              <div className="expanded-content absolute w-full h-full top-0 left-0 z-20">
                <iframe
                  src={getRedditEmbedUrl(postData.permalink)} 
                  title={postData.title}
                  className="w-full h-full"
                />
              </div>
            )}
          </>
        ) : (
          <CardSkeleton /> 
        )}
      </div>
    </div>
  );
}

function FlipCardGrid() {
  const [cardCount, setCardCount] = useState(3); 

  useEffect(() => {
    function calculateCardCount() {
      const cardWidth = 320; 
      const screenWidth = window.innerWidth;
      const cardsPerRow = Math.floor(screenWidth / cardWidth);
      const totalCards = cardsPerRow * 3; 
      setCardCount(totalCards);
    }

    calculateCardCount();
    window.addEventListener('resize', calculateCardCount);
    return () => window.removeEventListener('resize', calculateCardCount);
  }, []);

  const cards = Array.from({ length: cardCount }, (_, index) => (
    <RedditFlipCard key={index} />
  ));

  return (
    <div className="card-grid">
      {cards}
    </div>
  );
}

export default function HomePageWithLogin() {
  return (
    <div>
      <div className="fixed top-4 right-4 z-10">
        <Link href="/ui/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </button>
        </Link>
      </div>
      <FlipCardGrid />
    </div>
  );
}
