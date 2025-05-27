"use client";

import { ThemedText } from "@/components/ui/ThemedText";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Session {
  id: string;
  title: string;
  lastMessage: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch sessions:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ThemedText type="text">Завантаження...</ThemedText>;
  }

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
        {sessions.length === 0 && (
          <li>
            <ThemedText type="text">Сесій ще немає.</ThemedText>
          </li>
        )}
      </ul>
    </div>
  );
}
