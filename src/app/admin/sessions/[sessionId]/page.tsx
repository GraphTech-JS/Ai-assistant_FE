"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemedText } from "@/components/ui/ThemedText";
import { Button } from "@/components/ui/Button";

type Message = {
  id: number;
  from: "user" | "ai";
  text: string;
};

export default function SessionDetailPage() {
  const pathname = usePathname();
  const sessionId = pathname.split("/").pop();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setMessages((msgs) => [
      ...msgs,
      { id: Date.now(), from: "user", text: userText },
    ]);
    setInput("");

    try {
      setLoading(true);
      const res = await fetch("/api/askAssistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userText, sessionId }),
      });

      const data = await res.json();
      setLoading(false);

      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now() + 1,
          from: "ai",
          text: data.answer || "Помилка відповіді.",
        },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { id: Date.now() + 1, from: "ai", text: "Сталася помилка." },
      ]);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl p-6 shadow-md">
      <ThemedText type="title" className="mb-4 text-[#4b2c78]">
        Сесія #{sessionId}
      </ThemedText>

      <div className="flex-1 overflow-auto mb-4 space-y-3 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[110%] rounded-xl p-4 text-sm whitespace-pre-wrap break-words transition-all
              ${
                msg.from === "user"
                  ? "bg-[#4b2c78] text-white self-start rounded-bl-none"
                  : "bg-[#eaeaea] text-gray-800 self-end rounded-br-none"
              }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="self-end bg-gray-200 px-4 py-2 rounded-lg text-sm italic text-gray-500">
            Асистент думає...
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      <div className="border-t pt-4 mt-auto">
        <div className="flex flex-col lg:flex-row gap-3">
          <textarea
            placeholder="Напишіть повідомлення..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 p-3 resize-none
                       focus:outline-none focus:ring-2 focus:ring-[#4b2c78] shadow-sm transition"
            rows={3}
          />
          <Button
            onClick={sendMessage}
            variant="primary"
            size="medium"
            loading={loading}
            className="lg:min-w-[120px] self-end"
          >
            Відправити
          </Button>
        </div>
      </div>
    </div>
  );
}
