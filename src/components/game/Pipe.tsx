import React from "react";
import { PipeState } from "@/lib/types";

interface PipeProps {
  pipe: PipeState;
  onClick?: () => void;
  position: { row: number; col: number };
}

const Pipe: React.FC<PipeProps> = React.memo(({ pipe, onClick, position }) => {
  const getPipePath = (type: PipeState["type"]) => {
    switch (type) {
      case "straight":
        return "M 20,50 L 80,50 M 50,20 L 50,80";
      case "corner":
        return "M 20,50 L 50,50 L 50,80";
      case "tee":
        return "M 20,50 L 80,50 M 50,50 L 50,80";
      case "cross":
        return "M 20,50 L 80,50 M 35,35 L 65,65";
      case "start":
        return "M 50,20 L 50,80";
      case "end":
        return "M 50,20 L 50,80";
      case "empty":
      default:
        return "";
    }
  };

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!pipe.isFixed && onClick) {
        console.log(
          `Clicking pipe at [${position.row}, ${position.col}] with direction ${pipe.direction}`
        );
        onClick();
      }
    },
    [pipe.isFixed, onClick, position, pipe.direction]
  );

  return (
    <div
      className={`
        relative size-20 border border-gray-200 
        ${pipe.isFixed ? "bg-gray-100" : "cursor-pointer hover:bg-gray-50"}
        ${pipe.isConnected ? "bg-blue-100" : ""}
      `}
      onClick={handleClick}
      data-position={`${position.row}-${position.col}`}
      style={{
        transform: `rotate(${pipe.direction}deg)`,
        transition: "transform 0.2s ease-in-out",
      }}
    >
      <svg viewBox="0 0 100 100" className="pointer-events-none size-full">
        <path
          d={getPipePath(pipe.type)}
          stroke={pipe.isConnected ? "#3B82F6" : "#374151"}
          strokeWidth="10"
          fill="none"
        />
      </svg>
    </div>
  );
});

Pipe.displayName = "Pipe";

export default Pipe;
