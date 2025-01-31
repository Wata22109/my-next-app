import React from "react";
import { PipeState } from "@/lib/types";

interface PipeProps {
  pipe: PipeState;
  onClick?: () => void;
}

const Pipe: React.FC<PipeProps> = ({ pipe, onClick }) => {
  // デバッグログを追加
  console.log("Rendering Pipe:", pipe);

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
        return ""; // empty タイプを明示的に処理
      default:
        console.warn(`Unknown pipe type: ${type}`);
        return "";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!pipe.isFixed && onClick) {
      console.log("Pipe clicked, current direction:", pipe.direction);
      onClick();
    }
  };

  return (
    <div
      className={`
        relative size-20 border border-gray-200 
        ${pipe.isFixed ? "bg-gray-100" : "cursor-pointer hover:bg-gray-50"}
        ${pipe.isConnected ? "bg-blue-100" : ""}
        transition-all duration-200 ease-in-out
      `}
      onClick={handleClick}
      style={{
        transform: `rotate(${pipe.direction}deg)`,
        transition: "transform 0.2s ease-in-out",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="size-full"
        style={{ pointerEvents: "none" }} // SVG要素がクリックイベントを妨げないようにする
      >
        <path
          d={getPipePath(pipe.type)}
          stroke={pipe.isConnected ? "#3B82F6" : "#374151"}
          strokeWidth="10"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default React.memo(Pipe);
