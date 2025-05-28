"use client";

import { ThemedText } from "@/components/ui/ThemedText";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";

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
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse p-4 border rounded bg-gray-100 shadow-sm"
          >
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-300 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <ThemedText type="title" className="mb-6 block text-[#4b2c78]">
        Список сесій
      </ThemedText>
      <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="border rounded-lg bg-white hover:bg-blue-50 transition-colors shadow-sm hover:shadow-md"
          >
            <Link
              href={`/admin/sessions/${session.id}`}
              className="block p-5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg h-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <FiMessageSquare className="text-blue-500 text-xl" />
                <ThemedText type="subtitle" className="text-[#4b2c78]">
                  {session.title}
                </ThemedText>
              </div>
              <ThemedText
                type="text_about"
                className="text-gray-600 text-sm line-clamp-2"
              >
                {session.lastMessage || "Немає повідомлень"}
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
