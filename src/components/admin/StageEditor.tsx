import React, { useState } from "react";
import { PipeState, PipeType } from "@/lib/types";
import Pipe from "../game/Pipe";

interface StageEditorProps {
  initialData?: {
    name: string;
    width: number;
    height: number;
    pipes: PipeState[][];
  };
  onSave: (data: {
    name: string;
    width: number;
    height: number;
    pipes: PipeState[][];
  }) => void;
}

const PIPE_TYPES: PipeType[] = [
  "straight",
  "corner",
  "tee",
  "cross",
  "start",
  "end",
];

export const StageEditor: React.FC<StageEditorProps> = ({
  initialData,
  onSave,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [width, setWidth] = useState(initialData?.width || 6);
  const [height, setHeight] = useState(initialData?.height || 6);
  const [selectedType, setSelectedType] = useState<PipeType>("straight");
  const [isFixed, setIsFixed] = useState(false);
  const [pipes, setPipes] = useState<PipeState[][]>(
    initialData?.pipes ||
      Array(height)
        .fill(0)
        .map(() =>
          Array(width)
            .fill(0)
            .map(() => ({
              type: "straight",
              direction: 0,
              isFixed: false,
            }))
        )
  );

  const handleSizeChange = (newWidth: number, newHeight: number) => {
    const newPipes: PipeState[][] = Array(newHeight)
      .fill(0)
      .map(() =>
        Array(newWidth)
          .fill(0)
          .map(() => ({
            type: "straight" as PipeType,
            direction: 0,
            isFixed: false,
          }))
      );
    setPipes(newPipes);
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleCellClick = (row: number, col: number) => {
    const newPipes = [...pipes];
    newPipes[row][col] = {
      type: selectedType,
      direction: 0,
      isFixed,
    };
    setPipes(newPipes);
  };

  const handleRotate = (row: number, col: number) => {
    const newPipes = [...pipes];
    const currentDirection = newPipes[row][col].direction;
    newPipes[row][col] = {
      ...newPipes[row][col],
      direction: ((currentDirection + 90) % 360) as PipeState["direction"],
    };
    setPipes(newPipes);
  };

  const handleSaveClick = () => {
    onSave({
      name,
      width,
      height,
      pipes,
    });
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="mb-2 block">Stage Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="mb-4 flex gap-4">
        <div>
          <label className="mb-2 block">Width:</label>
          <input
            type="number"
            value={width}
            onChange={(e) => handleSizeChange(parseInt(e.target.value), height)}
            min={4}
            max={10}
            className="w-20 rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-2 block">Height:</label>
          <input
            type="number"
            value={height}
            onChange={(e) => handleSizeChange(width, parseInt(e.target.value))}
            min={4}
            max={10}
            className="w-20 rounded border px-3 py-2"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block">Pipe Type:</label>
        <div className="flex gap-2">
          {PIPE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded border p-2 ${
                selectedType === type ? "bg-blue-500 text-white" : ""
              }`}
            >
              <Pipe
                pipe={{
                  type,
                  direction: 0,
                  isFixed: false,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
            className="mr-2"
          />
          Fixed Position
        </label>
      </div>

      <div className="mb-4">
        <div
          className="grid gap-1 rounded-lg bg-white shadow"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          }}
        >
          {pipes.map((row, rowIndex) =>
            row.map((pipe, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleRotate(rowIndex, colIndex);
                }}
              >
                <Pipe pipe={pipe} />
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleSaveClick}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Save Stage
      </button>
    </div>
  );
};

export default StageEditor;
