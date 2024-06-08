"use client";
import '@/app/styles/global.css';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Draggable from 'react-draggable';
import moment from 'moment';
import parse from 'html-react-parser';
import { useCardPositions } from '@/app/context/cardPositionsContext';
import { PostType } from '@prisma/client';
import ReactPlayer from 'react-player/lazy';
import { MdOpenWith } from 'react-icons/md';
import { Rnd } from 'react-rnd';

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
}

const PostCard = ({
  id, onCardClick, content, userId, channel, timestamp, postType, mediaUrl
}: PostCardProps) => {
  const nodeRef = useRef<Rnd>(null);
  const formattedTimestamp = moment(timestamp).fromNow();
  const { cardPositions, setCardPosition } = useCardPositions();
  const [cardSize, setCardSize] = useState({ width: 350, height: 350 }); // Initial size
  const [isResizing, setIsResizing] = useState(false);
  
  const handleDragStop = (e: any, data: any) => {
    setCardPosition(String(id), { x: data.x, y: data.y });
  };

  const handleResize = (e: any, direction: any, ref: any, delta: any, position: any) => {
    // Ensure the icon stays inside the card
    const newWidth = Math.max(ref.offsetWidth, 50); // Minimum card width (adjust as needed)
    const newHeight = Math.max(ref.offsetHeight, 50); // Minimum card height (adjust as needed)

    setCardSize({
        width: newWidth,
        height: newHeight,
    });
    setCardPosition(String(id), position); // Update position after resizing
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

const handleResizeStart = () => {
  setIsResizing(true);
};

const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
  setCardSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
  });
  setCardPosition(String(id), position); // Update position after resizing
  setIsResizing(false);
};


return (
  <div onClick={() => onCardClick(postType)} className="post-item">
      <Rnd
          ref={nodeRef}
          size={cardSize}
          position={cardPositions[id.toString()] || { x: 0, y: 0 }}
          onDragStop={(e, d) => handleDragStop(e, d)}
          onResizeStop={handleResize}
          enableResizing={{ 
              top: false,
              right: false,
              bottom: false,
              left: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: true,
              topLeft: false 
          }}
      >
          <div className="neumorphic post-card" style={{ width: cardSize.width, height: cardSize.height }}>
              <div>
                  <p>
                      <b>{userId}</b> @{channel} - {formattedTimestamp}
                  </p>
              </div>
              {renderPostContent()}
              <div className="resize-handle">
                  <MdOpenWith size={30} />
              </div>
          </div>
      </Rnd>
  </div>
);
};

export default PostCard;