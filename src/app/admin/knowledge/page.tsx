"use client";

import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Button } from "@/components/ui/Button";
import { ThemedText } from "@/components/ui/ThemedText";

type DocItem = {
  pageContent: string;
  metadata: {
    category: string;
    language: string;
    id: string;
  };
};

export default function KnowledgePage() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data/knowledge.json");
        if (!res.ok) throw new Error("Не вдалося завантажити файл");

        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error("Помилка завантаження knowledge.json:", err);
      }
    };

    fetchData();
  }, []);

  const [documents, setDocuments] = useState<DocItem[]>([
    {
      pageContent: "",
      metadata: { category: "", language: "en", id: "" },
    },
  ]);

  const handleChange = (
    index: number,
    field: keyof DocItem | keyof DocItem["metadata"],
    value: string
  ) => {
    setDocuments((prev) =>
      prev.map((doc, i) => {
        if (i !== index) return doc;
        if (field === "pageContent") {
          return { ...doc, pageContent: value };
        } else {
          return {
            ...doc,
            metadata: { ...doc.metadata, [field]: value },
          };
        }
      })
    );
  };

  const addDocument = () => {
    setDocuments((prev) => [
      ...prev,
      {
        pageContent: "",
        metadata: { category: "", language: "en", id: "" },
      },
    ]);
  };

  const deleteDocument = async (index: number) => {
    const confirmDelete = confirm(
      "Ви впевнені, що хочете видалити цей документ?"
    );
    if (!confirmDelete) return;

    const updatedDocs = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocs);
    const res = await fetch("/api/saveKnowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents: updatedDocs }),
    });

    if (!res.ok) {
      alert("Помилка при оновленні бази знань після видалення.");
    }
  };

  const saveKnowledge = async () => {
    const res = await fetch("/api/saveKnowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents }),
    });

    if (res.ok) {
      alert("База знань збережена!");
      const updated = await fetch("/data/knowledge.json", {
        cache: "no-store",
      });
      const data = await updated.json();
      setDocuments(data);
    } else {
      alert("Помилка збереження!");
    }
  };

  return (
    <div>
      <ThemedText type="title" className="mb-4 block text-[#4b2c78]">
        Редактор бази знань
      </ThemedText>

      {documents.map((doc, index) => (
        <div
          key={index}
          className="border border-gray-300 p-4 mb-6 rounded bg-gray-100 shadow-sm relative"
        >
          <IoMdClose
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => deleteDocument(index)}
          />
          <label className="block mb-1 font-semibold">Page Content</label>
          <textarea
            className="w-full h-32 p-2 mb-4 border rounded"
            value={doc.pageContent}
            onChange={(e) => handleChange(index, "pageContent", e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Category</label>
              <input
                className="w-full p-2 border rounded"
                value={doc.metadata.category}
                onChange={(e) =>
                  handleChange(index, "category", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Language</label>
              <input
                className="w-full p-2 border rounded"
                value={doc.metadata.language}
                onChange={(e) =>
                  handleChange(index, "language", e.target.value)
                }
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">ID</label>
              <input
                className="w-full p-2 border rounded"
                value={doc.metadata.id}
                onChange={(e) => handleChange(index, "id", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4 items-center justify-center">
        <Button onClick={addDocument}>+ Додати новий запис</Button>
        <Button onClick={saveKnowledge} variant="primary">
          Зберегти базу знань
        </Button>
      </div>
    </div>
  );
}
