"use client";
import '@/app/styles/global.css';
import { useState, useRef, useEffect, createRef, RefObject, MouseEvent, TouchEvent, BaseSyntheticEvent } from "react";
import Image from "next/image";
import moment from 'moment';
import parse from 'html-react-parser';
import { useCardPositions } from '@/app/context/cardPositionsContext';
import { PostType, ContentProvider } from '@prisma/client';
import ReactPlayer from 'react-player/lazy';
import { MdOpenWith } from 'react-icons/md';
import { Rnd, RndResizeStartCallback } from 'react-rnd';
import { useDrag, usePinch} from '@use-gesture/react';
import { BiReset } from 'react-icons/bi';
import { Post } from '@/app/lib/types';

export interface CardPosition {
  x: number;
  y: number;

}

interface PostCardProps {
  id: string;
  content: string; // content is required string
  userId: number;
  channel: string;
  timestamp: string;
  postType: PostType;
  mediaUrl?: string | undefined;
  onCardClick: (postType: PostType) => void;
  expanded: boolean;
  index: number; 
  containerWidth: number;
  isNsfwFilterEnabled: boolean;
  post: Post; 
  channelId: string;
}

interface Position {
  x: number;
  y: number;
}

interface Delta {
  width: number;
  height: number;
}

interface ResizeCallbackData {
node: HTMLElement;
size: { width: number; height: number };
position: Position;
handle: Position;
delta: Delta;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  isNsfwFilterEnabled,
  index,
  onCardClick,
  containerWidth,
  post,
  channel,
  timestamp,
  postType,
  mediaUrl,
  expanded,
}) => {
  const postCardRef = createRef<HTMLDivElement>();
  const nodeRef = useRef<Rnd>(null);
  const formattedTimestamp = moment(timestamp).fromNow();
  const { cardPositions, setCardPosition} = useCardPositions();
  const [cardSize, setCardSize] = useState({ width: 350, height: 350 }); // Initial size
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [zIndex, setZIndex] = useState(index + 1)
  const [position, setPosition] = useState({x: 0, y: 0});
  const [scale, setScale] = useState(1);
  const [isReset, setIsReset] = useState(false); 
  const initialPosition = cardPositions[id.toString()] || {
    x: (index * (370)) % containerWidth, // Wrap horizontally 
    y: Math.floor(index * 370 / containerWidth) * 370, // Wrap vertically
  };
  const [isResettable, setIsResettable] = useState(false);
  const [previewSize, setPreviewSize] = useState(cardSize); // New state for preview size
  const [initialResize, setInitialResize] = useState({ x: 0, y: 0 });
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set<string>());

  useEffect(() => {
    if (!cardPositions[id.toString()]) {
      // If no position is stored, use the default
      setCardPosition(String(id), initialPosition);
    }
  }, [id, initialPosition]);

  const bindDrag = useDrag(({ down, movement: [x, y] }) => {
    if (!isResizing) { // Only drag if not resizing
        const newX = down ? x + initialPosition.x : position.x;
        const newY = down ? y + initialPosition.y : position.y;
        setPosition({ x: newX, y: newY });

        // Update position in the context after the drag ends
        if (!down) {
            setCardPosition(String(id), { x: newX, y: newY });
            setIsResettable(true); // Enable reset icon after dragging
        } else {
            setIsDragging(true); // Indicate dragging for zIndex adjustment
        }
    }
  });
  
  const handleTouchStart = (e: TouchEvent) => {
    setIsResizing(true);
    setStartX(e.touches[0].clientX); // Get initial touch coordinates
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isResizing) {
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;

      setCardSize((prevSize) => ({
        width: prevSize.width + deltaX,
        height: prevSize.height + deltaY,
      }));

      setStartX(e.touches[0].clientX); // Update startX and startY for next move
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsResizing(false);
    // ... update card position in the context
  };

  const handleResizeStart = (
    e: BaseSyntheticEvent,
    direction: any, // Or your defined type, or Rnd.ResizeCallbackData if you updated
    ref: HTMLElement
  ) => {
    setInitialResize(ref.getBoundingClientRect()); // Access the element directly
    setIsResizing(true);
  };


  const handleResize = (e: any, direction: any, ref: any, delta: any, position: any) => {
    setPreviewSize({
      width: ref.offsetWidth + (position.x - initialResize.x),
      height: ref.offsetHeight + (position.y - initialResize.y),
    });
  };


  
  const handleDragStop = (e: any, data: any) => {
        setPosition({ x: data.x, y: data.y });
        setCardPosition(id, { x: data.x, y: data.y });
        setIsResettable(true); // Enable reset icon after dragging
    };

    const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
      setCardSize({
        width: ref.offsetWidth,
        height: ref.offsetHeight,
      });
      setCardPosition(id, position);
      setIsResizing(false);
      setIsResettable(true);
      // Reset preview size after resize is finished
      setPreviewSize(cardSize);
      };

    // ... (other state variables and hooks)
    // You should add the isNsfwFilterEnabled state if it was not there before
  
    const renderPostContent = () => {
      if (post.postType === PostType.IMAGE && post.mediaUrl) {
        return (
          <Image
            src={post.mediaUrl}
            alt={post.content || "Post Image"}
            width={500}
            height={500}
            objectFit="cover"
          />
        );
      } else if (post.postType === PostType.VIDEO && post.mediaUrl) {
        // Assuming you have a video player component (e.g., react-player)
        const url = new URL(post.mediaUrl);
        const hostname = url.hostname;
  
        const isNsfwPlatform = (hostname: string) => {
          return hostname.includes("spankbang.com"); // Add more NSFW platforms as needed
        };
  
        const renderNsfwContent = () => (
          <div className="nsfw-content video-container blurred-thumbnail">
            <ReactPlayer
              src={post.mediaUrl}
              width="100%"
              height="315px"
              controls={true}
              light={true}
            />
            <p className="nsfw-warning">This video contains NSFW content.</p>
          </div>
        );
  
        const renderYoutubeVideo = (videoId: string) => (
          <div className="video-container">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${videoId}`}
              width="100%"
              height="315px"
              controls={true}
            />
          </div>
        );
  
        const renderVimeoVideo = (videoId: string) => (
          <div className="video-container">
            <ReactPlayer url={`https://vimeo.com/${videoId}`} width="100%" height="100%" controls />
          </div>
        );
  
        if (isNsfwFilterEnabled && isNsfwPlatform(hostname)) {
          return <p>This video is not available due to your NSFW filter settings.</p>;
        } else if (!isNsfwFilterEnabled && isNsfwPlatform(hostname)) {
          return renderNsfwContent();
        } else if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
          const videoId = url.searchParams.get("v");
          return videoId ? renderYoutubeVideo(videoId) : <p>Invalid YouTube video ID</p>;
        } else if (hostname.includes("vimeo.com")) {
          const videoIdMatch = post.mediaUrl.match(/\/(\d+)/);
          const videoId = videoIdMatch ? videoIdMatch[1] : null;
          return videoId ? renderVimeoVideo(videoId) : <p>Invalid Vimeo video URL</p>;
        } else {
          return <p>Unsupported video platform</p>;
        }
      } else if (post.content) {
        return (
          <p className="post-content">
            {expanded ? post.content : post.content.slice(0, 200) + (post.content.length > 200 ? "..." : "")}
          </p>
        );
      } else {
        return <p className="post-content">No content available for this post.</p>;
      }
    };
  

