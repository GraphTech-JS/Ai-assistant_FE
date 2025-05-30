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

const admin = true; // control access to admin functionality
// Set to false if you want to disable admin functionality
// Set to true if you want to enable admin functionality

export async function POST(req: NextRequest) {
  try {
    await updateVectorStoreFromJsonFile();
    const { question, sessionId, adminMessage } = await req.json();

    if (question?.trim()) {
      saveMessage(sessionId, {
        from: "user",
        text: question,
        timestamp: new Date().toISOString(),
      });
    }

    if (admin === true) {
      if (!adminMessage?.trim()) {
        return NextResponse.json(
          { error: "No adminMessage provided" },
          { status: 400, headers: corsHeaders }
        );
      }

      saveMessage(sessionId, {
        from: "admin",
        text: adminMessage,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { answer: adminMessage },
        { headers: corsHeaders }
      );
    }

    if (question?.trim()) {
      const answer = await askAssistant(question);

      saveMessage(sessionId, {
        from: "ai",
        text: answer,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ answer }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: "No valid question provided" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
