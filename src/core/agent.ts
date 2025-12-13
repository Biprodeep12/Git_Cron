import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import saveToManifest from "../utils/saveManifest.ts";
import { ManifestEntry } from "../types/maniffest.ts";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

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
            manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
            if (!Array.isArray(manifest)) manifest = [];
        } catch (err) {
            console.warn("Failed to parse manifest, starting fresh");
            manifest = [];
        }
    }

    if (manifest.length === 0) {
        console.error("No manifest entries found");
        process.exit(1);
    }

    const fullPath = path.join(process.cwd(), manifest[0].filePath);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const toonPayload = createToonPayload(manifest[0], fileContent);

    const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b:free",
        messages: [
            {
                role: "system",
                content: "You are an AI agent analyzing a source file in TOON format. Return ONLY JSON with keys: updated_code (full improved code with unnecessary comments removed), summary, next_steps. Keep functionality intact. Remove any redundant or obvious comments while preserving important documentation."
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

    const backupPath = path.join(backupDir, path.basename(manifest[0].filePath) + ".bak");
    fs.writeFileSync(backupPath, fileContent, "utf8");

    fs.writeFileSync(fullPath, parsed.updated_code, "utf8");

    await saveToManifest(manifest[0].filePath, parsed.summary, parsed.next_steps, 0);

    console.log("File updated successfully!");
    console.log("Summary:", parsed.summary);
    console.log("Next steps:", parsed.next_steps.join(", "));
}

main().catch(console.error);
