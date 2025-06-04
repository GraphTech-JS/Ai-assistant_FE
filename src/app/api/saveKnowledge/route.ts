import fs from "fs/promises";
import path from "path";
import { updateVectorStoreFromJsonFile } from "@/lib/assistant";

export async function POST(req: Request) {
  const { documents } = await req.json();

  const filePath = path.join(process.cwd(), "public/data/knowledge.json");

  await fs.writeFile(filePath, JSON.stringify(documents, null, 2), "utf-8");

  await updateVectorStoreFromJsonFile();

  return Response.json({ message: "Збережено й оновлено векторну базу" });
}
