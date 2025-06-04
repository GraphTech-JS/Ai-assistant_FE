import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "sessions.json");

function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }));
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  try {
    if (!fs.existsSync(filePath)) {
      return withCORS(NextResponse.json({ messages: [] }));
    }

    const file = await fs.promises.readFile(filePath, "utf-8");
    const data = JSON.parse(file);

    const messages = data[id] || [];

    return withCORS(NextResponse.json({ messages }));
  } catch (error) {
    console.error(error);
    return withCORS(
      NextResponse.json({ error: "Failed to load session" }, { status: 500 })
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
      return withCORS(
        NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
      );
    }

    let data: Record<string, unknown[]> = {};
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, "utf-8");
      data = JSON.parse(file);
    }

    data[id] = body.messages;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    return withCORS(NextResponse.json({ message: "Session saved" }));
  } catch (error) {
    console.error(error);
    return withCORS(
      NextResponse.json({ error: "Failed to save session" }, { status: 500 })
    );
  }
}
