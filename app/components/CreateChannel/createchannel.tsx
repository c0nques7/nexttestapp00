'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 

interface CreateChannelProps {
  onClose: () => void;
}

const CreateChannel = ({ onClose }: CreateChannelProps) => {
    const router = useRouter();
    const [channelName, setChannelName] = useState('');
    const [error, setError] = useState<string | null>(null);
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      const trimmedChannelName = channelName.trim();
  
      if (!trimmedChannelName) {
        setError('Channel name is required');
        return;
      }
  
      try {
        const response = await fetch('/api/channels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: trimmedChannelName }),
        });
  
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'An error occurred while creating the channel.');
        } else {
          const newChannel = await response.json();
          onClose(); // Close the modal
          // Redirect the user to the new channel
          router.refresh();
        }
      } catch (error) {
        console.error('Error creating channel:', error);
        setError('An error occurred while creating the channel');
      }
    };
  
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close-button" onClick={onClose}>&times;</span>
  
          <h4>Create New Channel</h4>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="channelName">Channel Name:</label>
              <input
                type="text"
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
              />
            </div>
            <button type="submit">Create Channel</button>
          </form>
  
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    );
  };
  
  export default CreateChannel;