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

  // パイプの基本接続方向を定義
  const getBaseConnectedDirections = useCallback(
    (pipe: PipeState): number[] => {
      switch (pipe.type) {
        case "straight":
          return [0, 180];
        case "corner":
          return [90, 180]; // 下と左を基本方向に
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
    },
    []
  );

  // パイプの実際の接続方向を計算
  const getActualConnectedDirections = useCallback(
    (pipe: PipeState): number[] => {
      const baseDirections = getBaseConnectedDirections(pipe);
      return baseDirections.map((dir) => {
        const actualDir = (dir + pipe.direction) % 360;
        console.log(
          `Base direction: ${dir}, Pipe direction: ${pipe.direction}, Actual direction: ${actualDir}`
        );
        return actualDir;
      });
    },
    [getBaseConnectedDirections]
  );

  // 接続チェックのロジック
  const checkConnection = useCallback(
    (pipe: PipeState, fromDirection: number): boolean => {
      console.log(
        `Checking connection for pipe type ${pipe.type} at fromDirection ${fromDirection}, pipe direction ${pipe.direction}`
      );

      // パイプの接続可能方向を取得
      const actualDirections = getActualConnectedDirections(pipe);

      // スタート地点の特別処理
      if (pipe.type === "start" && fromDirection === 0) {
        return true;
      }

      // 接続チェック
      const oppositeDirection = (fromDirection + 180) % 360;
      const isConnected = actualDirections.includes(oppositeDirection);

      console.log(
        `Actual directions: ${actualDirections}, Required direction: ${oppositeDirection}, Is connected: ${isConnected}`
      );
      return isConnected;
    },
    [getActualConnectedDirections]
  );

  // 次のセルの位置を計算
  const getNextPosition = useCallback(
    (row: number, col: number, direction: number): [number, number] => {
      switch (direction) {
        case 0:
          return [row, col + 1]; // 右
        case 90:
          return [row + 1, col]; // 下
        case 180:
          return [row, col - 1]; // 左
        case 270:
          return [row - 1, col]; // 上
        default:
          return [row, col];
      }
    },
    []
  );

  // 深さ優先探索による接続確認
  const dfs = useCallback(
    (
      row: number,
      col: number,
      fromDirection: number,
      connected: boolean[][]
    ): boolean => {
      // 境界チェック
      if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
        console.log(`Out of bounds: [${row}, ${col}]`);
        return false;
      }

      const pipe = board[row][col];
      if (!pipe || connected[row][col]) {
        console.log(`Invalid pipe or already connected: [${row}, ${col}]`);
        return false;
      }

      console.log(
        `Checking pipe at [${row}, ${col}], type: ${pipe.type}, direction: ${pipe.direction}`
      );

      if (!checkConnection(pipe, fromDirection)) {
        console.log(`Connection failed at [${row}, ${col}]`);
        return false;
      }

      connected[row][col] = true;
      console.log(`Connected pipe at [${row}, ${col}]`);

      if (pipe.type === "end") {
        console.log("Found end pipe - Stage clear!");
        onClear?.();
        return true;
      }

      // 次の接続を試行
      const actualDirections = getActualConnectedDirections(pipe);
      for (const direction of actualDirections) {
        if ((direction + 180) % 360 === fromDirection) continue; // 来た方向には戻らない

        const [nextRow, nextCol] = getNextPosition(row, col, direction);
        console.log(
          `Trying next position: direction ${direction} -> [${nextRow}, ${nextCol}]`
        );

        if (dfs(nextRow, nextCol, direction, connected)) {
          return true;
        }
      }

      return false;
    },
    [
      board,
      checkConnection,
      getActualConnectedDirections,
      getNextPosition,
      onClear,
    ]
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

    console.log(`Start position found at [${startRow}, ${startCol}]`);

    if (startRow !== -1 && startCol !== -1) {
      dfs(startRow, startCol, 0, connected);
    }

    setConnectedPipes(connected);
  }, [board, stage.height, stage.width, dfs]);

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
    if (board.length > 0) {
      updateConnections();
    }
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
