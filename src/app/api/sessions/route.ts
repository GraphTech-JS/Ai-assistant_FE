import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "sessions.json");

export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ sessions: [] });
    }

    const file = fs.readFileSync(filePath, "utf-8");
    const data: Record<
      string,
      { from: string; text: string; timestamp: string }[]
    > = JSON.parse(file);

    const sessions = Object.entries(data).map(([id, messages]) => {
      const firstUserMessage = messages.find((msg) => msg.from === "user");
      const lastMessage = messages[messages.length - 1];

      return {
        id,
        title: firstUserMessage?.text || "Session",
        lastMessage: lastMessage?.text || "",
      };
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("❌ Failed to read sessions:", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}
