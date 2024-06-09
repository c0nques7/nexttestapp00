"use client";
import '@/app/styles/global.css';
import { useState, useRef, useEffect, createRef, RefObject } from "react";
import Image from "next/image";
import moment from 'moment';
import parse from 'html-react-parser';
import { useCardPositions } from '@/app/context/cardPositionsContext';
import { PostType } from '@prisma/client';
import ReactPlayer from 'react-player/lazy';
import { MdOpenWith } from 'react-icons/md';
import { Rnd } from 'react-rnd';
import { useDrag, usePinch } from '@use-gesture/react';

const CardSkeleton = () => (
  <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
);

export interface CardPosition {
  x: number;
  y: number;

}

interface PostCardProps {
  id: string;
  content: string;
  userId: number;
  channel: string;
  timestamp: string;
  postType: PostType;
  mediaUrl?: string;
  onCardClick: (postType: PostType) => void;
  expanded: boolean;
  index: number; 
  containerWidth: number;
}

const PostCard = ({
  id, index, onCardClick, containerWidth, content, userId, channel, timestamp, postType, mediaUrl,
}: PostCardProps) => {
  const postCardRef = createRef<HTMLDivElement>();
  const nodeRef = useRef<Rnd>(null);
  const formattedTimestamp = moment(timestamp).fromNow();
  const { cardPositions, setCardPosition} = useCardPositions();
  const [cardSize, setCardSize] = useState({ width: 350, height: 350 }); // Initial size
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [zIndex, setZIndex] = useState(index + 1)
  const [position, setPosition] = useState(
    cardPositions[id.toString()] || { x: 0, y: 0 }
  );
  const [scale, setScale] = useState(1);
  
  const handleDragStop = (e: any, data: any) => {
    setCardPosition(String(id), { x: data.x, y: data.y }); // Update both x and y
  };
  const handleResizeStart = () => setIsResizing(true);
  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
        // Ensure the icon stays inside the card
        const newWidth = Math.max(ref.offsetWidth, 50); // Minimum card width (adjust as needed)
        const newHeight = Math.max(ref.offsetHeight, 50); // Minimum card height (adjust as needed)

        setCardSize({
            width: newWidth,
            height: newHeight,
        });
        setCardPosition(String(id), position); // Update position after resizing
        setIsResizing(false);
    }; 


  const renderPostContent = () => {
    switch (postType) {
      case 'TEXT':
        return <p>{parse(content)}</p>;
      case 'IMAGE':
        return mediaUrl ? (
          <div className="image-container"> 
          <Image
            src={mediaUrl}
            alt="Post Image"
            width={300}
            height={300}
            className="post-image" // Apply a class for styling
          />
        </div>
        ) : null;
        case 'VIDEO':
          if (!mediaUrl) {
            return <p>Missing video URL</p>; // Handle missing URLs
          }
        
          try {
            const url = new URL(mediaUrl);
            const videoId = url.searchParams.get('v');
        return videoId ? ( 
          <div className="video-container">
            <ReactPlayer 
              url={mediaUrl} 
              width="100%"
              height="315px" 
              controls={true}
              light={true}  
            />
          </div>
       ) : <p>Invalid YouTube video ID</p>; // Added for invalid videoID
      } catch (error) {
        console.error("Invalid video URL:", mediaUrl);
        return <p>Invalid video URL</p>;
      }

    default:
      return <p>Unsupported post type or missing media</p>;
  }
};

const originalSize = { width: 350, height: 350 };
// Calculate initial position inside the component
const initialPosition = cardPositions[id.toString()] || {
  x: (index * 370) % containerWidth, // Wrap horizontally 
  y: Math.floor(index * 370 / containerWidth) * 370, // Wrap vertically
};

useEffect(() => {
  if (!cardPositions[id.toString()]) {
    // If no position is stored, use the default
    setCardPosition(String(id), initialPosition);
  }
}, [id, initialPosition]);
const handleDoubleClick = () => {
  setCardSize(originalSize); // Reset to original size
};
const handleCardClick = () => {
  setIsSelected(!isSelected);
};

  // Drag gesture with @use-gesture/react
  const bind = useDrag(
    ({ down, movement: [x, y] }) => {
      if (!isResizing) {
        setPosition({ x: down ? x + initialPosition.x : position.x, y: down ? y + initialPosition.y : position.y });

        if (!down) {
          setCardPosition(String(id), position); // Update context after drag
        }
      }
    }
  );

  const bindPinch = usePinch(
    ({ first, movement: [d], offset: [s] }) => {
        if (first) setIsResizing(true);

        setScale(s); // Set the scale from the offset

        const newWidth = Math.max(cardSize.width + d, 50);
        const newHeight = Math.max(cardSize.height + d, 50);
        setCardSize({ width: newWidth, height: newHeight });

        if (!first) {
          setIsResizing(false);
          setCardPosition(String(id), position); // Update context after resize
        }
      }
  );

useEffect(() => {
  if (isSelected) {
    setZIndex(1000); // Bring the selected card to the front
  } else {
    setZIndex(index + 1); // Reset to the original zIndex when not selected
  }
}, [isSelected, index]); // Dependency array includes isSelected and index

return (
  <div className={`post-item ${isSelected ? "selected" : ""}`} {...bind} {...bindPinch}>
    <Rnd
      ref={nodeRef}
      size={cardSize}
      position={initialPosition}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      enableResizing={{ bottomRight: true }}
      onDoubleClick={handleDoubleClick}
      style={{ zIndex }}
    >
      <div 
        className="neumorphic post-card" 
        style={{
          // Apply drag and pinch transforms
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          width: cardSize.width,
          height: cardSize.height,
        }}
        {...bind()}
        onClick={(e) => {
          const target = e.target as Element; // Type assertion to Element
      
          if (!target.closest('.resize-handle') && !isResizing) {
              onCardClick(postType);
          }
      }}
      >
        {/* Card Content */}
        <div>
          <p>
            <b>{userId}</b> @{channel} - {formattedTimestamp}
          </p>
        </div>
        {renderPostContent()}

        {/* Resize Handle (Combined with Icon) */}
        <div
          className="resize-handle"
          onMouseDown={(e) => {
            e.stopPropagation(); 
            setIsResizing(true);
          }}
        >
          <MdOpenWith size={30} />
        </div>
      </div>
    </Rnd>
  </div>
);
};

export default PostCard;