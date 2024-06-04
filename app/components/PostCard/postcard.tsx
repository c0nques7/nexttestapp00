"use client";
import '@/app/styles/global.css';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Draggable from 'react-draggable';
import moment from 'moment';
import parse from 'html-react-parser';
import { useCardPositions } from '@/app/context/cardPositionsContext';
import { PostType } from '@prisma/client';

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
  const nodeRef = useRef(null);
  const formattedTimestamp = moment(timestamp).fromNow();
  const { cardPositions, setCardPosition } = useCardPositions();

  const handleDragStop = (e: any, data: any) => {
    setCardPosition(String(id), { x: data.x, y: data.y });
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
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allowFullScreen
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

  return (
    <div onClick={() => onCardClick(postType)}>
        <Draggable
          nodeRef={nodeRef}
          onStop={handleDragStop}
          defaultPosition={cardPositions[id.toString()] || { x: 0, y: 0 }}
        >
          <div ref={nodeRef} className="neumorphic post-card">
            <div>
              <p>
                <b>{userId}</b> @{channel} - {formattedTimestamp}
              </p>
            </div>

            {renderPostContent()}
          </div>
        </Draggable>
      </div>
    );
  };

export default PostCard;