"use client";

import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";
import { useState } from "react";

export default function KnowledgePage() {
  const [content, setContent] = useState("");

  function saveKnowledge() {
    alert("База знань збережена!");
  }

  return (
    <div>
      <ThemedText type="title" className="mb-4 block text-[#4b2c78]">
        Редактор бази знань
      </ThemedText>

      <textarea
        className="w-full h-[400px] p-4 border border-gray-300 rounded resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Введіть базу знань або промпти AI"
      />

      <Button
        onClick={saveKnowledge}
        variant="primary"
        size="medium"
        className="mt-4"
      >
        Зберегти
      </Button>
    </div>
  );
}
