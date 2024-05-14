// app/page.tsx
"use client";
import '@/app/ui/global.css'; // Replace with actual path
import React, { useState, useEffect, Suspense, useRef } from 'react';
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
  const [postData, setPostData] = useState<RedditPostData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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
          thumbnail: randomPost.thumbnail !== 'self' ? randomPost.thumbnail : null,
          permalink: `https://www.reddit.com${randomPost.permalink}`,
          score: randomPost.score,
          num_comments: randomPost.num_comments,
        });
      } catch (error) {
        console.error("Error fetching Reddit post:", error);
        setPostData(null);
      }
    };

    fetchRedditPost();
  }, []);

  useEffect(() => {
    let startX = 0;
    let startTime = 0;

    const handleTouchStart = (event: TouchEvent) => {
      startX = event.touches[0].clientX;
      startTime = Date.now();
    };

    const handleTouchMove = (event: TouchEvent) => {
      // No need to handle touchmove for simple swipe detection
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const endX = event.changedTouches[0].clientX;
      const deltaTime = Date.now() - startTime;

      if (Math.abs(endX - startX) > 50 && deltaTime < 300) { // Swipe threshold
        setIsFlipped(endX < startX); // Flip if swipe is to the left
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      startX = event.clientX;
      startTime = Date.now();
    };

    const handleMouseMove = (event: MouseEvent) => {
      // No need to handle mousemove for simple swipe detection
    };

    const handleMouseUp = (event: MouseEvent) => {
      const endX = event.clientX;
      const deltaTime = Date.now() - startTime;

      if (Math.abs(endX - startX) > 50 && deltaTime < 300) { // Swipe threshold
        setIsFlipped(endX < startX); // Flip if swipe is to the left
      }
    };

    const cardElement = cardRef.current; 

    if (cardElement) {
      cardElement.addEventListener('touchstart', handleTouchStart);
      cardElement.addEventListener('touchmove', handleTouchMove);
      cardElement.addEventListener('touchend', handleTouchEnd);
      cardElement.addEventListener('mousedown', handleMouseDown);
      cardElement.addEventListener('mousemove', handleMouseMove);
      cardElement.addEventListener('mouseup', handleMouseUp);
    }

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
  }, [isFlipped]); // Include isFlipped in dependency array

  if (!postData) {
    return <CardSkeleton />;
  }

  return (
    <Suspense fallback={<CardSkeleton />}>
      <div ref={cardRef} className={`card ${isFlipped ? 'flipped' : ''}`} >
        <div className="rounded-xl bg-gray-50 shadow-sm overflow-hidden">
          {/* Front of the Card */}
          <div className="front relative h-64 overflow-hidden">
            {postData.thumbnail && (
              <img src={postData.thumbnail} alt={postData.title} className="w-full h-full object-cover rounded-t-xl" />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-xl">
              <h3 className="font-semibold text-lg line-clamp-2">{postData.title}</h3>
              <p className="text-sm">r/{postData.subreddit} by u/{postData.author}</p>
            </div>
          </div>

          {/* Back of the Card */}
          <div className="back p-4 rounded-xl">
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
        </div>
      </div>
    </Suspense>
  );
}

function FlipCardGrid() {
  const [cardCount, setCardCount] = useState(0);

  useEffect(() => {
    function calculateCardCount() {
      const cardWidth = 320; // Approximate width of each card including margins
      const screenWidth = window.innerWidth;
      const cardsPerRow = Math.floor(screenWidth / cardWidth);
      const totalCards = cardsPerRow * 3; // Adjust the number of rows as needed
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

export default function homePageWithLogin() {
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
