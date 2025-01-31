import React, { useState, useEffect, useCallback } from "react";
import Pipe from "./Pipe";
import { PipeState, Stage, PipeDirection } from "@/lib/types";

interface BoardProps {
  stage: Stage;
  onClear?: () => void;
}

export const Board: React.FC<BoardProps> = ({ stage, onClear }) => {
  const [board, setBoard] = useState<PipeState[][]>([]);
  const [connectedPipes, setConnectedPipes] = useState<boolean[][]>([]);

  // パイプの接続方向を取得
  const getConnectedDirections = useCallback((pipe: PipeState): number[] => {
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

  // 接続チェック
  const checkConnection = useCallback(
    (pipe: PipeState, fromDirection: number) => {
      const normalizedFromDirection =
        (360 + (fromDirection - pipe.direction)) % 360;
      const connections = getConnectedDirections(pipe);
      return connections.includes(normalizedFromDirection);
    },
    [getConnectedDirections]
  );

  // 次の位置を取得
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
    if (!board.length) return;

    const connected = Array(stage.height)
      .fill(0)
      .map(() => Array(stage.width).fill(false));
    let startRow = -1;
    let startCol = -1;

    // スタート位置を検索
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].type === "start") {
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
        if (
          row < 0 ||
          row >= board.length ||
          col < 0 ||
          col >= board[0].length
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

  // パイプの回転
  const rotatePipe = useCallback((rowIndex: number, colIndex: number) => {
    console.log(`Attempting to rotate pipe at [${rowIndex}, ${colIndex}]`);

    setBoard((prevBoard) => {
      const currentPipe = prevBoard[rowIndex]?.[colIndex];
      if (!currentPipe || currentPipe.isFixed) {
        console.log("Pipe is fixed or undefined");
        return prevBoard;
      }

      const newBoard = prevBoard.map((row) => [...row]);
      const newDirection = ((currentPipe.direction + 90) %
        360) as PipeDirection;

      console.log(`Rotating from ${currentPipe.direction} to ${newDirection}`);

      newBoard[rowIndex] = [...newBoard[rowIndex]];
      newBoard[rowIndex][colIndex] = {
        ...currentPipe,
        direction: newDirection,
      };

      return newBoard;
    });
  }, []);

  // ボードの初期化
  useEffect(() => {
    if (stage?.pipes) {
      const initialBoard = stage.pipes.map((row) =>
        row.map((pipe) => ({
          ...pipe,
          isFixed: pipe.type === "start" || pipe.type === "end" || pipe.isFixed,
        }))
      );
      setBoard(initialBoard);
      setConnectedPipes(
        Array(stage.height)
          .fill(0)
          .map(() => Array(stage.width).fill(false))
      );
    }
  }, [stage?.pipes, stage.height, stage.width]);

  // 接続状態の更新
  useEffect(() => {
    updateConnections();
  }, [board, updateConnections]);

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
            onClick={() => rotatePipe(rowIndex, colIndex)}
            position={{ row: rowIndex, col: colIndex }}
          />
        ))
      )}
    </div>
  );
};

export default React.memo(Board);
