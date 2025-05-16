"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ThemedText } from "@/components/ui/ThemedText";
import { Button } from "@/components/ui/Button";

const mockMessages = [
  { id: 1, from: "user", text: "Привіт!" },
  { id: 2, from: "ai", text: "Вітаю! Чим можу допомогти?" },
];

export default function SessionDetailPage() {
  const pathname = usePathname();
  const sessionId = pathname.split("/").pop();

  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { id: Date.now(), from: "user", text: input },
    ]);
    setInput("");
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
      </div>

      <div className="flex gap-2">
        <textarea
          placeholder="Напишіть повідомлення"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border border-gray-300 p-2 resize-none
                     focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          rows={3}
        />
        <Button onClick={sendMessage} variant="primary" size="medium">
          Відправити
        </Button>
      </div>
    </div>
  );
}