const resetPositionAndSize = () => {
  // Reset to the initial size and position
  setCardSize({ width: 350, height: 350 });
  setPosition({ x: 0, y: 0 });             // Reset to origin (0, 0)
    setCardPosition(id, { x: 0, y: 0 });
  setIsResettable(false); // Disable reset icon
};

useEffect(() => {
  if (!cardPositions[id.toString()]) {
    // If no position is stored, use the default
    setCardPosition(String(id), initialPosition);
  }
}, [id, initialPosition]);
const handleDoubleClick = () => {
  setCardSize({ width: 350, height: 350 }); // Reset to original size
};

const handleCardClick = () => {
  setIsSelected(!isSelected);
};

  // Drag gesture with @use-gesture/react


usePinch(
  ({ first, event, movement: [ms], offset: [s], origin: [ox, oy], memo = cardSize }) => {
    if (first) {
      // Prevent default browser behavior for a smoother experience
      event.preventDefault();
      setIsResizing(true);
      memo = cardSize; // Start with the current size as the memo
    }

    const newWidth = Math.max(memo.width * s, 50);
    const newHeight = Math.max(memo.height * s, 50);

    // Calculate the new center of the card after resizing
    const newCenterX = ox + (newWidth - memo.width) / 2;
    const newCenterY = oy + (newHeight - memo.height) / 2;

    setPosition({
      x: newCenterX,
      y: newCenterY,
    });
    setCardSize({ width: newWidth, height: newHeight });

    if (!first) {
      setIsResizing(false);
      // Update position in the context after resizing
      setCardPosition(String(id), position);
    }

    return memo; // Return the updated memo for the next frame
  },
  { target: postCardRef.current ? postCardRef.current : undefined, // Conditional check for null
    eventOptions: { passive: false }  } // Use postCardRef.current here
);

 
  
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as Element;
  
    // Check if the click is on the reset button
    if (targetElement.closest('.neumorphic-reset-icon')) {
      resetPositionAndSize(); // Don't do anything if the reset button was clicked
    }
  
    if (!targetElement.closest('.resize-handle') && !isResizing) {
      handleCardClick(); // Select/deselect the card
    }
  };

useEffect(() => {
  setZIndex(isSelected || isDragging ? 1000 : index + 1); // Adjust zIndex during drag
}, [isSelected, isDragging, index]);



useEffect(() => {
  if (isSelected) {
    setZIndex(1000); // Bring the selected card to the front
  } else {
    setZIndex(index + 1); // Reset to the original zIndex when not selected
  }
}, [isSelected, index]); // Dependency array includes isSelected and index

useEffect(() => {
  setPosition(initialPosition); // Update position when initialPosition changes
}, [initialPosition]); // Add initialPosition to the dependency array

 
return (
  <div  ref={postCardRef} className={`post-item ${isSelected ? "selected" : ""}`}
     {...bindDrag()}
     onClick={handleTap}
     onMouseDown={(e) => { e.stopPropagation(); }}> 
     
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
      {/* Conditional Reset Button */}
      {(isSelected || isResettable) && (
        <button className="neumorphic-reset-icon" onClick={resetPositionAndSize}>
          <BiReset />
        </button>
      )}

      {/* Neumorphic Card */}
      <div className={`neumorphic post-card ${isSelected || isResizing ? "resizing" : ""}`}>
        {/* Card Content */}
        <div className="card-content">
          <p className="post-info">
            <b>{post.userId}</b> @{channel} - {formattedTimestamp}
          </p>

          {/* Conditional Text Content Rendering */}
          {post.postType === "IMAGE" ? null : (
            <div className="post-content">{parse(post.content)}</div>
          )}

          {/* Render Post Content (Image, Video, or Text) */}
          {renderPostContent()}
        </div>

        {/* Resize Handle */}
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

    {/* Resizing Preview Outline */}
    {isResizing && (
      <div className="preview-outline" style={{ ...cardSize, ...initialPosition }} />
    )}
  </div>
);
  };

export default PostCard;