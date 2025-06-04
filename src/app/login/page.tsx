"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemedText } from "@/components/ui/ThemedText";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (email === "Admin@test.com" && password === "Admin123#") {
      localStorage.setItem("isAdminLoggedIn", "true");
      router.push("/admin");
    } else if (email === "user@test.com" && password === "user123#") {
      router.push("/user");
    } else {
      setError("Невірний email або пароль");
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="bg-[#41327e]  shadow-lg max-w-[500px] w-full p-8  text-center text-gray-900 flex flex-col justify-center">
        <div className="space-y-[20px] rounded-lg bg-[#373175] px-[30px] py-[100px]">
          <div className="flex justify-center">
            <LockClosedIcon className="w-10 h-10 text-[#5c4c96]" />
          </div>
          <ThemedText type="title">Sign in</ThemedText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-5 text-left mt-[20px]"
          >
            <label className="relative block">
              <EnvelopeIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address *"
                required
                className="pl-10"
                error={error ? " " : undefined}
              />
            </label>

            <label className="relative block">
              <LockClosedIcon className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password *"
                required
                className="pl-10"
                error={error || undefined}
              />
            </label>

            {error && (
              <ThemedText
                type="text"
                className="text-red-600 text-center font-semibold"
              >
                {error}
              </ThemedText>
            )}

            <Button
              type="submit"
              variant="primary"
              size="small"
              className="w-full rounded-full"
            >
              <ThemedText type="text_button">SIGN IN</ThemedText>
            </Button>
          </form>
        </div>
      </div>

      <div
        className="hidden md:flex flex-1 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1470&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-indigo-900 to-purple-900 opacity-80" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-16">
          <ThemedText type="title" className="mb-4 text-center">
            Ласкаво просимо!
          </ThemedText>
        </div>
      </div>
    </div>
  );
}
