"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stage } from "@/lib/types";

export default function Home() {
  const [stages, setStages] = useState<Stage[]>([]); // 空配列で初期化
  const [clearedStages, setClearedStages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加
  const [error, setError] = useState<string | null>(null); // エラー状態を追加

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/stages");
        if (!response.ok) {
          throw new Error("Failed to fetch stages");
        }
        const data = await response.json();
        // データの型をチェック
        if (Array.isArray(data)) {
          setStages(data);
        } else {
          console.error("Received non-array data:", data);
          setStages([]);
        }

        // ローカルストレージからクリア済みステージを取得
        const cleared = JSON.parse(
          localStorage.getItem("clearedStages") || "[]"
        );
        setClearedStages(cleared);
      } catch (err) {
        console.error("Error fetching stages:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch stages");
        setStages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStages();
  }, []);

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
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Pipe Puzzle Game</h1>

      {stages.length === 0 ? (
        <div className="text-center text-gray-600">
          No stages available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage, index) => {
            const isLocked =
              index > 0 && !clearedStages.includes(stages[index - 1].id);

            return (
              <div
                key={stage.id}
                className={`
                  rounded-lg p-6 shadow-md
                  ${isLocked ? "bg-gray-100" : "bg-white transition-shadow hover:shadow-lg"}
                `}
              >
                <h2 className="mb-2 text-xl font-bold">
                  Stage {stage.id}: {stage.name}
                </h2>
                {isLocked ? (
                  <p className="text-gray-500">
                    Clear previous stage to unlock
                  </p>
                ) : (
                  <Link
                    href={`/game/${stage.id}`}
                    className="inline-block rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                  >
                    Play
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
