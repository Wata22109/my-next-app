import React, { useState, useCallback } from "react";
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

  const handleSizeChange = useCallback(
    (newWidth: number, newHeight: number) => {
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
    },
    []
  );

  const handleGridCellClick = useCallback(
    (rowIndex: number, colIndex: number) => {
      console.log(
        `Placing pipe at [${rowIndex}, ${colIndex}], type: ${selectedType}`
      );
      setPipes((prevPipes) => {
        const newPipes = prevPipes.map((row) => [...row]);
        newPipes[rowIndex] = [...newPipes[rowIndex]];
        newPipes[rowIndex][colIndex] = {
          type: selectedType,
          direction: 0,
          isFixed,
        };
        return newPipes;
      });
    },
    [selectedType, isFixed]
  );

  const handleRotate = useCallback((rowIndex: number, colIndex: number) => {
    console.log(`Rotating pipe at [${rowIndex}, ${colIndex}]`);
    setPipes((prevPipes) => {
      const newPipes = prevPipes.map((row) => [...row]);
      const currentPipe = newPipes[rowIndex][colIndex];
      newPipes[rowIndex] = [...newPipes[rowIndex]];
      newPipes[rowIndex][colIndex] = {
        ...currentPipe,
        direction: ((currentPipe.direction + 90) %
          360) as PipeState["direction"],
      };
      return newPipes;
    });
  }, []);

  const handlePipeTypeSelect = useCallback((type: PipeType) => {
    console.log("Selected pipe type:", type);
    setSelectedType(type);
  }, []);

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
            <div
              key={type}
              className={`
                cursor-pointer rounded border p-2
                ${selectedType === type ? "bg-blue-500" : "hover:bg-gray-100"}
              `}
              onClick={() => handlePipeTypeSelect(type)}
            >
              <Pipe
                pipe={{
                  type,
                  direction: 0,
                  isFixed: false,
                }}
                position={{ row: -1, col: -1 }}
                onClick={() => handlePipeTypeSelect(type)}
              />
            </div>
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
          className="grid gap-1 rounded-lg bg-white p-2 shadow"
          style={{
            gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          }}
        >
          {pipes.map((row, rowIndex) =>
            row.map((pipe, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGridCellClick(rowIndex, colIndex);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRotate(rowIndex, colIndex);
                }}
              >
                <Pipe
                  pipe={pipe}
                  position={{ row: rowIndex, col: colIndex }}
                  onClick={() => handleGridCellClick(rowIndex, colIndex)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => onSave({ name, width, height, pipes })}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Save Stage
      </button>
    </div>
  );
};

export default StageEditor;
