"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stage } from "@/lib/types";
import { LockIcon, UnlockIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [clearedStages, setClearedStages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/stages");
        if (!response.ok) throw new Error("Failed to fetch stages");
        const data = await response.json();
        if (Array.isArray(data)) {
          setStages(data);
        } else {
          console.error("Received non-array data:", data);
          setStages([]);
        }

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600">Loading stages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  const calculateProgress = () => {
    if (stages.length === 0) return 0;
    const uniqueClearedStages = new Set(clearedStages);
    const clearedCount = Math.min(uniqueClearedStages.size, stages.length);
    return Math.min((clearedCount / stages.length) * 100, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-12 text-center">
        <div className="absolute right-4 top-4">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">パイプつなぎ</h1>
        <div className="mx-auto max-w-xl">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>攻略度</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="text-center text-gray-600">
          No stages available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage, index) => {
            const isLocked =
              index > 0 && !clearedStages.includes(stages[index - 1].id);
            const isCleared = clearedStages.includes(stage.id);

            return (
              <div
                key={stage.id}
                className={`
                  group relative overflow-hidden rounded-xl border-2 p-6 shadow-lg transition-all duration-300
                  ${
                    isLocked
                      ? "border-gray-200 bg-gray-50"
                      : isCleared
                        ? "border-green-200 bg-green-50 hover:border-green-300"
                        : "border-blue-200 bg-white hover:border-blue-300"
                  }
                `}
              >
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      Stage {stage.name}
                    </h2>
                    {isCleared && (
                      <TrophyIcon className="size-6 text-yellow-500" />
                    )}
                  </div>
                  {isLocked ? (
                    <div className="flex items-center text-gray-500">
                      <LockIcon className="mr-2 size-4" />
                      <p className="text-sm">前のステージをクリア</p>
                    </div>
                  ) : (
                    <Link
                      href={`/game/${stage.id}`}
                      className={`
                        inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors
                        ${
                          isCleared
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }
                      `}
                    >
                      {isCleared ? "Play Again" : "Play"}
                      <UnlockIcon className="ml-2 size-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
