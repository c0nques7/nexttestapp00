"use client";
import '@/app/styles/global.css';
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Draggable from 'react-draggable';

const CardSkeleton = () => (
  <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
);

interface PostCardProps {
  id: number;
  content: string;
  userId: string;
  channel: string;
  timestamp: string;
}

const PostCard: React.FC<PostCardProps> = ({ id, content, userId, channel, timestamp }) => {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="neumorphic post-card">
        <h2>Post #{id}</h2>
        <p><strong>Content:</strong> {content}</p>
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Channel:</strong> {channel}</p>
        <p><strong>Timestamp:</strong> {timestamp}</p>
      </div>
      </Draggable>
  );
}

export default PostCard;