import Image from "next/image";
import { Card } from "../types";
import { useContext, useState } from "react";
import { CardViewerContext, ClickPosition } from "./CardViewerContext";
import { motion } from "motion/react";

/**
 * A card image that scales elegantly with border radius.
 */
export function CardImage({ card, isDraggable = false, width = 256, height = 357 }: { card: Card, isDraggable?: boolean, width?: number, height?: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const callback = useContext(CardViewerContext);
  
  const handleClick = (event: React.MouseEvent) => {
    const position: ClickPosition = {
      x: event.clientX,
      y: event.clientY
    };
    callback(card, position);
  };

  const hasBackFace = !!card.back_face_image_url;

  return (
    <div className="relative">
      {hasBackFace && <button className="hidden md:block absolute top-12 right-2 bg-mana-blue text-white px-2 py-1 rounded-md cursor-pointer z-10" onClick={() => setIsFlipped(!isFlipped)}>Flip</button>}
      {/* Front face */}
      <motion.div
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ 
          transformStyle: "preserve-3d",
          width: "100%",
          height: "100%"
        }}
      >
        <Image
          src={card.image_url}
          onClick={handleClick}
          alt={card.name}
          width={width}
          height={height}
          draggable={false}
          className={`select-none object-contain rounded-[5%] ${isDraggable ? "cursor-grab" : "cursor-pointer"}`}
          style={{
            backfaceVisibility: "hidden",
            position: hasBackFace ? "absolute" : "static",
          }}
        />
      </motion.div>
      {/* Back face */}
      {hasBackFace && (
        <motion.div
          animate={{ 
            rotateY: isFlipped ? 0 : -180,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ 
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%"
          }}
        >
          <Image
            src={card.back_face_image_url!}
            onClick={handleClick}
            alt={card.name}
            width={width}
            height={height}
            draggable={false}
            className={`select-none object-contain rounded-[5%] ${isDraggable ? "cursor-grab" : "cursor-pointer"}`}
            style={{
              backfaceVisibility: "hidden",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}