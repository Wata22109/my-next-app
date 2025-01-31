"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StageEditor from "@/components/admin/StageEditor";
import { Stage, PipeState } from "@/lib/types";

export default function EditStagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const response = await fetch(`/api/stages/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stage");
        }
        const data = await response.json();
        setStage(data);
      } catch (error) {
        console.error("Error fetching stage:", error);
        alert("Failed to load stage data");
        router.push("/admin");
      }
    };

    fetchStage();
  }, [params.id, router]);

  const handleSave = async (stageData: {
    name: string;
    width: number;
    height: number;
    pipes: PipeState[][];
  }) => {
    try {
      const response = await fetch(`/api/stages/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stageData),
      });

      if (!response.ok) {
        throw new Error("Failed to update stage");
      }

      router.push("/admin");
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage. Please try again.");
    }
  };

  if (!stage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Stage {stage.id}</h1>
      <StageEditor
        initialData={{
          name: stage.name,
          width: stage.width,
          height: stage.height,
          pipes: stage.pipes,
        }}
        onSave={handleSave}
      />
    </div>
  );
}
