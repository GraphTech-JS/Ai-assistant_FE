"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionsPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch("/api/createSession", {
          method: "POST",
        });
        if (!res.ok) throw new Error("Помилка створення сесії");
        const data = await res.json();
        router.push(`/user/sessions/${data.sessionId}`);
      } catch (err) {
        setError("Не вдалося створити сесію");
        console.error(err);
      }
    }

    createSession();
  }, [router]);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return null;
}
