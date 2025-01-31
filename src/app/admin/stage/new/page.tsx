"use client";

import { useRouter } from "next/navigation";
import StageEditor from "@/components/admin/StageEditor";
import { PipeState } from "@/lib/types";

export default function NewStagePage() {
  const router = useRouter();

  const handleSave = async (stageData: {
    name: string;
    width: number;
    height: number;
    pipes: PipeState[][];
  }) => {
    try {
      const response = await fetch("/api/stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stageData),
      });

      if (!response.ok) {
        throw new Error("Failed to create stage");
      }

      router.push("/admin");
    } catch (error) {
      console.error("Error creating stage:", error);
      alert("Failed to create stage. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Create New Stage</h1>
      <StageEditor onSave={handleSave} />
    </div>
  );
}
