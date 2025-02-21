"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GameController from "@/components/game/GameController";
import { Stage, PipeState, PipeDirection, PipeType } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const validatePipeState = (pipe: any): PipeState => {
  if (!pipe || typeof pipe !== "object") {
    return {
      type: "empty" as PipeType,
      direction: 0 as PipeDirection,
      isFixed: false,
    };
  }

  return {
    type: (pipe.type || "empty") as PipeType,
    direction: (typeof pipe.direction === "number"
      ? pipe.direction
      : 0) as PipeDirection,
    isFixed: Boolean(pipe.isFixed),
    isConnected: Boolean(pipe.isConnected),
  };
};

const validateStageData = (data: any): Stage => {
  // 基本的なプロパティの検証と変換
  const stage: Stage = {
    id: typeof data.id === "number" ? data.id : 0,
    name: typeof data.name === "string" ? data.name : "Unknown Stage",
    width: typeof data.width === "number" ? data.width : 3,
    height: typeof data.height === "number" ? data.height : 3,
    pipes: [],
    createdAt: new Date(data.createdAt || Date.now()),
    updatedAt: new Date(data.updatedAt || Date.now()),
  };

  // パイプデータの検証と変換
  if (Array.isArray(data.pipes)) {
    stage.pipes = data.pipes.map((row: any[]) =>
      Array.isArray(row) ? row.map((pipe: any) => validatePipeState(pipe)) : []
    );

    // パイプ配列のサイズが width × height と一致することを確認
    if (stage.pipes.length !== stage.height) {
      stage.pipes = Array(stage.height)
        .fill(null)
        .map(() =>
          Array(stage.width)
            .fill(null)
            .map(() => validatePipeState(null))
        );
    } else {
      // 各行の長さを確認
      stage.pipes = stage.pipes.map((row: PipeState[]) => {
        if (row.length !== stage.width) {
          return Array(stage.width)
            .fill(null)
            .map(() => validatePipeState(null));
        }
        return row;
      });
    }
  } else {
    // パイプデータが配列でない場合は初期化
    stage.pipes = Array(stage.height)
      .fill(null)
      .map(() =>
        Array(stage.width)
          .fill(null)
          .map(() => validatePipeState(null))
      );
  }

  return stage;
};

export default function GamePage({ params }: { params: { stage: string } }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const stageId = parseInt(params.stage);
        if (isNaN(stageId)) {
          throw new Error("Invalid stage ID");
        }

        const response = await fetch(`/api/stages/${stageId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Stage not found");
          }
          throw new Error("Failed to fetch stage");
        }

        const data = await response.json();
        const validatedStage = validateStageData(data);
        setStage(validatedStage);
      } catch (error) {
        console.error("Error fetching stage:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStage();
  }, [params.stage, router]);

  const handleStageClear = () => {
    try {
      const clearedStages = JSON.parse(
        localStorage.getItem("clearedStages") || "[]"
      );
      if (stage && !clearedStages.includes(stage.id)) {
        clearedStages.push(stage.id);
        localStorage.setItem("clearedStages", JSON.stringify(clearedStages));
      }
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }

    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error: {error}
          <div className="mt-2 text-sm">Redirecting to home page...</div>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Stage not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/">
          <Button variant="secondary" size="sm">
            ← Back to Main
          </Button>
        </Link>
      </div>
      <GameController stage={stage} onStageClear={handleStageClear} />
    </div>
  );
}
