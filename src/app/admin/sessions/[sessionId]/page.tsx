"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemedText } from "@/components/ui/ThemedText";
import { Button } from "@/components/ui/Button";

type Message = {
  id: number;
  from: "user" | "ai" | "admin";
  text: string;
};

export default function SessionDetailPage() {
  const pathname = usePathname();
  const sessionId = pathname.split("/").pop();

  const [adminMode, setAdminMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  async function fetchSession() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();

      const enriched =
        data.messages?.map((msg: Message, i: number) => ({
          id: Date.now() + i,
          from: msg.from,
          text: msg.text,
        })) || [];

      setMessages(enriched);
    } catch (err) {
      console.error("❌ Failed to load session:", err);
    }
  }

  useEffect(() => {
    if (!sessionId) return;

    fetchSession();

    const intervalId = setInterval(fetchSession, 5000);

    return () => clearInterval(intervalId);
  }, [sessionId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!adminMode) return;
    if (!input.trim()) return;

    const messageToSend = input.trim();

    setMessages((msgs) => [
      ...msgs,
      {
        id: Date.now(),
        from: "admin",
        text: messageToSend,
      },
    ]);
    setInput("");
    setLoading(true);

    try {
      await fetch("/api/askAssistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin: adminMode,
          adminMessage: messageToSend,
          sessionId,
        }),
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + 1,
          from: "admin",
          text: "Сталася помилка.",
        },
      ]);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl p-6 shadow-md">
      <ThemedText type="title" className="mb-4 text-[#4b2c78]">
        Session #{sessionId}
      </ThemedText>

      <div className="mb-4">
        <Button
          variant={adminMode ? "secondary" : "primary"}
          onClick={() => setAdminMode(!adminMode)}
          className="mb-2"
        >
          {adminMode ? "Exit admin mode" : "Activate admin mode"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto mb-4 space-y-3 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[110%] rounded-xl p-4 text-sm whitespace-pre-wrap break-words transition-all
              ${
                msg.from === "user"
                  ? "bg-[#4b2c78] text-white self-start rounded-bl-none"
                  : msg.from === "admin"
                  ? "bg-[#ffcc00] text-black self-end rounded-br-none"
                  : "bg-[#eaeaea] text-gray-800 self-end rounded-br-none"
              }`}
          >
            {msg.text}
          </div>
        ))}

        <div ref={endOfMessagesRef} />
      </div>

      {adminMode && (
        <div className="border-t pt-4 mt-auto">
          <div className="flex flex-col lg:flex-row gap-3">
            <textarea
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 p-3 resize-none
                         focus:outline-none focus:ring-2 focus:ring-[#4b2c78] shadow-sm transition"
              rows={3}
              autoFocus
            />
            <Button
              onClick={sendMessage}
              variant="primary"
              size="medium"
              loading={loading}
              className="lg:min-w-[120px] self-end"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Розкажи про матрицю під зааклепку намистину
// Чим би ти порадив мені почистити швейну машинку?
