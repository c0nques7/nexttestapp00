"use client";
import '@/app/styles/global.css';
import { useState, useRef, useEffect, createRef, RefObject, BaseSyntheticEvent } from "react";
import Image from "next/image";
import moment from 'moment';
import parse from 'html-react-parser';
import { useCardPositions } from '@/app/context/cardPositionsContext';
import { PostType, ContentProvider } from '@prisma/client';
import ReactPlayer from 'react-player/lazy';
import { MdOpenWith } from 'react-icons/md';
import { Rnd, RndResizeStartCallback, Position } from 'react-rnd';
import { useDrag, usePinch} from '@use-gesture/react';
import { BiReset } from 'react-icons/bi';
import { Post } from '@/app/lib/types';
import { Direction } from 'readline';

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
  const initialPosition = cardPositions[id.toString()] || {
    x: (index * (370)) % containerWidth,
    y: Math.floor(index * 370 / containerWidth) * 370,
  };

  const [cardState, setCardState] = useState({
    x: initialPosition.x,
    y: initialPosition.y,
    width: 350,
    height: 350,
    isSelected: false,
    isResizing: false,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [zIndex, setZIndex] = useState(index + 1)
  const [position, setPosition] = useState({x: 0, y: 0});
  const [scale, setScale] = useState(1);
  const [isReset, setIsReset] = useState(false); 
  const [isResettable, setIsResettable] = useState(false);
  const [previewSize, setPreviewSize] = useState({ width: cardState.width, height: cardState.height }); // New state for preview size
  const [initialResize, setInitialResize] = useState({ x: 0, y: 0 });
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set<string>());
  const { width, height, x, y } = cardState; 
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!cardPositions[id.toString()]) {
      // If no position is stored, use the default
      setCardPosition(String(id), initialPosition);
    }
  }, [id, initialPosition]);

  const bindDrag = useDrag(({ down, movement: [mx, my] }) => {
    if (!isResizing) {
      const newX = down ? mx + initialPosition.x : x; 
      const newY = down ? my + initialPosition.y : y;
      setCardState((prev) => ({ ...prev, x: newX, y: newY })); // Update cardState directly

      if (!down) {
        setCardPosition(String(id), { x: newX, y: newY });
        setIsResettable(true);
      } else {
        setIsDragging(true);
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
  
      setCardState(prev => ({
        ...prev,
        width: Math.max(prev.width + deltaX, 50), // Ensure minimum width
        height: Math.max(prev.height + deltaY, 50), // Ensure minimum height
      }));
  
      setStartX(e.touches[0].clientX);
      setStartY(e.touches[0].clientY);
    }
  };



  const handleResizeStart = (e: MouseEvent | TouchEvent, direction: Direction, ref: React.RefObject<HTMLElement>, delta: Position, position: Position) => {
    if (ref.current) {  // Null check
      setInitialResize(ref.current.getBoundingClientRect());
      setIsResizing(true);
    }
  };

  const handleResize = (
    e: MouseEvent | TouchEvent,
    dir: any,
    ref: HTMLElement,
    delta: any,
    position: { x: number; y: number }
  ) => {
    e.preventDefault();
  
    if (e instanceof MouseEvent) {
      console.log("Mouse coordinates:", e.clientX, e.clientY);
    } else if (e instanceof TouchEvent) {
      console.log("Touch coordinates:", e.touches[0].clientX, e.touches[0].clientY);
    }
  
    setCardState((prev) => ({
      ...prev,
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      ...position,
    }));
  };

  const handleResizeStop = (
    e: MouseEvent | TouchEvent,
    dir: any,
    ref: HTMLDivElement,
    delta: any,
    position: { x: number; y: number }
  ) => {
    setIsResizing(false);
    setCardPosition(id, position);
    setIsResettable(true);
  };


  
  const handleDragStop = (e: any, data: any) => {
        setPosition({ x: data.x, y: data.y });
        setCardPosition(id, { x: data.x, y: data.y });
        setIsResettable(true); // Enable reset icon after dragging
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
  console.log("Resetting card position and size");
  // Reset to the initial size and position
  setCardState({ ...initialPosition, width: 350, height: 350, isSelected: false, isResizing: false });
    setCardPosition(id, initialPosition);
    setIsResettable(false);
};

useEffect(() => {
  const currentRef = postCardRef.current; // Get the current reference

  if (currentRef) {
    const touchEndHandler = () => {
      // Your existing handleTouchEnd logic
      setIsResizing(false);
      // ... update card position in the context
    };

    currentRef.addEventListener('touchend', touchEndHandler);

    // Cleanup function to remove the event listener
    return () => {
      currentRef.removeEventListener('touchend', touchEndHandler);
    };
  }
}, [postCardRef]);

useEffect(() => {
  if (!cardPositions[id.toString()]) {
    // If no position is stored, use the default
    setCardPosition(String(id), initialPosition);
  }
}, [id, initialPosition]);
const handleDoubleClick = () => {
  setCardState(prev => ({
    ...prev,                     // Keep all existing properties
    width: 350,
    height: 350
  })); // Reset to original size
};

const handleCardClick = () => {
  setIsSelected(!isSelected);
};


  // Drag gesture with @use-gesture/react


  usePinch(
    ({ first, event, movement: [ms], offset: [s], origin: [ox, oy], memo = { width, height } }) => {
      if (first) {
        event.preventDefault();
        setIsResizing(true);
        memo = { width, height }; 
      }

      const newWidth = Math.max(memo.width * s, 50);
      const newHeight = Math.max(memo.height * s, 50);

      const newCenterX = ox + (newWidth - memo.width) / 2;
      const newCenterY = oy + (newHeight - memo.height) / 2;

      setCardState(prev => ({
        ...prev,
        x: newCenterX,
        y: newCenterY,
        width: newWidth,
        height: newHeight
      }));

      if (!first) {
        setIsResizing(false);
        setCardPosition(String(id), { x: newCenterX, y: newCenterY }); // Update with new center
      }

      return memo; 
    },
    { target: postCardRef.current ? postCardRef.current : undefined,
      eventOptions: { passive: false } } 
  );

 
  
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as Element;
    if (
      !targetElement.closest('.neumorphic-reset-icon') && // Reset icon
      !targetElement.closest('.resize-handle')          // Resize handle
    ) {
      handleCardClick(); // Only call when not on reset or resize handle
    }
  };

useEffect(() => {
  setZIndex(isSelected || isDragging ? 1000 : index + 1); // Adjust zIndex during drag
}, [isSelected, isDragging, index]);



useEffect(() => {
  setPosition(initialPosition); // Update position when initialPosition changes
}, [initialPosition]); // Add initialPosition to the dependency array

 
return (
  <div  ref={postCardRef} className={`post-item ${isSelected ? "selected" : ""}`}
     {...bindDrag()}
     onClick={handleTap}
     onMouseDown={(e) => { e.stopPropagation(); }}
     style={{ touchAction: 'none' }}> 
     
    <Rnd
      ref={nodeRef}
      size={{ width: cardState.width, height: cardState.height }}
      position={{ x: cardState.x, y: cardState.y }}
        onDragStop={(e, d) => {
          setCardState((prev) => ({ ...prev, ...d }));
          handleDragStop(e, d);
        }}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeStop={(e, dir, ref, delta, pos) => {
          setCardState(prev => ({
            ...prev,
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            ...pos,
            isResizing: false,
          }));
          if (e instanceof MouseEvent) {
            handleResizeStop(e, dir, ref as HTMLDivElement, delta, pos);
          }
        }}
        enableResizing={{ bottomRight: true }}
        onDoubleClick={handleDoubleClick}
        style={{ zIndex }}
    >
      {/* Conditional Reset Button */}
      {( isResettable) && (
        <button
        className="neumorphic-reset-icon"
        onClick={(e) => {
          e.stopPropagation(); // Stop event propagation
          resetPositionAndSize();
        }}
      >
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
          ref={resizeHandleRef}
          className="resize-handle"
          onPointerDown={(e) => {
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
      <div className="preview-outline" 
      style={{ 
        width: cardState.width,     
        height: cardState.height,   
        ...initialPosition         }} />
    )}
  </div>
);
  };

export default PostCard;