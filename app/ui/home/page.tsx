"use client";
import '@/app/ui/global.css';
import React, { useState, useEffect, Suspense } from 'react';
import { CardSkeleton } from '../skeletons';
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

function RedditFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [postData, setPostData] = useState<RedditPostData | null>(null);

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

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  if (!postData) {
    return <CardSkeleton />;
  }

  return (
    <Suspense fallback={<CardSkeleton />}>
      <div className={`card ${isFlipped ? 'flipped' : ''}`} onClick={handleClick}>
        <div className="rounded-xl bg-gray-50 shadow-sm overflow-hidden">
          {/* (Front and back content of the card remain the same as in the previous example) */}
        </div>
      </div>
    </Suspense>
  );
}



function FlipCardGrid() {
  const [cardCount, setCardCount] = useState(0);

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
