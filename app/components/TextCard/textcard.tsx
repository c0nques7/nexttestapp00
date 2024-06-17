import React, { useState, useEffect } from 'react';

interface TextCardProps {
    textContent: string;
    isExpanded: boolean;
    onClick: () => void;
    className?: string;
   
  }

const CardSkeleton = () => (
    <div className="rounded-xl bg-gray-200 h-64 animate-pulse"></div>
  );

const TextCard = ({ textContent, isExpanded, onClick }: TextCardProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [content, setContent] = useState(''); // State to hold the text content

    useEffect(() => {
        if (textContent) {
            setContent(textContent);
            setIsLoading(false);
        }
    }, [textContent]);

    return (
        <div className={`card ${isExpanded ? "expanded" : ""}`} onClick={onClick}>
            <div className="card-inner">
                <div className={`front w-full h-full`}>
                    {isLoading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="text-post-content p-4">
                            <p className="text-lg font-semibold">{content}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextCard;