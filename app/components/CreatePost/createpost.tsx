// components/PostForm/CreatePost.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { PostType } from '@prisma/client';
type OnCloseFn = () => void

const CreatePost = ({ onClose, onPostCreated }: { onClose: OnCloseFn, onPostCreated: OnCloseFn }) => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('TEXT'); // Default to TEXT post type
  const [isPublic, setIsPublic] = useState(true);
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [postDestination, setPostDestination] = useState<'SELF' | 'CHANNEL'>('SELF');
  const [isPrivate, setIsPrivate] = useState(false);
  const isMediaPost = postType === 'IMAGE' || postType === 'VIDEO'; // Determine if media is needed
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 

    if (isMediaPost && !mediaUrl.trim()) {
      setError("Media URL is required for image or video posts");
      return;
    }
    const postData = {
      content,
      postType: postType,
      isPublic: isPublic,
      mediaUrl: mediaUrl,
    };

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          mediaUrl,
          postType,
          isPrivate,
          postDestination: isPrivate ? 'SELF' : postDestination, // Conditional postDestination
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "An error occurred while creating the post.");
      } else {
        onPostCreated(); // Trigger refresh in MyHomePage
        onClose(); // Close the modal
        // Redirect to MyHomePage to see the new post immediately
        router.refresh(); 
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError("An error occurred while creating the post");
    }
  };


  // ... (your other form elements for post content, etc.)

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>

        {/* Form fields */}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="content">Content:</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required 
            />
          </div>
          <div>
            <label htmlFor="mediaUrl">Media URL:</label>
            <input
              type="text"
              id="mediaUrl"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              disabled={!isMediaPost} // Disable unless it's an image or video post
            />
          </div>

          <div>
            <label htmlFor="postType">Post Type:</label>
            <select
              id="postType"
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              required
            >
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              {/* Add other post types as needed */}
            </select>
          </div>

          <div>
            <label htmlFor="isPrivate">Private Post:</label>
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
          </div>

          <div>
            <label htmlFor="postDestination">Post To:</label>
            <select
              id="postDestination"
              value={postDestination}
              onChange={(e) => setPostDestination(e.target.value as 'SELF' | 'CHANNEL')}
              disabled={isPrivate} // Disable when isPrivate is true
            >
              <option value="SELF">Self</option>
              <option value="CHANNEL">Channel</option>
            </select>
          </div>

          {/* Add other form elements if necessary, e.g., for mediaUrl */}
          <button type="submit">Create Post</button>
        </form>
        
        {error && <p className="error-message">{error}</p>} 
      </div>
    </div>
  );
};

export default CreatePost;