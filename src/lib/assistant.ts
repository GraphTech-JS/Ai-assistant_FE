import fs from "fs/promises";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { VectorStore } from "@langchain/core/vectorstores";
import { BaseRetriever } from "@langchain/core/retrievers";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

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

const conversationHistory: (HumanMessage | AIMessage)[] = [];

export async function askAssistant(question: string): Promise<string> {
  if (!vectorStore) {
    return "Knowledge base not initialized. Please save your data first.";
  }

  const retriever: BaseRetriever = vectorStore.asRetriever();

  const chain = ConversationalRetrievalQAChain.fromLLM(llm, retriever, {
    returnSourceDocuments: true,
  });

  const response = await chain.invoke({
    question,
    chat_history: conversationHistory,
  });

  const text = response.text?.trim() || "";

  const isUncertain =
    text === "" ||
    text.toLowerCase().includes("i don't know") ||
    text.toLowerCase().includes("не знаю");

  const hasSources =
    response.sourceDocuments && response.sourceDocuments.length > 0;

  if (!hasSources || isUncertain) {
    const fallbackResponse = await llm.invoke([
      ...conversationHistory,
      new HumanMessage(question),
    ]);

    const content =
      typeof fallbackResponse.content === "string"
        ? fallbackResponse.content
        : Array.isArray(fallbackResponse.content)
        ? fallbackResponse.content
            .map((c: any) => {
              if (typeof c === "string") return c;
              if (c && typeof c === "object") {
                if ("text" in c && typeof c.text === "string") return c.text;
                if ("image_url" in c && typeof c.image_url === "string")
                  return `[Image: ${c.image_url}]`;
              }
              return "";
            })
            .join(" ")
        : "";

    conversationHistory.push(new HumanMessage(question));
    conversationHistory.push(new AIMessage(content.trim()));

    return content.trim();
  }

  conversationHistory.push(new HumanMessage(question));
  conversationHistory.push(new AIMessage(text));

  return text;
}
