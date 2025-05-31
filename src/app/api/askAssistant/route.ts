import { askAssistant, updateVectorStoreFromJsonFile } from "@/lib/assistant";
import { isAdminSession, saveMessage } from "@/lib/sessions";
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
    const { question, sessionId, adminMessage } = await req.json();

    const isAdmin = isAdminSession(sessionId);

    if (adminMessage?.trim()) {
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
      saveMessage(sessionId, {
        from: "user",
        text: question,
        timestamp: new Date().toISOString(),
      });

      if (isAdmin) {
        return NextResponse.json(
          {
            error:
              "Адміністратор уже долучився до цієї сесії. Подальші відповіді від AI вимкнено.",
          },
          { status: 403, headers: corsHeaders }
        );
      }

      const answer = await askAssistant(question);

      saveMessage(sessionId, {
        from: "ai",
        text: answer,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ answer }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: "No valid question or admin message provided" },
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
