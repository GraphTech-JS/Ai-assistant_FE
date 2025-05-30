"use client";

import { ThemedText } from "@/components/ui/ThemedText";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <aside
          className={`fixed top-0 left-0 h-full w-68 bg-[#4b2c78] text-white flex flex-col p-6 transition-transform duration-300 ease-in-out
          ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static md:flex`}
        >
          <ThemedText
            type="title"
            className="mb-6 tracking-wide select-none text-white"
          >
            AI Admin
          </ThemedText>
          <nav className="flex flex-col gap-3">
            <Link
              href="/admin/knowledge"
              className="px-4 py-3 rounded-md hover:bg-purple-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2"
              onClick={() => setIsMenuOpen(false)} // закрыть меню на моб при клике
            >
              <ThemedText type="subtitle" className="text-white">
                Knowledge Base
              </ThemedText>
            </Link>
            <Link
              href="/admin/sessions"
              className="px-4 py-3 rounded-md hover:bg-purple-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <ThemedText type="subtitle" className="text-white">
                Sessions
              </ThemedText>
            </Link>
            <button
              className={`fixed top-4 left-[250px] md:hidden p-2  bg-[#4b2c78] text-white transition-transform duration-300 ${
                isMenuOpen ? "rotate-180 rounded-l-[10px]" : "rounded-r-[10px]"
              }`}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              type="button"
            >
              <FaArrowRight />
            </button>
          </nav>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 p-8 bg-fuchsia-100 min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}
