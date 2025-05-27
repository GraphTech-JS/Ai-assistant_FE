import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "sessions.json");

export function saveMessage(sessionId: string, message: unknown) {
  let data: Record<string, unknown[]> = {};
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(file);
  }
  if (!data[sessionId]) {
    data[sessionId] = [];
  }

  data[sessionId].push(message);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
