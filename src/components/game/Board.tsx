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
          return [90, 180];
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
      return baseDirections.map((dir) => (dir + pipe.direction) % 360);
    },
    [getBaseConnectedDirections]
  );

  // 接続チェックのロジック
  const checkConnection = useCallback(
    (pipe: PipeState, fromDirection: number): boolean => {
      const actualDirections = getActualConnectedDirections(pipe);
      if (pipe.type === "start" && fromDirection === 0) {
        return true;
      }
      const oppositeDirection = (fromDirection + 180) % 360;
      return actualDirections.includes(oppositeDirection);
    },
    [getActualConnectedDirections]
  );

  // 次のセルの位置を計算
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

  // 深さ優先探索による接続確認
  const exploreAllPaths = useCallback(
    (
      row: number,
      col: number,
      fromDirection: number,
      connected: boolean[][],
      visitedGoals: Set<string>,
      visited: Set<string>
    ): boolean => {
      // 境界チェック
      if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
        return false;
      }

      const currentKey = `${row},${col}`;
      const pipe = board[row][col];

      if (!pipe || visited.has(currentKey)) {
        return false;
      }

      if (!checkConnection(pipe, fromDirection)) {
        return false;
      }

      visited.add(currentKey);
      connected[row][col] = true;

      // ゴールに到達した場合
      if (pipe.type === "end") {
        visitedGoals.add(currentKey);
      }

      // 次の接続を試行
      const actualDirections = getActualConnectedDirections(pipe);
      for (const direction of actualDirections) {
        if ((direction + 180) % 360 === fromDirection) continue;

        const [nextRow, nextCol] = getNextPosition(row, col, direction);
        exploreAllPaths(
          nextRow,
          nextCol,
          direction,
          connected,
          visitedGoals,
          visited
        );
      }

      // このパスでつながっているパイプは接続済みとしてマーク
      return true;
    },
    [board, checkConnection, getActualConnectedDirections, getNextPosition]
  );

  // 接続状態の更新
  const updateConnections = useCallback(() => {
    if (!board.length) return;

    // 接続状態を初期化
    const connected = Array(stage.height)
      .fill(0)
      .map(() => Array(stage.width).fill(false));

    // スタート位置とゴール位置を検索
    const startPositions: { row: number; col: number }[] = [];
    const goalPositions: { row: number; col: number }[] = [];

    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j].type === "start") {
          startPositions.push({ row: i, col: j });
        } else if (board[i][j].type === "end") {
          goalPositions.push({ row: i, col: j });
        }
      }
    }

    if (startPositions.length === 0 || goalPositions.length === 0) return;

    console.log(
      `Found ${startPositions.length} starts and ${goalPositions.length} goals`
    );

    let allStartsConnectedToGoals = true;
    let allGoalsConnected = true;
    const connectedGoals = new Set<string>();

    // 各スタート位置からの探索
    for (const startPos of startPositions) {
      const currentConnected = Array(stage.height)
        .fill(0)
        .map(() => Array(stage.width).fill(false));

      const visitedGoals = new Set<string>();
      const visited = new Set<string>();

      exploreAllPaths(
        startPos.row,
        startPos.col,
        0,
        currentConnected,
        visitedGoals,
        visited
      );

      // このスタートがすべてのゴールに到達できたか、
      // もしくは他のスタートと合わせてすべてのゴールに到達できたかをチェック
      for (const goal of goalPositions) {
        const goalKey = `${goal.row},${goal.col}`;
        if (visitedGoals.has(goalKey)) {
          connectedGoals.add(goalKey);
        }
      }

      // このスタートからの接続情報を統合
      for (let i = 0; i < currentConnected.length; i++) {
        for (let j = 0; j < currentConnected[i].length; j++) {
          if (currentConnected[i][j]) {
            connected[i][j] = true;
          }
        }
      }
    }

    // すべてのゴールがいずれかのスタートと接続されているかチェック
    allGoalsConnected = goalPositions.every((goal) =>
      connectedGoals.has(`${goal.row},${goal.col}`)
    );

    // クリア条件: すべてのゴールがいずれかのスタートと接続されている
    if (allGoalsConnected) {
      console.log("All connections complete - Stage clear!");
      onClear?.();
    } else {
      console.log("Not all connections are complete");
    }

    setConnectedPipes(connected);
  }, [board, stage.height, stage.width, exploreAllPaths, onClear]);

  // パイプの回転
  const rotatePipe = useCallback((rowIndex: number, colIndex: number) => {
    setBoard((prevBoard) => {
      const currentPipe = prevBoard[rowIndex]?.[colIndex];
      if (!currentPipe || currentPipe.isFixed) {
        return prevBoard;
      }

      const newBoard = prevBoard.map((row) => [...row]);
      const newDirection = ((currentPipe.direction + 90) %
        360) as PipeDirection;

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
