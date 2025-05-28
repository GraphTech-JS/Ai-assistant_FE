import { askAssistant, updateVectorStoreFromJsonFile } from "@/lib/assistant";
import { saveMessage } from "@/lib/sessions";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await updateVectorStoreFromJsonFile();
    const { question, sessionId } = await req.json();

    if (!question || !sessionId) {
      return NextResponse.json(
        { error: "No question or sessionId provided" },
        { status: 400, headers: corsHeaders }
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

    return NextResponse.json({ answer }, { headers: corsHeaders });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
