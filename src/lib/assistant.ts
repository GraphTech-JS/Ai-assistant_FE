import fs from "fs/promises";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { RetrievalQAChain } from "langchain/chains";
import { VectorStore } from "@langchain/core/vectorstores";
import { BaseRetriever } from "@langchain/core/retrievers";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  model: "text-embedding-3-small",
});

let vectorStore: VectorStore | null = null;

export async function updateVectorStoreFromJsonFile(): Promise<void> {
  const filePath = path.join(process.cwd(), "public/data/knowledge.json");

  const jsonData = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(jsonData);

  type KnowledgeItem = {
    pageContent: string;
    metadata: Record<string, unknown>;
  };

  const docs: Document[] = parsed.map(
    (item: KnowledgeItem) =>
      new Document({
        pageContent: item.pageContent,
        metadata: item.metadata,
      })
  );

  vectorStore = await Chroma.fromDocuments(docs, embeddings, {
    collectionName: "hotel-knowledge-base",
    url: "http://localhost:8000",
  });
}

export async function askAssistant(question: string): Promise<string> {
  if (!vectorStore) {
    return "Knowledge base not initialized. Please save your data first.";
  }

  const retriever: BaseRetriever = vectorStore.asRetriever();

  const chain = RetrievalQAChain.fromLLM(llm, retriever, {
    returnSourceDocuments: true,
  });

  const response = await chain.invoke({ query: question });

  const hasSources =
    response.sourceDocuments && response.sourceDocuments.length > 0;
  const text = response.text ? response.text.trim() : "";

  if (
    !hasSources ||
    text === "" ||
    text.toLowerCase().includes("i don't know")
  ) {
    return "На жаль, не знайшов відповіді у базі знань.";
  }

  return text;
}
