import fs from "fs";
import path from "path";
import { ManifestEntry } from "../types/maniffest.js";

async function saveToManifest(
  filePath: string,
  summary: string,
  next_steps: string[],
): Promise<void> {
  const manifestPath = path.join(process.cwd(), "src/plan/manifest.json");
  const planDir = path.join(process.cwd(), "src/plan");

  if (!fs.existsSync(planDir)) {
    fs.mkdirSync(planDir, { recursive: true });
  }

  let manifest: ManifestEntry[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifest = Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn(`Failed to read manifest: ${err instanceof Error ? err.message : String(err)}`);
      manifest = [];
    }
  }

  const newEntry: ManifestEntry = {
    filePath,
    summary,
    next_steps: Array.isArray(next_steps) ? next_steps : [next_steps],
    updated_at: new Date().toISOString(),
  };

  // Find and update existing entry or append new one
  const existingIndex = manifest.findIndex((entry) => entry.filePath === filePath);
  if (existingIndex >= 0) {
    manifest[existingIndex] = newEntry;
  } else {
    manifest.push(newEntry);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

export default saveToManifest;