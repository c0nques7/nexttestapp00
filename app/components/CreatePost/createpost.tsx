// components/PostForm/CreatePost.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { PostType, Channel } from '@prisma/client';
type OnCloseFn = () => void

interface CreatePostProps {
  onClose: OnCloseFn;
  onPostCreated: OnCloseFn;
  channels: Channel[];
}

const CreatePost = ({ onClose, onPostCreated, channels }: CreatePostProps) => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('TEXT'); // Default to TEXT post type
  const [isPublic, setIsPublic] = useState(true);
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [postDestination, setPostDestination] = useState<'SELF' | 'CHANNEL'>('SELF');
  const [isPrivate, setIsPrivate] = useState(false);
  const isMediaPost = postType === 'IMAGE' || postType === 'VIDEO'; // Determine if media is needed
  const [channelName, setChannelName] = useState(''); // New state for channel name
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [shouldReload, setShouldReload] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 

    const selectElement = e.currentTarget.elements.namedItem('channel') as HTMLSelectElement;
    const selectedChannelId = Number(selectElement.value);

    setSelectedChannelId(selectedChannelId);
    console.log("Selected Channel ID:", selectedChannelId);

    if (isMediaPost && !mediaUrl.trim()) {
      setError("Media URL is required for image or video posts");
      return;
    }

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
          isPublic,
          channelId: selectedChannelId,
          channelName: selectedChannel ? selectedChannel.name : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "An error occurred while creating the post.");
      } else {
        onPostCreated(); // Trigger refresh in MyHomePage
        onClose(); // Close the modal
        setShouldReload(true);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setError("An error occurred while creating the post");
    }
  };

  useEffect(() => {
    if (shouldReload) {
        router.refresh();
        setShouldReload(false); // Reset the flag to prevent multiple reloads
    }
}, [shouldReload, router]);



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
          {/* Conditionally render the mediaUrl input */}
          {isMediaPost && ( 
            <div>
              <label htmlFor="mediaUrl">Media URL:</label>
              <input
                type="text"
                id="mediaUrl"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                required
              />
            </div>
          )}

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
                    disabled={isPrivate}
                >
                    <option value="SELF">Self</option>
                    <option value="CHANNEL">Channel</option>
                </select>
            </div>

            {/* Conditionally render the channel input */}
           
            {postDestination === 'CHANNEL' && (
                <div>
                    <label htmlFor="channel">Channel:</label>
                    <select
                        id="channel"
                        value={selectedChannel ? selectedChannel.id : ''} 
                        onChange={(e) => {
                            const channelId = Number(e.target.value);
                            const selected = channels.find(c => c.id === channelId);
                            setSelectedChannel(selected ? { ...selected, isCorpAccount: selected.isCorpAccount ?? false } : null);
                        }}
                    >
                        <option value="">Select a Channel</option>
                        {channels.map(channel => (
                            <option key={channel.id} value={channel.id}>
                                {channel.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
                <button type="submit">Create Post</button>
            </form>

            {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};
export default CreatePost;