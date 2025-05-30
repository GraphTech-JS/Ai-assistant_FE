"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemedText } from "@/components/ui/ThemedText";
import { Button } from "@/components/ui/Button";

export default function SessionDetailPage() {
  const pathname = usePathname();
  const sessionId = pathname.split("/").pop();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("❌ Failed to fetch session messages", e);
    }
  }

  useEffect(() => {
    if (!sessionId) return;

    fetchMessages();

    const intervalId = setInterval(fetchMessages, 5000);

    return () => clearInterval(intervalId);
  }, [sessionId]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    const newMessage = {
      id: Date.now(),
      from: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      setLoading(true);
      await fetch("/api/askAssistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          question: userText,
        }),
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded p-4">
      <ThemedText type="title" className="mb-4">
        Session {sessionId}
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
          placeholder="Type your message here..."
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
          Send
        </Button>
      </div>
    </div>
  );
}
