import fs from "fs/promises";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { VectorStore } from "@langchain/core/vectorstores";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BaseRetriever } from "@langchain/core/retrievers";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,
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
    return "Базу знань ще не ініціалізовано. Спочатку завантажте ваші дані.";
  }

  const retriever: BaseRetriever = vectorStore.asRetriever({ k: 5 });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Ти — помічник інтернет-магазину товарів для шиття. Відповідай **тільки на основі наданого контексту** з бази знань. Якщо знайдено товари, що відповідають на запит користувача — поясни, чому вони корисні, і наведи їх опис, ціну, посилання тощо. Не вигадуй інформацію, якої немає в контексті. Якщо немає відповідних товарів або інформації — просто скажи: 'У базі знань немає відповідних товарів до вашого запиту'.",
    ],
    new MessagesPlaceholder("chat_history"),
    [
      "human",
      `Контекст:
{context}

Питання: {question}`,
    ],
  ]);

  const ragChain = RunnableSequence.from([
    async (input: { question: string; chat_history: any }) => {
      const contextDocs = await retriever.getRelevantDocuments(input.question);
      return {
        ...input,
        context: contextDocs.map((doc) => doc.pageContent).join("\n\n---\n\n"),
      };
    },
    prompt,
    llm,
  ]);

  conversationHistory.push(new HumanMessage(question));

  const response = await ragChain.invoke({
    question,
    chat_history: conversationHistory,
  });

  const text = response.content?.toString().trim() || "";

  const hasAnswer =
    text &&
    !text.toLowerCase().includes("не знаю") &&
    !text.toLowerCase().includes("на жаль") &&
    !text.toLowerCase().includes("не маю") &&
    text.length > 10;

  if (hasAnswer) {
    conversationHistory.push(new AIMessage(text));
    return text;
  }

  const fallbackResponse = await llm.invoke([
    ...conversationHistory,
    new HumanMessage(question),
  ]);

  const finalText =
    fallbackResponse.content?.toString().trim() ||
    "На жаль, не зміг знайти відповідь.";

  conversationHistory.push(new AIMessage(finalText));
  return finalText;
}
