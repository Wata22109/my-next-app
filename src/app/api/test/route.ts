import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const testStage = {
  name: "Tutorial Stage",
  width: 3,
  height: 3,
  pipes: [
    [
      { type: "start", direction: 0, isFixed: true },
      { type: "straight", direction: 90, isFixed: true },
      { type: "end", direction: 180, isFixed: true },
    ],
    [
      { type: "empty", direction: 0, isFixed: false },
      { type: "corner", direction: 0, isFixed: false },
      { type: "empty", direction: 0, isFixed: false },
    ],
    [
      { type: "empty", direction: 0, isFixed: false },
      { type: "straight", direction: 0, isFixed: false },
      { type: "empty", direction: 0, isFixed: false },
    ],
  ],
};

// POSTエンドポイントの例
export async function POST(request: Request) {
  try {
    const stage = await prisma.stage.create({
      data: testStage,
    });
    return NextResponse.json(stage);
  } catch (error) {
    console.error("Error creating stage:", error);
    return NextResponse.json(
      { error: "Failed to create stage" },
      { status: 500 }
    );
  }
}
