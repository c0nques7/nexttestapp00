"use client";
import '@/app/styles/global.css';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Draggable from 'react-draggable';
import moment from 'moment';
import parse from 'html-react-parser';


const CardSkeleton = () => (
  <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
);

interface PostCardProps {
  id: number;
  content: string;
  userId: number;
  channel: string;
  timestamp: string;
  postType: 'TEXT' | 'IMAGE' | 'VIDEO';  
  mediaUrl?: string; 
}

const PostCard = ({
  id, content, userId, channel, timestamp, postType, mediaUrl
}: PostCardProps) => {
  const nodeRef = useRef(null);
  const formattedTimestamp = moment(timestamp).fromNow();

  const renderPostContent = () => {
    switch (postType) {
      case 'TEXT':
        return <p>{parse(content)}</p>;
      case 'IMAGE':
        return mediaUrl ? (
          <Image
            src={mediaUrl}
            alt="Post Image"
            width={500}
            height={300}
          />
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
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="neumorphic post-card">
        <div>
          <p>
            <b>{userId}</b> @{channel} - {formattedTimestamp}
          </p>
        </div>
        
        {renderPostContent()}
      </div>
    </Draggable>
  );
};

export default PostCard;