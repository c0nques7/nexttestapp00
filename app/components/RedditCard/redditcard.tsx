"use client";

import { useState, useEffect } from "react";
import { RedditPostData } from "../../ui/types";
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
}

export default function RedditCard({ postData, isExpanded, onClick }: RedditCardProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (postData) {
          const imageUrlToUse = postData.thumbnail; // Use thumbnail directly

          if (imageUrlToUse) {
            // Explicitly check if it's a relative URL:
            const isValidUrl = imageUrlToUse.startsWith("/") || imageUrlToUse.startsWith("http://") || imageUrlToUse.startsWith("https://");
            const src = isValidUrl ? imageUrlToUse : "/" + imageUrlToUse;
            setImageSrc(src);
          } else {
            setImageSrc("https://www.redditstatic.com/new-icon.png");
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
        <div className={`card ${isExpanded ? "expanded" : ""}`} onClick={onClick}>
            <div className="card-inner">
                {postData ? (
                    <>
                        <div className={`front w-full h-full ${imageError ? 'bg-lightblue-300' : ''}`}> 
                            {isLoading ? (
                                <CardSkeleton />
                            ) : imageSrc ? ( 
                                <Image
                                    src={imageSrc}
                                    alt={postData.title}
                                    width={350}
                                    height={350}
                                    className="w-full h-full object-cover rounded-t-xl"
                                    onError={() => setImageError(true)}
                                />
                            ) : null} 
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white rounded-b-xl">
                                <h3 className="font-semibold text-lg line-clamp-2">
                                    {postData.title || "No Title Available"}
                                </h3>
                                <p className="text-sm">
                                    r/{postData.subreddit} by u/{postData.author}
                                </p>
                            </div>
                        </div>

            {isExpanded && (
              <div className="expanded-content absolute w-full h-full top-0 left-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-center z-10 rounded-xl">
                <div>
                  <p className="text-sm">
                    Score: {postData.score} | Comments: {postData.num_comments}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://www.reddit.com${postData.permalink}`,
                        "_blank"
                      );
                    }}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    View on Reddit
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <CardSkeleton />
        )}
      </div>
    </div>
  );
}