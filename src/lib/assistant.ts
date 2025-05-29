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
    return "Базу знань ще не ініціалізовано. Спочатку завантажте ваші дані.";
  }

  const retriever: BaseRetriever = vectorStore.asRetriever({
    k: 3,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(llm, retriever, {
    returnSourceDocuments: true,
    qaTemplate:
      `Ти асистент на сайті з готелем. Відповідай **тільки** на основі наданої контекстної інформації.
Якщо відповіді немає в контексті — **не вигадуй**, а скажи, що не маєш такої інформації.

Контекст:
{context}

Питання: {question}
Відповідь українською мовою:`.trim(),
  });

  const response = await chain.invoke({
    question,
    chat_history: conversationHistory,
  });

  const text = response.text?.trim() || "";

  const hasAnswer =
    text &&
    !text.toLowerCase().includes("не знаю") &&
    !text.toLowerCase().includes("на жаль") &&
    !text.toLowerCase().includes("не маю") &&
    text.length > 10;

  if (!hasAnswer) {
    const fallback =
      "Вибачте, я не маю такої інформації. Спробуй поставити інше запитання або звернись до адміністратора.";

    conversationHistory.push(new HumanMessage(question));
    conversationHistory.push(new AIMessage(fallback));

    return fallback;
  }

  conversationHistory.push(new HumanMessage(question));
  conversationHistory.push(new AIMessage(text));

  return text;
}
