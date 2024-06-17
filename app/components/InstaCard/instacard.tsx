import React, { useRef } from "react";
import Draggable from "react-draggable";

interface InstagramCardProps {
  imageUrl: string;
}

const InstagramCard: React.FC<InstagramCardProps> = ({ imageUrl }) => {
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className="instagram-card neumorphic p-2 rounded-lg mb-4">
        <img src={imageUrl} alt="Instagram Post" className="rounded-lg" />
      </div>
    </Draggable>
  );
};

export default InstagramCard;