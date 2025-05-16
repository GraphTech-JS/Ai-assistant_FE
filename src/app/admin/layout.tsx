"use client";

import { ThemedText } from "@/components/ui/ThemedText";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    if (!loggedIn) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) return null;

  return (
    <>
      <div className="flex h-screen">
        <aside className="w-64 bg-[#4b2c78] text-white flex flex-col p-6 h-full">
          <ThemedText
            type="title"
            className="mb-6 tracking-wide select-none text-white"
          >
            AI Admin
          </ThemedText>
          <nav className="flex flex-col gap-3">
            <Link
              href="/admin/knowledge"
              className="px-4 py-3 rounded-md hover: transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:"
            >
              <ThemedText type="subtitle" className="text-white">
                База знань
              </ThemedText>
            </Link>
            <Link
              href="/admin/sessions"
              className="px-4 py-3 rounded-md  transition-all duration-300 ease-in-out focus:outline-none focus:ring-2"
            >
              <ThemedText type="subtitle" className="text-white">
                Сесії
              </ThemedText>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-fuchsia-100 min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
