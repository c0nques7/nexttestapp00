'use client';
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
import { mdiArrowCollapseLeft, mdiMenu } from '@mdi/js';
import { Comment } from '@/app/lib/types';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import React from 'react';


const CardSkeleton = () => (
  <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
);

export interface CardPosition {
  x: number;
  y: number;

}

interface CommentsProps {
  comments: { [key: string]: Comment[] };
  postId: string; 
}

interface PostCardProps {
  id: string;
  content: string;
  userId: number;
  channel: string | 'Unknown';
  timestamp: string;
  postType: PostType;
  mediaUrl?: string;
  onCardClick: (postType: PostType) => void;
  expanded: boolean;
  index: number; 
  containerWidth: number;
  comments?: CommentsProps;
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
const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);
const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
const [isMarkedDeleted, setIsMarkedDeleted] = useState(false);
const [replyingToComment, setReplyingToComment] = useState<Comment | null>(null); // Ref for the ReactPlayer component
const handleCommentClick = (comment: Comment) => {
    setReplyingToComment(comment); // Set the comment being replied to
};
const [isDeleted, setIsDeleted] = useState(false);
const [showDeleteCover, setShowDeleteCover] = useState(false);

const router = useRouter();




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
        return <p>Missing video URL</p>;
      }

      try {
        const url = new URL(mediaUrl);
        const videoId = url.searchParams.get('v');
        return videoId ? (
          <div className="video-container">
            <iframe
              id="ytplayer" // Add a unique ID for the iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`} // Enable JS API
            ></iframe>
          </div>
        ) : (
          <p>Invalid YouTube video ID</p>
        );
      } catch (error) {
        console.error("Invalid video URL:", mediaUrl);
        return <p>Invalid video URL</p>;
      }

    default:
      return <p>Unsupported post type or missing media</p>;
  }
};

const confirmDelete = async () => {
  try {
    const deleteUrl=`/api/post/${parseInt(id, 10)}`;
    console.log(deleteUrl);
    const response = await fetch(deleteUrl, { method: 'DELETE' });

    if (response.ok) {
      // Post was successfully deleted. Update UI or state as needed.
      // For example, you could trigger a re-fetch of posts.
      console.log("Post deleted successfully!");
      setIsDeleted(true);
    } else {
      // Handle the error (e.g., show an error message to the user).
      console.log(`Failed to delete with url: ${deleteUrl} post: `, response.status);
      console.error(`Failed to delete with url: ${deleteUrl} post: `, response.status);
    }
  } catch (error) {
    console.log("Error deleting post:");
    console.error("Error deleting post:", error);
  }
  setIsDeleteConfirmationOpen(false); // Close the confirmation after deleting (or error)
  setIsCardMenuOpen(false); // Close the menu
  
  setIsMarkedDeleted(true);
};

