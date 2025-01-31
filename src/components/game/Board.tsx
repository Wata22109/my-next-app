import React, { useState, useEffect, useCallback } from "react";
import Pipe from "./Pipe";
import { PipeState, Stage, PipeDirection, PipeType } from "@/lib/types";

interface BoardProps {
  stage: Stage;
  onClear?: () => void;
}

export const Board: React.FC<BoardProps> = ({ stage, onClear }) => {
  const [board, setBoard] = useState<PipeState[][]>(() => {
    return (
      stage.pipes ||
      Array(stage.height)
        .fill(null)
        .map(() =>
          Array(stage.width).fill({
            type: "empty" as PipeType,
            direction: 0 as PipeDirection,
            isFixed: false,
          })
        )
    );
  });

  const [connectedPipes, setConnectedPipes] = useState<boolean[][]>(() =>
    Array(stage?.height || 0)
      .fill(null)
      .map(() => Array(stage?.width || 0).fill(false))
  );

  // パイプの接続方向を取得
  const getConnectedDirections = useCallback((pipe: PipeState): number[] => {
    if (!pipe) return [];

    switch (pipe.type) {
      case "straight":
        return [0, 180];
      case "corner":
        return [0, 90];
      case "tee":
        return [0, 90, 180];
      case "cross":
        return [0, 90, 180, 270];
      case "start":
        return [0];
      case "end":
        return [180];
      case "empty":
        return [];
      default:
        return [];
    }
  }, []);

  // パイプの接続をチェック
  const checkConnection = useCallback(
    (pipe: PipeState, fromDirection: number) => {
      if (!pipe) return false;
      const normalizedFromDirection =
        (360 + (fromDirection - pipe.direction)) % 360;
      const connections = getConnectedDirections(pipe);
      return connections.includes(normalizedFromDirection);
    },
    [getConnectedDirections]
  );

  // 次のセルの位置を取得
  const getNextPosition = useCallback(
    (row: number, col: number, direction: number): [number, number] => {
      switch (direction) {
        case 0:
          return [row, col + 1];
        case 90:
          return [row + 1, col];
        case 180:
          return [row, col - 1];
        case 270:
          return [row - 1, col];
        default:
          return [row, col];
      }
    },
    []
  );

  // 接続状態の更新
  const updateConnections = useCallback(() => {
    if (!board || !Array.isArray(board) || board.length === 0) return;

    const connected = Array(stage.height)
      .fill(null)
      .map(() => Array(stage.width).fill(false));

    let startRow = -1;
    let startCol = -1;

    // スタート位置を検索
    for (let i = 0; i < stage.height; i++) {
      for (let j = 0; j < stage.width; j++) {
        if (board[i]?.[j]?.type === "start") {
          startRow = i;
          startCol = j;
          break;
        }
      }
      if (startRow !== -1) break;
    }

    if (startRow !== -1 && startCol !== -1) {
      const dfs = (
        row: number,
        col: number,
        fromDirection: number
      ): boolean => {
        // 境界チェック
        if (
          row < 0 ||
          row >= stage.height ||
          col < 0 ||
          col >= stage.width ||
          !board[row] ||
          !board[row][col]
        ) {
          return false;
        }

        const pipe = board[row][col];
        if (!pipe || connected[row][col]) return false;

        const isConnected = checkConnection(pipe, fromDirection);
        if (!isConnected) return false;

        connected[row][col] = true;

        if (pipe.type === "end") {
          onClear?.();
          return true;
        }

        const directions = getConnectedDirections(pipe);
        for (const direction of directions) {
          const actualDirection = (direction + pipe.direction) % 360;
          const [nextRow, nextCol] = getNextPosition(row, col, actualDirection);
          const oppositeDirection = (actualDirection + 180) % 360;
          if (dfs(nextRow, nextCol, oppositeDirection)) {
            return true;
          }
        }

        return false;
      };

      dfs(startRow, startCol, 0);
    }

    setConnectedPipes(connected);
  }, [
    board,
    stage.height,
    stage.width,
    onClear,
    checkConnection,
    getConnectedDirections,
    getNextPosition,
  ]);

  // 接続状態の初期化
  useEffect(() => {
    if (stage?.pipes && Array.isArray(stage.pipes)) {
      setBoard(stage.pipes);
      setConnectedPipes(
        Array(stage.height)
          .fill(null)
          .map(() => Array(stage.width).fill(false))
      );
      updateConnections();
    }
  }, [stage?.pipes, stage?.height, stage?.width, updateConnections]);

  // パイプの回転
  const rotatePipe = useCallback(
    (row: number, col: number) => {
      console.log("Attempting to rotate pipe at:", row, col);

      // 境界チェック
      if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
        console.warn("Invalid position:", row, col);
        return;
      }

      // パイプの存在と固定状態のチェック
      const currentPipe = board[row][col];
      if (!currentPipe || currentPipe.isFixed) {
        console.warn("Pipe is fixed or undefined:", currentPipe);
        return;
      }

      const newBoard = board.map((rowArr, rowIndex) =>
        rowArr.map((pipe, colIndex) => {
          if (rowIndex === row && colIndex === col) {
            const newDirection = ((pipe.direction + 90) % 360) as PipeDirection;
            console.log("Rotating from", pipe.direction, "to", newDirection);
            return {
              ...pipe,
              direction: newDirection,
            };
          }
          return pipe;
        })
      );

      console.log("Setting new board state");
      setBoard(newBoard);

      // 接続状態の更新を確実に行う
      requestAnimationFrame(() => {
        updateConnections();
      });
    },
    [board, updateConnections]
  );

  // パイプのレンダリング
  return (
    <div
      className="grid gap-1 rounded-lg bg-white p-4 shadow-lg"
      style={{
        gridTemplateColumns: `repeat(${stage.width}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((pipe, colIndex) => (
          <Pipe
            key={`${rowIndex}-${colIndex}`}
            pipe={{
              ...pipe,
              isConnected: connectedPipes[rowIndex]?.[colIndex] || false,
            }}
            onClick={() => {
              console.log("Pipe clicked:", rowIndex, colIndex); // クリックイベントのデバッグログ
              rotatePipe(rowIndex, colIndex);
            }}
          />
        ))
      )}
    </div>
  );
};

export default Board;
