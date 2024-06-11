"use client";
import '@/app/styles/global.css';
import { useState, useRef, useEffect, createRef, RefObject, MouseEvent, TouchEvent, BaseSyntheticEvent } from "react";
import Image from "next/image";
import moment from 'moment';
import parse from 'html-react-parser';
import { useCardPositions } from '@/app/context/cardPositionsContext';
import { PostType } from '@prisma/client';
import ReactPlayer from 'react-player/lazy';
import { MdOpenWith } from 'react-icons/md';
import { Rnd, RndResizeCallback } from 'react-rnd';
import { useDrag, usePinch} from '@use-gesture/react';
import { BiReset } from 'react-icons/bi';
import Icon from '@mdi/react';
import { mdiArrowCollapseLeft } from '@mdi/js';
import { Comment } from '@/app/lib/types';
const CardSkeleton = () => (
  <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
);

export interface CardPosition {
  x: number;
  y: number;

}

interface CommentsProps {
  comments: { [key: string]: Comment[] }; // Allow for null initially
  postId: string; 
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
  comments: CommentsProps;
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

const PostCard = ({
  id, index, onCardClick, containerWidth, content, userId, channel, timestamp, postType, mediaUrl
}: PostCardProps) => {
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false); 
  const [comments, setComments] = useState<CommentsProps>({
    postId: id, // Initialize with the current post's ID
    comments:{ [id]: [] } // Empty array to start with no comments
});


  useEffect(() => {
    if (!cardPositions[id.toString()]) {
      // If no position is stored, use the default
      setCardPosition(String(id), initialPosition);
    }
  }, [id, initialPosition]);

  const flipCard = () => {
    console.log("Flip button clicked!");
    setIsFlipped(!isFlipped);
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
    })
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
      setPreviewSize(cardSize); // Reset the preview size after resizing is complete
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

const handleAddComment = async () => {
  if (newComment.trim() === "") return;

  try {
    const response = await fetch(`/api/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newComment, postId: parseInt(id, 10) }),
    });

    if (response.ok) {
      const newCommentData = await response.json();

      setComments((prevComments) => {
                if (!prevComments) return prevComments; // Handle null case
                
                // Update only the comments array for the specific post
                 const existingComments = prevComments.comments?.[id] ?? []; 

                // Explicitly check if existingComments is an array
                const updatedComments = Array.isArray(existingComments)
                    ? [...existingComments, newCommentData]  
                    : [newCommentData];
          
                return {
                  ...prevComments, // Keep other posts' comments
                  comments: {
                    ...prevComments.comments,  // Keep existing comments for other posts
                    [id]: updatedComments // Update comments for this post
                  }
                };
              });
        

      setNewComment(""); // Clear the input field after adding a comment
    } else {
      const errorData = await response.json();
      console.error("Failed to add comment:", response.status, errorData);
    }
  } catch (error) {
    console.error("Error adding comment:", error);
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
  const bindDrag = useDrag(({ down, movement: [x, y] }) => {
    if (!isResizing) {
        setPosition({ x: x + initialPosition.x, y: y + initialPosition.y });
        if (!down) {
            setCardPosition(String(id), position);
        }
    }
});

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
    { target: postCardRef, eventOptions: { passive: false } }
  );

 
  
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as Element; // Type assertion to Element

    if (!targetElement.closest('.resize-handle') && !isResizing) {
        handleCardClick(); 
    }
};

  useEffect(() => {
    setZIndex(isSelected ? 1000 : index + 1); // Assuming cards start at z-index 1
  }, [isSelected]);


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

  useEffect(() => {
    const fetchComments = async () => {
      if (isFlipped) {
        setIsLoadingComments(true); 
        try {
          const response = await fetch(`/api/comments?postId=${id}`);
          if (response.ok) {
            const data = await response.json();
            setComments((prevComments) => ({
              postId: id,
              comments: {
                ...prevComments.comments,
                [id]: data.data[id] || []
              },
            }));
          } else {
            console.error("Failed to fetch comments:", response.status);
          }
        } catch (error) {
          console.error("Error fetching comments:", error);
        } finally {
          setIsLoadingComments(false); 
        }
      }
    };
    fetchComments();
  }, [id, isFlipped]);


 
return (
  <div className={`post-item ${isSelected ? "selected" : ""}`} {...bindDrag()} onClick={handleCardClick}>
    <Rnd
      ref={nodeRef}
      size={isResizing ? previewSize : { width: cardSize.width, height: cardSize.height }}
      position={initialPosition}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      enableResizing={{ bottomRight: true }}
      onDoubleClick={handleDoubleClick}
      style={{ zIndex }}
      onClick={handleTap}
    >
      <div
        className={`neumorphic post-card ${isFlipped ? 'flipped' : ''}`}
        style={isFlipped ? { height: 700 } : { width: cardSize.width, height: cardSize.height }}
      >

        {/* Comments Section (Back Side) */}
        {isFlipped && (
          <div className="comments-section">
            <textarea
              className="neumorphic-comment-box"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button className="neumorphic-comment-button" onClick={() => handleAddComment()}>
              Add Comment
            </button>

            <div className="comments-list">
                        {isLoadingComments ? (
                    <p>Loading comments...</p>
                  ) : (
                    Array.isArray(comments.comments?.[id])
                      ? comments.comments[id].map((comment: Comment) => (
                        <div key={comment.id} className="neumorphic comment-container">
                        <p>{comment.content}</p>
                        {/* Add any other comment details you want to display (e.g., username, timestamp) */}
                      </div>
                        ))
                      : <p>No comments yet.</p>
                  )}
                      </div>
                    </div>
                  )}

        {/* Card Buttons */}
        <div className={`card-buttons-container ${isFlipped ? 'flipped' : ''}`}>
          {!isFlipped && (
            <>
              {isResettable && (
                <button className="neumorphic-reset-icon" onClick={resetPositionAndSize}>
                  <BiReset />
                </button>
              )}
              <div
                className="resize-handle"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                }}
              >
                <MdOpenWith size={30} />
              </div>
            </>
          )}
          <button className="flip-button" onClick={flipCard}>
            <Icon path={mdiArrowCollapseLeft} size={0.6} />
          </button>
        </div>

        {/* Post Content (Front Side) */}
        {!isFlipped && (
          <div>
            <p>
              <b>{userId}</b> @{channel} - {formattedTimestamp}
            </p>
            {renderPostContent()}
          </div>
        )}
      </div>

      {isResizing && <div className="preview-outline" />} 
    </Rnd>
  </div>
);
}

export default PostCard;
