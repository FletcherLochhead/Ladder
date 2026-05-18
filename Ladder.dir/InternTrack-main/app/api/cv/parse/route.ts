import { createRequire } from "module";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Import the core function directly to avoid pdf-parse running its own test
// suite on module load (which fails because the test PDF files don't exist).
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>;

export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { text } = await pdfParse(buffer);

  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 8000);

  return NextResponse.json({ text: cleaned });
}
