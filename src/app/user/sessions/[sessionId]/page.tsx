"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemedText } from "@/components/ui/ThemedText";
import { Button } from "@/components/ui/Button";

export default function SessionDetailPage() {
  const pathname = usePathname();
  const sessionId = pathname.split("/").pop();

  const [messages, setMessages] = useState([
    { id: 1, from: "user", text: "Привіт!" },
    { id: 2, from: "ai", text: "Вітаю! Чим можу допомогти?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({
          sessionId,
          question: userText,
        }),
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
      console.log(err);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded p-4">
      <ThemedText type="title" className="mb-4">
        Сесія {sessionId}
      </ThemedText>

      <div className="flex-1 overflow-auto mb-4 space-y-3 flex flex-col">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`p-3 rounded-[15px] max-w-[500px] break-words
              ${
                msg.from === "user"
                  ? "bg-[#4b2c78] self-start text-left text-white"
                  : "bg-[#782c59] self-end text-right"
              }
              animate-fadeIn`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <ThemedText type="text" className="whitespace-pre-wrap">
              {msg.text}
            </ThemedText>
          </div>
        ))}
        {loading && (
          <div className="self-end text-right text-gray-500 italic">
            Thinking...
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <textarea
          placeholder="Напишіть повідомлення"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border border-gray-300 p-2 resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          rows={3}
        />
        <Button
          onClick={sendMessage}
          variant="primary"
          size="medium"
          loading={loading}
        >
          Відправити
        </Button>
      </div>
    </div>
  );
}
