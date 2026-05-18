import { generateObject } from "ai";
import { z } from "zod";

import {
  PARSE_EMAIL_SYSTEM,
  buildParseEmailUser,
} from "@/lib/ai/prompts";
import { DEFAULT_MODEL, openrouter } from "@/lib/ai/openrouter";
import { APPLICATION_STAGES, type ApplicationStage } from "@/lib/types";

export type EmailInput = {
  gmail_message_id: string;
  from: string;
  subject: string;
  body: string;
  received_at: string; // ISO
};

export type ParsedEmail = {
  is_application_related: boolean;
  company: string | null;
  role: string | null;
  stage: ApplicationStage | null;
  applied_date: string | null;
  summary: string | null;
};

const ParsedEmailSchema = z.object({
  is_application_related: z.boolean(),
  company: z.string().nullable(),
  role: z.string().nullable(),
  stage: z
    .enum(APPLICATION_STAGES as unknown as [ApplicationStage, ...ApplicationStage[]])
    .nullable(),
  applied_date: z.string().nullable(),
  summary: z.string().nullable(),
});

export async function parseEmail(email: EmailInput): Promise<ParsedEmail> {
  const fallback = heuristicParseEmail(email);
  try {
    const { object } = await generateObject({
      model: openrouter.chat(DEFAULT_MODEL),
      schema: ParsedEmailSchema,
      system: PARSE_EMAIL_SYSTEM,
      prompt: buildParseEmailUser({
        subject: email.subject,
        body: email.body,
        from: email.from,
        receivedAt: email.received_at,
      }),
      temperature: 0.2,
      maxOutputTokens: 800,
    });
    return mergeParsedEmail(object, fallback);
  } catch (err) {
    console.error("[parseEmail] failed, using heuristic fallback:", err);
    return fallback;
  }
}

function blank(): ParsedEmail {
  return {
    is_application_related: false,
    company: null,
    role: null,
    stage: null,
    applied_date: null,
    summary: null,
  };
}

function mergeParsedEmail(
  parsed: ParsedEmail,
  fallback: ParsedEmail,
): ParsedEmail {
  return {
    is_application_related:
      parsed.is_application_related || fallback.is_application_related,
    company: parsed.company || fallback.company,
    role: parsed.role || fallback.role,
    stage: parsed.stage ?? fallback.stage,
    applied_date: parsed.applied_date || fallback.applied_date,
    summary: parsed.summary || fallback.summary,
  };
}

function heuristicParseEmail(email: EmailInput): ParsedEmail {
  const text = `${email.subject}\n${email.from}\n${email.body}`.toLowerCase();
  if (!looksApplicationRelated(text)) return blank();

  const stage = detectStage(text);
  const company = extractCompany(email) ?? extractCompanyFromSender(email.from);
  const role = extractRole(email, company);

  return {
    is_application_related: Boolean(company) || Boolean(role),
    company,
    role,
    stage,
    applied_date: stage === "applied" ? email.received_at.slice(0, 10) : null,
    summary: summarizeHeuristically(email, company, role, stage),
  };
}

function looksApplicationRelated(text: string) {
  return [
    "application",
    "applied",
    "applying",
    "interview",
    "phone screen",
    "screening",
    "assessment",
    "take-home",
    "challenge",
    "offer",
    "rejected",
    "not move forward",
    "next step",
    "next steps",
    "recruit",
    "talent",
    "hiring",
    "careers",
    "intern",
    "graduate",
    "greenhouse",
    "workable",
    "lever",
    "ashby",
  ].some((term) => text.includes(term));
}

function detectStage(text: string): ApplicationStage | null {
  if (hasAny(text, ["withdrawn", "withdraw your application", "withdrawing"])) {
    return "withdrawn";
  }
  if (
    hasAny(text, [
      "unfortunately",
      "not move forward",
      "won't be moving forward",
      "decided not to proceed",
      "unsuccessful",
      "rejected",
    ])
  ) {
    return "rejected";
  }
  if (
    hasAny(text, [
      "offer",
      "offer letter",
      "delighted to offer",
      "pleased to offer",
      "congratulations",
    ])
  ) {
    return "offer";
  }
  if (
    hasAny(text, [
      "interview",
      "onsite",
      "on-site",
      "final round",
      "technical round",
    ])
  ) {
    return "interview";
  }
  if (
    hasAny(text, [
      "phone screen",
      "screening",
      "assessment",
      "take-home",
      "challenge",
      "next step",
      "next steps",
      "schedule a call",
    ])
  ) {
    return "screening";
  }
  if (
    hasAny(text, [
      "application received",
      "thanks for applying",
      "thank you for applying",
      "we received your application",
      "your application",
    ])
  ) {
    return "applied";
  }
  return null;
}

function extractCompany(email: EmailInput): string | null {
  const hay = `${email.subject}\n${email.body}`;
  const patterns = [
    /\b(?:at|@)\s+([A-Z][A-Za-z0-9&.' -]{1,50})(?:[.,:)\n]|$)/,
    /\b([A-Z][A-Za-z0-9&.' -]{1,50})\s+[·|-]\s+(?:update|interview|offer|application|phone|take-home|screen)/i,
    /(?:application received|thanks for applying|thank you for applying).*?\bat\s+([A-Z][A-Za-z0-9&.' -]{1,50})(?:[.,:)\n]|$)/i,
  ];
  for (const pattern of patterns) {
    const match = hay.match(pattern);
    const candidate = cleanupEntity(match?.[1]);
    if (candidate) return candidate;
  }
  return null;
}

function extractCompanyFromSender(from: string): string | null {
  const domain = from.match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/)?.[1];
  if (!domain) return null;
  const [first] = domain.split(".");
  if (!first || ATS_DOMAINS.has(first.toLowerCase())) return null;
  return titleCase(first.replace(/[-_]+/g, " "));
}

function extractRole(email: EmailInput, company: string | null): string | null {
  const hay = `${email.subject}\n${email.body}`;
  const patterns = [
    /(?:application received|thanks for applying|thank you for applying)[:\s-]+([A-Z][A-Za-z0-9&/+.() -]{2,80})\s+(?:at|@)\s+/i,
    /\b(?:for|to the)\s+([A-Z][A-Za-z0-9&/+.() -]{2,80})\s+(?:role|position|programme|program)\b/i,
    /\b([A-Z][A-Za-z0-9&/+.() -]{2,80})\s+(?:application|offer|interview|screen|challenge)\b/i,
  ];
  for (const pattern of patterns) {
    const match = hay.match(pattern);
    const candidate = cleanupEntity(match?.[1]);
    if (candidate && candidate !== company) return candidate;
  }
  return null;
}

function summarizeHeuristically(
  email: EmailInput,
  company: string | null,
  role: string | null,
  stage: ApplicationStage | null,
) {
  const target = [company, role].filter(Boolean).join(" ");
  const stageText = stage ? ` as ${stage}` : "";
  return target
    ? `${target} was classified${stageText} from Gmail.`
    : `Gmail message "${email.subject}" was classified${stageText}.`;
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function cleanupEntity(value: string | undefined): string | null {
  if (!value) return null;
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/\b(application|role|position|programme|program)$/i, "")
    .replace(/[.,:;|()[\]{}-]+$/g, "")
    .trim();
  if (!cleaned || cleaned.length < 2) return null;
  return cleaned;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const ATS_DOMAINS = new Set([
  "greenhouse",
  "workable",
  "lever",
  "ashbyhq",
  "ashby",
  "smartrecruiters",
  "myworkdayjobs",
  "workday",
  "bamboohr",
]);