const handleAddComment = async () => {
  if (newComment.trim() === "") return;

  try {
      const response = await fetch(`/api/comments/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
              content: newComment, 
              postId: parseInt(id, 10), 
              parentId: replyingToComment ? replyingToComment.id : null // Check for reply context
          }),
      });

      if (response.ok) {
          const newCommentData = await response.json();

          setComments((prevComments) => {
              if (!prevComments) return prevComments;

              const postIdToUpdate = replyingToComment ? replyingToComment.postId : id; // If reply, update parent comment's post
              const existingComments = prevComments.comments?.[postIdToUpdate] ?? [];

              const updatedComments = Array.isArray(existingComments)
                  ? [...existingComments, newCommentData]
                  : [newCommentData];

              return {
                  ...prevComments,
                  comments: {
                      ...prevComments.comments,
                      [postIdToUpdate]: updatedComments
                  }
              };
          });

          setNewComment("");
          setReplyingToComment(null); // Clear the reply context after adding a comment

      } else {
          const errorData = await response.json();
          console.error("Failed to add comment:", response.status, errorData);
      }
  } catch (error) {
      console.error("Error adding comment:", error);
  }
};

const handleCommentDeleteClick = (commentId: number) => {
  setComments((prevComments) => {
      if (!prevComments || !prevComments.comments || !prevComments.comments[id]) return prevComments;

      const updatedCommentsForPost = prevComments.comments[id].map((comment) => {
          if (comment.id === commentId) {
              return { ...comment, showDeleteCover: true }; 
          } else {
              return comment;
          }
      });

      return {
          ...prevComments,
          comments: {
              ...prevComments.comments,
              [id]: updatedCommentsForPost,
          },
      };
  });
};

const handleCancelDelete = () => {
  setComments((prevComments) => {
      if (!prevComments || !prevComments.comments || !prevComments.comments[id]) return prevComments;

      const updatedCommentsForPost = prevComments.comments[id].map((comment) => {
          return { ...comment, showDeleteCover: false };
      });

      return {
          ...prevComments,
          comments: {
              ...prevComments.comments,
              [id]: updatedCommentsForPost,
          },
      };
  });
};

const handleCommentConfirmDelete = async (commentId: number) => {
  // Call handleDeleteComment with the provided commentId
  await handleDeleteComment(commentId);
  // Optionally, reset showDeleteCover state for all comments
  setComments(prevComments => {
    if (!prevComments || !prevComments.comments || !prevComments.comments[id]) return prevComments;

    const updatedCommentsForPost = prevComments.comments[id].map(comment => ({ ...comment, showDeleteCover: false }));

    return {
      ...prevComments,
      comments: {
        ...prevComments.comments,
        [id]: updatedCommentsForPost,
      },
    };
  });
};

const handleDeleteComment = async (commentId: number) => {
  // 1. Fetch all replies (and their replies) to the comment being deleted
  const repliesToDelete = await fetchAllReplies(commentId);

  // 2. Delete all fetched replies
  for (const reply of repliesToDelete) {
    const response = await fetch(`/api/comments/${reply.id}`, { method: 'DELETE' });
    if (!response.ok) {
      console.error(`Failed to delete reply comment: ${reply.id}`, response.status);
    }
  }

  // 3. Delete the original comment
  const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
  if (response.ok) {
    // Update the comments state to reflect the deleted comments and replies
    setComments((prevComments) => {
      const updatedComments = prevComments.comments?.[id]?.filter(
        comment => !repliesToDelete.includes(comment) && comment.id !== commentId
      );

      // If no comments are left for this post, remove the post ID from the comments object
      const newComments = { ...prevComments.comments };
      if (updatedComments?.length === 0) {
        delete newComments[id];
      } else {
        newComments[id] = updatedComments;
      }

      return {
        ...prevComments,
        comments: newComments
      };
    });
  } else {
    console.error("Failed to delete comment:", response.status);
  }
};

async function fetchAllReplies(commentId: number): Promise<Comment[]> {
  let allReplies: Comment[] = [];
  const response = await fetch(`/api/comments?parentId=${commentId}`); // Adjust your API route if needed

  if (response.ok) {
      const data = await response.json();
      const replies = data.data[commentId.toString()] || []; // Assuming similar data format to your GET route

      allReplies = [...replies];
      for (const reply of replies) {
          allReplies = [...allReplies, ...(await fetchAllReplies(reply.id))]; // Recursive call
      }
  }

  return allReplies;
}


const resetPositionAndSize = () => {
  // Reset to the initial size and position
  setCardSize({ width: 350, height: 350 });
  setPosition({ x: 0, y: 0 });             // Reset to origin (0, 0)
    setCardPosition(id, { x: 0, y: 0 });
  setIsResettable(false); // Disable reset icon
  setIsSelected(false);
};

const handleDeleteClick = () => {
  setIsDeleteConfirmationOpen(true);
};

const cancelDelete = () => {
  setIsDeleteConfirmationOpen(false);
};

useEffect(() => {
  if (!cardPositions[id.toString()]) {
    // If no position is stored, use the default
    setCardPosition(String(id), initialPosition);
  }
}, [id, initialPosition]);
const handleDoubleClick = () => {
  setIsSelected(!isSelected); // Reset to original size
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
  if (isMarkedDeleted) {
    router.refresh();
  }
}, [isMarkedDeleted, router]);

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
                [id]: (data.data[id] || []).map((comment: any) => ({
                  ...comment,
                  showDeleteCover: false, // Initialize showDeleteCover
                  ref: createRef<HTMLDivElement>() // Initialize ref property for each comment
                }))
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


 
return isDeleted ? null : (
  <div className={`post-item ${isSelected ? "selected" : ""} ${isMarkedDeleted ? 'deleted' : ''}`}  {...bindDrag()}>
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
              ) : Array.isArray(comments.comments?.[id]) ? (
                comments.comments[id].map((comment: Comment) => (
                  <div key={comment.id} className="comment-item-wrapper">
                    <div className="neumorphic comment-container" ref={comment.ref}>
                      <p>
                        <b>{comment.user?.username || "Unknown User"}:</b> {comment.content}
                      </p>
                      <button onClick={() => handleCommentDeleteClick(comment.id)}>
                        Delete
                      </button>
                    </div>
                    {/* Comment Delete Confirmation Cover */}
                    {comment.showDeleteCover && comment.ref.current && (
                      <div className={`comment-cover ${comment.showDeleteCover ? 'slide-up' : ''}`}>
                        <p>Are you sure you want to delete this comment and all its replies?</p>
                        <button onClick={() => handleCancelDelete()}>Cancel</button>
                        <button onClick={() => handleCommentConfirmDelete(comment.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No comments yet</p>
              )}
            </div>

                        {/* Reply Input (Conditionally Rendered) */}
                        {replyingToComment && (
                            <div className="reply-input">
                                <textarea
                                    className="neumorphic-comment-box"
                                    placeholder={`Replying to ${replyingToComment.user?.username}`}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                />
                                <button className="neumorphic-comment-button" onClick={handleAddComment}>
                                    Reply
                                </button>
                            </div>
                        )}
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
              {!isDeleteConfirmationOpen && (
              <button className="card-menu-button" onClick={() => setIsCardMenuOpen(!isCardMenuOpen)}>
              <Icon path={mdiMenu} size={0.6} />
            </button>
            )}
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

<div 
            className={`card-menu-slider ${isDeleteConfirmationOpen ? 'delete-confirmation' : ''} ${isCardMenuOpen ? 'open' : ''}`}
            style={{ height: isDeleteConfirmationOpen ? '100%' : isCardMenuOpen ? '30%' : '0px' }} 
          > 
            {/* Conditionally Render Menu Items */}
            {!isDeleteConfirmationOpen ? (
              <>
                <button disabled={isDeleteConfirmationOpen}>Edit</button>
                <button disabled={isDeleteConfirmationOpen}>Share</button>
                <button className="card-delete-button" onClick={handleDeleteClick}>Delete</button>
              </>
            ) : (
              <div className="delete-confirmation-content">
                <p>Are you sure you want to delete this post?</p>
                <button onClick={confirmDelete}>Yes</button>
                <button onClick={cancelDelete}>No</button>
              </div>
            )}
          </div>
      </div>
        
      {isResizing && <div className="preview-outline" />} 
    </Rnd>
  </div>
);
}

export default PostCard;


