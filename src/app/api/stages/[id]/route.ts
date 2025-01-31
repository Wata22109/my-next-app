import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stageId = parseInt(params.id);
    if (isNaN(stageId)) {
      return NextResponse.json({ error: "Invalid stage ID" }, { status: 400 });
    }

    const stage = await prisma.stage.findUnique({
      where: {
        id: stageId,
      },
    });

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    return NextResponse.json(stage);
  } catch (error) {
    console.error("Error fetching stage:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const stage = await prisma.stage.update({
      where: {
        id: parseInt(params.id),
      },
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
      { error: "Failed to update stage" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.stage.delete({
      where: {
        id: parseInt(params.id),
      },
    });
    return NextResponse.json({ message: "Stage deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Failed to delete stage" },
      { status: 500 }
    );
  }
}
