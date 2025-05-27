import { askAssistant, updateVectorStoreFromJsonFile } from "@/lib/assistant";
import { saveMessage } from "@/lib/sessions"; // імпортуєш функцію збереження
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await updateVectorStoreFromJsonFile();
    const { question, sessionId } = await req.json();

    if (!question || !sessionId) {
      return NextResponse.json(
        { error: "No question or sessionId provided" },
        { status: 400 }
      );
    }
    saveMessage(sessionId, {
      from: "user",
      text: question,
      timestamp: new Date().toISOString(),
    });

    const answer = await askAssistant(question);

    saveMessage(sessionId, {
      from: "ai",
      text: answer,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
