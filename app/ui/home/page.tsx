"use client";
import '@/app/ui/global.css';

import React, { useState, useEffect, Suspense} from 'react';
import { CardSkeleton } from '../skeletons';
import Link from 'next/link';



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
        <Suspense key={index} fallback={<CardSkeleton />}>
          <FlipCard />
        </Suspense>
      ));
  
    return (
      <div className="card-grid">
        {cards}
      </div>
    );
  }

function FlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Suspense fallback={<CardSkeleton />}>
      <div
        className={`card ${isFlipped ? 'flipped' : ''}`}
        onClick={handleClick}
      >
        {isLoading ? (
          <CardSkeleton /> 
        ) : (
          <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
            <div className="front">
              {/* Front content of the card */}
              <img 
                src="https://via.placeholder.com/70" // Placeholder image URL (70x70)
                alt="Profile Pic"
                className="rounded-full absolute top-2 left-2" // Style as circle
              />
            </div>
            <div className="back">
              {/* Back content of the card */}
              <img 
                src="https://via.placeholder.com/70" // Placeholder image URL (70x70)
                alt="Profile Pic"
                className="rounded-full absolute top-2 left-2" // Style as circle
              />
            </div>
          </div>
        )}
      </div>
    </Suspense>
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
