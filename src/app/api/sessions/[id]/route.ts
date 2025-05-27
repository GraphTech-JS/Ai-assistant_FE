// src/app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "sessions.json");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ messages: [] });
    }

    const file = await fs.promises.readFile(filePath, "utf-8"); // Use async for better performance
    const data = JSON.parse(file);

    const messages = data[id] || [];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    const body = await req.json();

    if (!Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    let data: Record<string, unknown[]> = {};
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, "utf-8");
      data = JSON.parse(file);
    }

    data[id] = body.messages;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ message: "Session saved" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}
