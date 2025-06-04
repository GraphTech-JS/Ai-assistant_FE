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
      "Are you sure you want to delete this document? This action cannot be undone."
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
      alert("Error updating knowledge base after deletion.");
    }
  };

  const saveKnowledge = async () => {
    const res = await fetch("/api/saveKnowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documents }),
    });

    if (res.ok) {
      alert("Knowledge base saved!");
      const updated = await fetch("/data/knowledge.json", {
        cache: "no-store",
      });
      const data = await updated.json();
      setDocuments(data);
    } else {
      alert("Error saving knowledge base!");
    }
  };

  return (
    <div>
      <ThemedText
        type="title"
        className="mb-6 ml-3 text-3xl font-bold text-[#4b2c78]"
      >
        Knowledge Base Editor
      </ThemedText>

      {documents.map((doc, index) => (
        <div
          key={index}
          className="relative mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <IoMdClose
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer text-xl transition-colors"
            onClick={() => deleteDocument(index)}
          />

          <label className="block mb-2 font-medium text-gray-800">
            Page Content
          </label>
          <textarea
            className="w-full h-32 resize-none rounded-lg border border-gray-300 p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
            value={doc.pageContent}
            onChange={(e) => handleChange(index, "pageContent", e.target.value)}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                value={doc.metadata.category}
                onChange={(e) =>
                  handleChange(index, "category", e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Language
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                value={doc.metadata.language}
                onChange={(e) =>
                  handleChange(index, "language", e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                ID
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition-all"
                value={doc.metadata.id}
                onChange={(e) => handleChange(index, "id", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <Button
          onClick={addDocument}
          className="bg-vilet-400 text-violet-600 border border-violet-400 hover:bg-violet-50 transition-all shadow-sm"
        >
          ➕ Add
        </Button>
        <Button
          onClick={saveKnowledge}
          variant="primary"
          className="bg-violet-600 hover:bg-violet-700 text-white shadow-md"
        >
          💾 Save
        </Button>
      </div>
    </div>
  );
}
