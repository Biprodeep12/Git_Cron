import fs from "fs";
import path from "path";
import { ManifestEntry } from "../types/maniffest.js";

async function saveToManifest(
  filePath: string,
  summary: string,
  next_steps: string[],
  fileNo: number
) {
  const manifestPath = path.join(process.cwd(), "src/plan/manifest.json");

  const planDir = path.join(process.cwd(), "src/plan");
  if (!fs.existsSync(planDir)) {
    fs.mkdirSync(planDir, { recursive: true });
  }

  let manifest: ManifestEntry[] = [];
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      if (!Array.isArray(manifest)) manifest = [];
    } catch {
      manifest = [];
    }
  }

  manifest[0]={
    filePath,
    summary,
    next_steps,
    updated_at: new Date().toISOString(),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
}

export default saveToManifest;