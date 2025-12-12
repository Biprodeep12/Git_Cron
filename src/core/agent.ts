import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import saveToManifest from "../utils/saveManifest.ts";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

function createToonPayload(filePath: string, fileContent: string) {
  return `
file "${filePath}" {
    content: """
${fileContent}
    """
}
`;
}

async function main() {
    const filePath = "src/tools/webSearch.ts";
    const fullPath = path.join(process.cwd(), filePath);

    const fileContent = fs.readFileSync(fullPath, "utf8");
    const toonPayload = createToonPayload(filePath, fileContent);

    const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [
        {
            role: "system",
            content:
            "You are an AI agent analyzing a source file in TOON format. Return ONLY JSON with keys: updated_code (full improved code), summary, next_steps. Keep functionality intact."
        },
        { role: "user", content: toonPayload }
        ],
    });

    const aiContent = response.choices[0].message.content;

    if (!aiContent) {
        console.error("AI response content is empty or null");
        process.exit(1);
    }

    let parsed: { updated_code: string; summary: string; next_steps: string[] };

    try {
        parsed = JSON.parse(aiContent);
    } catch (err) {
        console.error("Could not parse AI response as JSON:\n", aiContent);
        process.exit(1);
    }

    const backupDir = path.join(process.cwd(), "src/backup");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir,path.basename(filePath) + ".bak");

    fs.writeFileSync(backupPath, fileContent, "utf8");


    fs.writeFileSync(fullPath, parsed.updated_code, "utf8");

    await saveToManifest(filePath, parsed.summary, parsed.next_steps);

    console.log("File updated successfully!");
    console.log("Summary:", parsed.summary);
    console.log("Next steps:", parsed.next_steps.join(", "));
}

main().catch(console.error);
