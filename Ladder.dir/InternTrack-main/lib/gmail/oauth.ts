import crypto from "node:crypto";

import { google, type gmail_v1 } from "googleapis";

import type { EmailInput } from "@/lib/gmail/parser";

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.GMAIL_TOKEN_ENC_KEY;
  if (!raw) throw new Error("GMAIL_TOKEN_ENC_KEY missing");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("GMAIL_TOKEN_ENC_KEY must decode to 32 bytes (base64)");
  }
  return buf;
}

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptToken(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

export function buildOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI,
  );
}

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

export async function fetchRecentMessages(opts: {
  encryptedRefreshToken: string;
  maxResults?: number;
}): Promise<EmailInput[]> {
  const oauth2 = buildOAuth2Client();
  oauth2.setCredentials({
    refresh_token: decryptToken(opts.encryptedRefreshToken),
  });
  const gmail = google.gmail({ version: "v1", auth: oauth2 });

  const list = await gmail.users.messages.list({
    userId: "me",
    maxResults: opts.maxResults ?? 60,
    q: "newer_than:90d",
  });
  const ids = (list.data.messages ?? []).map((m) => m.id!).filter(Boolean);

  const msgs = await Promise.all(
    ids.map((id) =>
      gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      }),
    ),
  );

  // Hydrate body via separate fetch for messages that look application-shaped.
  const results: EmailInput[] = [];
  for (const m of msgs) {
    const id = m.data.id!;
    const headers = mapHeaders(m.data.payload?.headers ?? []);
    const subject = headers.subject ?? "";
    const from = headers.from ?? "";
    const snippet = m.data.snippet ?? "";
    const dateStr = headers.date ?? "";
    const received = isoOrNow(dateStr);
    if (!looksApplication(subject, from, snippet)) continue;

    // Fetch full body
    const full = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });
    const body = extractTextBody(full.data.payload).slice(0, 4000);

    results.push({
      gmail_message_id: id,
      from,
      subject,
      body,
      received_at: received,
    });
  }
  return results;
}

function mapHeaders(headers: gmail_v1.Schema$MessagePartHeader[]) {
  const out: Record<string, string> = {};
  for (const h of headers) {
    if (h.name && h.value) out[h.name.toLowerCase()] = h.value;
  }
  return out;
}

function isoOrNow(dateStr: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function looksApplication(
  subject: string,
  from: string,
  snippet: string,
): boolean {
  const hay = `${subject} ${from} ${snippet}`.toLowerCase();
  const positive = [
    "applied",
    "application",
    "assessment",
    "careers",
    "career",
    "challenge",
    "graduate",
    "intern",
    "internship",
    "interview",
    "offer",
    "rejected",
    "screening",
    "schedule",
    "phone screen",
    "take-home",
    "thank you for applying",
    "unfortunately",
    "we received",
    "next step",
    "next steps",
    "not move forward",
    "hiring",
    "talent",
    "recruit",
    "greenhouse",
    "workable",
    "lever",
    "ashby",
  ];
  return positive.some((p) => hay.includes(p));
}

function extractTextBody(part?: gmail_v1.Schema$MessagePart): string {
  if (!part) return "";
  if (part.mimeType === "text/plain" && part.body?.data) {
    return decode(part.body.data);
  }
  if (part.mimeType === "text/html" && part.body?.data) {
    return stripHtml(decode(part.body.data));
  }
  if (part.parts && part.parts.length) {
    // Prefer text/plain; fall back to first
    const plain = part.parts.find((p) => p.mimeType === "text/plain");
    if (plain) return extractTextBody(plain);
    const html = part.parts.find((p) => p.mimeType === "text/html");
    if (html) return extractTextBody(html);
    return extractTextBody(part.parts[0]);
  }
  if (part.body?.data) return decode(part.body.data);
  return "";
}

function decode(b64url: string): string {
  return Buffer.from(b64url.replace(/-/g, "+").replace(/_/g, "/"), "base64")
    .toString("utf8");
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
