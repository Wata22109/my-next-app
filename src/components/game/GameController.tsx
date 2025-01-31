import React, { useState } from "react";
import Board from "./Board";
import { Stage } from "@/lib/types";

interface GameControllerProps {
  stage: Stage;
  onStageClear: () => void;
}

const GameController: React.FC<GameControllerProps> = ({
  stage,
  onStageClear,
}) => {
  const [showClearMessage, setShowClearMessage] = useState(false);

  const handleStageClear = () => {
    setShowClearMessage(true);
    // ローカルストレージに進捗を保存
    const clearedStages = JSON.parse(
      localStorage.getItem("clearedStages") || "[]"
    );
    if (!clearedStages.includes(stage.id)) {
      clearedStages.push(stage.id);
      localStorage.setItem("clearedStages", JSON.stringify(clearedStages));
    }

    setTimeout(() => {
      setShowClearMessage(false);
      onStageClear();
    }, 2000);
  };

  return (
    <div className="relative">
      <div className="mb-4 text-center text-xl font-bold">
        Stage {stage.id}: {stage.name}
      </div>

      <Board stage={stage} onClear={handleStageClear} />

      {showClearMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-green-600">Stage Clear!</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameController;
