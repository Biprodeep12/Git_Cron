import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import saveToManifest from "../utils/saveManifest.js";
import { ManifestEntry } from "../types/maniffest.js";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const AI_PROMPT = `
You are a senior software engineer AI agent.

Your task is to UPGRADE the provided source file into a FULLY FUNCTIONAL, PRODUCTION-READY implementation.

STRICT RULES:
- NO mock logic, NO placeholders, NO fake delays, NO dummy returns.
- The tool MUST perform real work using real APIs, SDKs, or system capabilities.
- You MAY add imports, helper functions, types, environment variables, and dependencies if required.
- You MUST keep the public function signature stable unless changing it is absolutely required for correctness.
- The code MUST be runnable and realistic in a real production environment.
- Error handling, input validation, and edge cases are REQUIRED.
- If an external API is needed, assume API keys are provided via environment variables and document them.
- Remove unnecessary comments, but KEEP essential documentation and JSDoc.
- Return ONLY valid JSON. No explanations. No markdown.

OUTPUT JSON FORMAT (MANDATORY):
{
  "updated_code": "FULL updated file content",
  "summary": "Concise summary of what changed and why",
  "next_steps": ["Concrete next improvements or integrations"]
}

If you detect a mock implementation, treating it as production-ready is a FAILURE.
`

function createToonPayload(entry: ManifestEntry, fileContent: string) {
  const nextStepsStr = (Array.isArray(entry.next_steps) 
    ? entry.next_steps 
    : [entry.next_steps]
  ).map(s => `"${s}"`).join(", ");

  return `
file "${entry.filePath}" {
    content: """
${fileContent}
    """
    summary: """
${entry.summary}
    """
    next_steps: [${nextStepsStr}]
    updated_at: "${entry.updated_at}"
}
`;
}

async function main() {
    const manifestPath = path.join(process.cwd(), "src/plan/manifest.json");
    let manifest: ManifestEntry[] = [];
    
    if (fs.existsSync(manifestPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
            manifest = Array.isArray(data) ? data : [];
        } catch (err) {
            console.error("Failed to parse manifest:", err instanceof Error ? err.message : String(err));
            process.exit(1);
        }
    }

    if (manifest.length === 0) {
        console.error("No manifest entries found");
        process.exit(1);
    }

    const data = manifest[0];

    const fullPath = path.join(process.cwd(), data.filePath);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const toonPayload = createToonPayload(data, fileContent);

    const response = await client.chat.completions.create({
        model: "mistralai/devstral-2512:free",
        messages: [
            {
                role: "system",
                content: AI_PROMPT
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
        let jsonString = aiContent;
        const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonString = jsonMatch[1];
        }
        parsed = JSON.parse(jsonString);
    } catch (err) {
        console.error("Could not parse AI response as JSON:\n", aiContent);
        process.exit(1);
    }

    const backupDir = path.join(process.cwd(), "src/backup");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, path.basename(data.filePath) + ".bak");
    fs.writeFileSync(backupPath, fileContent, "utf8");

    fs.writeFileSync(fullPath, parsed.updated_code, "utf8");

    await saveToManifest(data.filePath, parsed.summary, parsed.next_steps);

    console.log("File updated successfully!");
    console.log("Summary:", parsed.summary);
    console.log("Next steps:", parsed.next_steps.join(", "));
}

main().catch(console.error);
