import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Prisma client:", prisma); // デバッグ用
    if (!prisma) {
      throw new Error("Prisma client is not initialized");
    }

    console.log("Attempting to fetch stages...");
    const stages = await prisma.stage.findMany({
      orderBy: {
        id: "asc",
      },
    });

    console.log("Fetched stages:", stages);
    return NextResponse.json(stages);
  } catch (error) {
    console.error("Database error details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch stages",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stage = await prisma.stage.create({
      data: {
        name: body.name,
        width: body.width,
        height: body.height,
        pipes: body.pipes,
      },
    });
    return NextResponse.json(stage);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to create stage" },
      { status: 500 }
    );
  }
}
