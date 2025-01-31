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
        return "M 20,50 L 80,50";
      case "corner":
        return "M 20,50 L 50,50 L 50,80";
      case "tee":
        return "M 20,50 L 80,50 M 50,50 L 50,80";
      case "cross":
        return "M 20,50 L 80,50 M 50,20 L 50,80";
      case "start":
        return "M 10,50 L 80,50";
      case "end":
        return "M 20,50 L 90,50";
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
        onClick();
      }
    },
    [pipe.isFixed, onClick]
  );

  return (
    <div
      className={`
        relative size-20 rounded-lg border-2
        ${
          pipe.isConnected
            ? "border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            : "border-gray-200"
        }
        ${pipe.isFixed ? "bg-gray-50" : "cursor-pointer hover:bg-gray-50"}
        transition-all duration-300 ease-in-out
      `}
      onClick={handleClick}
      data-position={`${position.row}-${position.col}`}
      style={{
        transform: `rotate(${pipe.direction}deg)`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <svg viewBox="0 0 100 100" className="pointer-events-none size-full">
        <defs>
          <linearGradient
            id={`pipeGradient-${position.row}-${position.col}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={pipe.isConnected ? "#2563EB" : "#D1D5DB"}
            />
            <stop
              offset="100%"
              stopColor={pipe.isConnected ? "#1D4ED8" : "#9CA3AF"}
            />
          </linearGradient>

          <filter id="innerGlow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>

          <filter id="outerGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 18 -7
            "
            />
          </filter>
        </defs>

        {/* パイプの影 */}
        <path
          d={getPipePath(pipe.type)}
          stroke="#000000"
          strokeWidth="12"
          strokeLinecap="round"
          strokeOpacity="0.1"
          fill="none"
          transform="translate(2,2)"
        />

        {/* パイプの外側の輝き */}
        {pipe.isConnected && (
          <path
            d={getPipePath(pipe.type)}
            stroke="#2563EB"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
            filter="url(#outerGlow)"
          />
        )}

        {/* メインのパイプ */}
        <path
          d={getPipePath(pipe.type)}
          stroke={`url(#pipeGradient-${position.row}-${position.col})`}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          filter={pipe.isConnected ? "url(#innerGlow)" : "none"}
          className="transition-all duration-300"
        />

        {/* パイプのハイライト */}
        <path
          d={getPipePath(pipe.type)}
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeOpacity="0.3"
          fill="none"
          transform="translate(0,-1)"
        />

        {/* スタートマーカー */}
        {pipe.type === "start" && (
          <>
            {/* 外側の輝き効果 */}
            <circle
              cx="15"
              cy="50"
              r="14"
              fill="none"
              stroke={pipe.isConnected ? "#2563EB" : "#4ADE80"}
              strokeWidth="2"
              className="animate-[ping_2s_ease-in-out_infinite]"
              opacity="0.5"
            />

            {/* メインの円 */}
            <circle
              cx="15"
              cy="50"
              r="12"
              className={`transition-colors duration-300 ${pipe.isConnected ? "fill-blue-600" : "fill-green-500"}`}
            />

            {/* 中央の輝き */}
            <circle cx="15" cy="50" r="6" fill="white" opacity="0.4" />

            {/* スタート矢印 */}
            <path
              d="M 8,50 L 22,50 M 18,45 L 22,50 L 18,55"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* エンドマーカー */}
        {pipe.type === "end" && (
          <>
            {/* 外側の輝き効果 */}
            <circle
              cx="85"
              cy="50"
              r="14"
              fill="none"
              stroke={pipe.isConnected ? "#2563EB" : "#EF4444"}
              strokeWidth="2"
              className={
                pipe.isConnected ? "animate-[ping_2s_ease-in-out_infinite]" : ""
              }
              opacity="0.5"
            />

            {/* メインの円 */}
            <circle
              cx="85"
              cy="50"
              r="12"
              className={`transition-colors duration-300 ${
                pipe.isConnected ? "fill-blue-600" : "fill-red-500"
              }`}
            />

            {/* 中央の輝き */}
            <circle cx="85" cy="50" r="6" fill="white" opacity="0.4" />

            {/* ゴールマーク */}
            <path
              d="M 80,45 L 90,55 M 90,45 L 80,55"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={pipe.isConnected ? "" : "animate-pulse"}
            />
          </>
        )}

        {/* 接続状態インジケーター */}
        {!pipe.isFixed && pipe.isConnected && (
          <circle
            cx="50"
            cy="50"
            r="4"
            fill="#2563EB"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
});

Pipe.displayName = "Pipe";

export default Pipe;
