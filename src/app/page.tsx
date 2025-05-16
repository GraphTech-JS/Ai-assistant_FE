"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    if (loggedIn) {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
