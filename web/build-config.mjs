import { writeFile } from "node:fs/promises";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseApiKey = process.env.SUPABASE_API_KEY?.trim();

if (!supabaseUrl || !supabaseApiKey) {
  throw new Error("SUPABASE_URL and SUPABASE_API_KEY must be configured.");
}

const config = `window.APP_CONFIG = ${JSON.stringify({ supabaseUrl, supabaseApiKey })};\n`;
await writeFile(new URL("./config.js", import.meta.url), config, "utf8");
