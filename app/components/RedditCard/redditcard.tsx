"use client";

import { useState, useEffect } from "react";
import { RedditPostData } from "../../lib/types";
import Image from "next/image";

const allowedImageHosts = [
  "preview.redd.it",
  "external-preview.redd.it",
  "b.thumbs.redditmedia.com",
  "a.thumbs.redditmedia.com",
  "www.redditstatic.com",
];

const CardSkeleton = () => (
  <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
);

interface RedditCardProps {
  postData: RedditPostData;
  isExpanded: boolean;
  onClick: () => void;
  mediaUrl?: string;  // Made optional
  postUrl?: string;  
}



export default function RedditCard({ postData, isExpanded, onClick, mediaUrl, postUrl }: RedditCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const handleMediaClick = () => {
    setIsVideoExpanded(!isVideoExpanded);
  };
  useEffect(() => {
    const loadImage = async () => {
      try {
        if (postData) {
          let imageUrlToUse = null;

          if (postData.post_hint === "image" && allowedImageHosts.some((host) => postData.url.includes(host))) {
            imageUrlToUse = postData.url; 
          } else if (postData.thumbnail && postData.thumbnail !== "self" && postData.thumbnail !== "default") {
            imageUrlToUse = postData.thumbnail;
          }

          if (imageUrlToUse) {
            // ... (rest of your image loading logic)
          } else {
            setImageSrc(null); // Or set a default placeholder image URL
            setImageError(true);
          }
        }
      } catch (error) {
        console.error("Error loading image:", error);
        setImageError(true);
        setImageSrc(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [postData]);

  return (
    <div
      className={`neumorphic.post-card ${isExpanded ? "expanded" : ""}`}
      onClick={onClick}
    >
      <div className="card-inner">
        {postData && ( 
          <>
            <div className={`front w-full h-full ${imageError ? "bg-lightblue-300" : ""}`}>
              {isLoading ? (
                <CardSkeleton /> 
              ) : imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={postData.title}
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover rounded-t-xl"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="p-4 flex items-center justify-center h-full">
                  <p>No Image Available</p> 
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {postData.title}
                </h3>
                <p className="text-sm">
                  r/{postData.subreddit} by u/{postData.author}
                </p>
              </div>

              {/* Conditional Content / Skeleton based on isExpanded */}
              {isExpanded ? ( // Check if expanded
                <div className="reddit-card-content">
                  <p>Author: u/{postData.author}</p>
                  <p>Score: {postData.score}</p>
                  <p>Comments: {postData.num_comments}</p>

                  {postData.is_video &&
                    postData.media?.reddit_video?.fallback_url && (
                      <div className="reddit-card-media">
                        <iframe
                          src={postData.media.reddit_video.fallback_url}
                          allowFullScreen
                        />
                      </div>
                    )}

                  {/* ... (your link to view on Reddit) */}
                </div>
              ) : (
                // Use the imported CardSkeleton
                <CardSkeleton /> 
              )} 
            </div>
          </>
        )}
      </div>
    </div>
  );
}