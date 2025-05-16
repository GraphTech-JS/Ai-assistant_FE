"use client";

import { ThemedText } from "@/components/ui/ThemedText";
import Link from "next/link";
import { useState } from "react";

const mockSessions = [
  { id: "1", title: "Сесія #1", lastMessage: "Привіт, як справи?" },
  { id: "2", title: "Сесія #2", lastMessage: "Як працює AI?" },
];

export default function SessionsPage() {
  const [sessions] = useState(mockSessions);

  return (
    <div>
      <ThemedText type="title" className="mb-4 block text-[#4b2c78]">
        Список сесій
      </ThemedText>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="p-4 border rounded bg-white hover:bg-blue-50 cursor-pointer
                     shadow-sm hover:shadow-md
                     transition-shadow duration-300 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            tabIndex={0}
          >
            <Link href={`/admin/sessions/${session.id}`}>
              <ThemedText type="subtitle" className="text-[#4b2c78] mr-[10px]">
                {session.title}
              </ThemedText>
              <ThemedText
                type="text_about"
                className="text-gray-600 text-sm truncate"
              >
                {session.lastMessage}
              </ThemedText>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
