import { writeFile } from "node:fs/promises";

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured.");
}

const config = `window.APP_CONFIG = ${JSON.stringify({ supabaseUrl, supabaseAnonKey })};\n`;
await writeFile(new URL("./config.js", import.meta.url), config, "utf8");
