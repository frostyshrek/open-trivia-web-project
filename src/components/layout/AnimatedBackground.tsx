import React from "react";
import "src/css/animation/animated-background.css";
import useIsMobile from "src/hooks/useIsMobile";

// import greyLogo from "/BSC-letter-vectorized-grey.svg";

type Item = {
  top: number;       // % from top
  left: number;      // % from left
  size: number;      // px
  rotate: number;    // deg
  duration: number;  // seconds
  delay?: number;    // seconds
  reverse?: boolean; // reverse the path
  opacity?: number;  // 0–1
};

interface AnimatedBackgroundProps {
  imageSrc?: string;
  items?: Item[];
  mobileItems?: Item[];
  className?: string;
}

const DEFAULT_ITEMS: Item[] = [
  { top: 100, left: 5, size: 160, rotate: -30, duration: 25, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 85, size: 140, rotate: -15, duration: 22, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 70, size: 140, rotate: 35, duration: 32, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 20, size: 140, rotate: -45, duration: 28, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 75, size: 140, rotate: 12, duration: 30, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 45, size: 140, rotate: -8, duration: 34, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 10, size: 160, rotate: -95, duration: 35, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 60, size: 150, rotate: 145, duration: 38, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 1, size: 140, rotate: -160, duration: 42, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 40, size: 160, rotate: 210, duration: 36, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 90, size: 150, rotate: -220, duration: 33, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 50, size: 150, rotate: 275, duration: 44, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 80, size: 140, rotate: 10, duration: 39, opacity: 0.08, delay: Math.random() * 5 },
];

const MOBILE_DEFAULT_ITEMS: Item[] = [
  { top: 100, left: 5, size: 120, rotate: -30, duration: 25, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 85, size: 100, rotate: -15, duration: 22, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 70, size: 100, rotate: 35, duration: 32, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 10, size: 100, rotate: -45, duration: 28, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 75, size: 100, rotate: 12, duration: 30, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 45, size: 100, rotate: -8, duration: 34, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 10, size: 120, rotate: -95, duration: 35, reverse: true, opacity: 0.08, delay: Math.random() * 5 },
  { top: 100, left: 60, size: 100, rotate: 145, duration: 38, opacity: 0.08, delay: Math.random() * 5 },
];


const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  items = DEFAULT_ITEMS,
  mobileItems = MOBILE_DEFAULT_ITEMS,
  className,
}) => {

  const isMobile = useIsMobile(768);

  const itemsToRender = [...(isMobile ? mobileItems ?? MOBILE_DEFAULT_ITEMS : items ?? DEFAULT_ITEMS)];

  const randomIndexes = new Set<number>();
  while (randomIndexes.size < 4) {
    randomIndexes.add(Math.floor(Math.random() * itemsToRender.length));
  }
  randomIndexes.forEach((idx) => {
    itemsToRender[idx] = {
      ...itemsToRender[idx],
      top: Math.random() * (75 - 25) + 25,
      delay: 0
    };
  });

  return (
  <div className={`abg-root ${className ?? ""}`} aria-hidden="true">
    <div className="abg-layer">
      {itemsToRender.map((it, idx) => (
        <span
          key={idx}
          className="abg-item"
          style={
            {
              top: `${it.top}%`,
              left: `${it.left}%`,
              fontSize: `${it.size}px`,
              "--abg-alpha": String(it.opacity ?? 0.08),
              "--abg-rotate": `${it.rotate}deg`,
              "--abg-duration": `${it.duration}s`,
              "--abg-delay": `${it.delay ?? 0}s`,
            } as React.CSSProperties
          }
        >
          <span className="abg-question">?</span>
        </span>
      ))}
    </div>
  </div>
);
};

export default AnimatedBackground;
