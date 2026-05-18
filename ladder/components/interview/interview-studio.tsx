"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  Mic,
  Send,
  Sparkles,
  StopCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { motion } from "motion/react";

import { FeedbackCard } from "@/components/interview/feedback-card";
import { ResearchPanel } from "@/components/interview/research-panel";
import { useSpeechToText } from "@/components/interview/use-speech-to-text";
import { VoiceWaveform } from "@/components/motion/voice-waveform";
import type {
  ChatMessage,
  CompanyResearch,
  InterviewFeedback,
} from "@/lib/types";

type Application = {
  id: string;
  company: string;
  position: string | null;
};

type InitialInterview = {
  id: string;
  research: CompanyResearch | null;
  transcript: ChatMessage[];
  feedback: InterviewFeedback | null;
};

export function InterviewStudio({
  application,
  interview,
}: {
  application: Application;
  interview: InitialInterview | null;
}) {
  const [research, setResearch] = useState<CompanyResearch | null>(
    interview?.research ?? null,
  );
  const [researchStatus, setResearchStatus] = useState<
    "idle" | "loading" | "error"
  >(interview?.research ? "idle" : "idle");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(
    interview?.feedback ?? null,
  );
  const [grading, setGrading] = useState(false);
  const [draft, setDraft] = useState("");
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/interview/chat",
        body: {
          company: application.company,
          role: application.position,
        },
      }),
    [application.company, application.position],
  );
  const initialMessages = useMemo(
    () => toUiMessages(interview?.transcript ?? []),
    [interview?.transcript],
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    messages: initialMessages,
    transport,
  });

  // Auto-scroll the transcript on new content.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleFinalTranscript = useCallback((text: string) => {
    setDraft((current) => (current ? `${current} ${text}` : text));
  }, []);

  // Voice input
  const { listening, interim, start, stopAndCommit, supported } =
    useSpeechToText({ onFinalTranscript: handleFinalTranscript });

  // Kick off research if we don't have any yet.
  useEffect(() => {
    if (research) return;
    let cancelled = false;
    (async () => {
      setResearchStatus("loading");
      try {
        const res = await fetch("/api/company/research", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            company: application.company,
            role: application.position,
          }),
        });
        if (!res.ok) throw new Error("research failed");
        const data = await res.json();
        if (!cancelled) {
          setResearch(data.research as CompanyResearch);
          setResearchStatus("idle");
        }
      } catch {
        if (!cancelled) setResearchStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [research, application.company, application.position]);

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    sendMessage({ text });
  }

  async function handleWrap() {
    setGrading(true);
    const transcript: ChatMessage[] = messages.map((m) => ({
      role: m.role === "assistant" ? "interviewer" : (m.role as "user" | "system"),
      content: extractText(m),
      timestamp: new Date().toISOString(),
    }));
    try {
      const res = await fetch("/api/interview/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: application.company,
          transcript,
        }),
      });
      if (!res.ok) throw new Error("grade failed");
      const data = await res.json();
      setFeedback(data.feedback as InterviewFeedback);
    } catch {
      // soft fail, keep the transcript visible
    } finally {
      setGrading(false);
    }
  }

  function handleVoiceMouseDown() {
    if (!supported) return;
    start();
  }
  function handleVoiceMouseUp() {
    if (!supported) return;
    stopAndCommit();
  }

  const busy = status === "submitted" || status === "streaming";
  const startedConversation = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-hairline">
        <div className="mx-auto max-w-[1480px] px-8 py-4 flex items-center justify-between gap-6">
          <div
            className="flex items-center gap-5 min-w-0"
            style={{ viewTransitionName: `app-${application.id}` }}
          >
            <Link
              href="/dashboard"
              className="text-mute hover:text-foreground transition shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
                Interview studio · {application.position ?? "Internship"}
              </p>
              <h1
                className="font-display text-2xl text-ink truncate"
                style={{ viewTransitionName: `app-title-${application.id}` }}
              >
                {application.company}
              </h1>
            </div>
          </div>
          <button
            onClick={handleWrap}
            disabled={!startedConversation || busy || grading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-sm border border-hairline hover:border-ink hover:bg-paper-strong transition disabled:opacity-50"
          >
            {grading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {grading ? "Grading…" : "Wrap & grade"}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] w-full px-8 py-8 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
        <ResearchPanel research={research} status={researchStatus} />

        <section className="bg-paper border border-hairline rounded-md flex flex-col min-h-[640px] max-h-[80dvh]">
          <header className="px-6 py-4 border-b border-hairline flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute flex items-center gap-3">
              <span className="inline-block size-1.5 rounded-full bg-primary" />
              Live · interviewer at {application.company}
            </p>
            {busy && (
              <button
                onClick={() => stop()}
                className="text-mute hover:text-foreground transition flex items-center gap-1.5 text-xs"
              >
                <StopCircle className="size-4" />
                Stop
              </button>
            )}
          </header>

          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-5"
          >
            {messages.length === 0 && (
              <EmptyState
                onSeed={() => {
                  setDraft(
                    `Hi! Excited to chat. I'd love to start whenever you're ready.`,
                  );
                }}
                disabled={researchStatus !== "idle"}
              />
            )}
            {messages.map((m) => (
              <Bubble
                key={m.id}
                role={m.role === "assistant" ? "interviewer" : "user"}
                text={extractText(m)}
                streaming={
                  m.role === "assistant" &&
                  status === "streaming" &&
                  m.id === messages[messages.length - 1]?.id
                }
              />
            ))}
            {error && (
              <div className="text-xs text-ink-soft border-l-2 border-primary pl-3 py-1.5 bg-paper-strong/50 rounded-sm">
                {error.message}
              </div>
            )}
          </div>

          {feedback ? (
            <div className="border-t border-hairline p-6">
              <FeedbackCard feedback={feedback} />
            </div>
          ) : (
            <footer className="border-t border-hairline p-4">
              <div className="flex items-end gap-3">
                <div className="relative shrink-0">
                  {listening && (
                    <motion.span
                      aria-hidden
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.55, opacity: 0 }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full bg-primary/30"
                    />
                  )}
                  <motion.button
                    type="button"
                    onMouseDown={handleVoiceMouseDown}
                    onMouseUp={handleVoiceMouseUp}
                    onMouseLeave={listening ? handleVoiceMouseUp : undefined}
                    onTouchStart={handleVoiceMouseDown}
                    onTouchEnd={handleVoiceMouseUp}
                    disabled={!supported}
                    animate={{ scale: listening ? 1.08 : 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 18,
                    }}
                    className={
                      "relative size-12 rounded-full border flex items-center justify-center transition select-none overflow-hidden " +
                      (listening
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-hairline text-mute hover:border-ink hover:text-ink")
                    }
                    title={
                      supported
                        ? "Hold to speak"
                        : "Voice unavailable, Chrome/Edge only"
                    }
                  >
                    {listening ? (
                      <VoiceWaveform active={listening} />
                    ) : (
                      <Mic className="size-5" />
                    )}
                  </motion.button>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <textarea
                    rows={2}
                    value={draft + (interim ? " " + interim : "")}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={
                      listening
                        ? "Listening…"
                        : "Type a reply, or hold the mic to speak."
                    }
                    className="w-full bg-paper-strong/40 border border-hairline rounded-md text-ink py-2.5 px-3 outline-none focus:border-primary transition placeholder:text-mute/60 resize-none text-[14px]"
                  />
                  {listening && interim && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                      ◉ {interim}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || busy}
                  className="size-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-[var(--color-c-deep)] transition disabled:opacity-40"
                >
                  {busy ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>
    </div>
  );
}

function Bubble({
  role,
  text,
  streaming,
}: {
  role: "interviewer" | "user";
  text: string;
  streaming: boolean;
}) {
  const isInterviewer = role === "interviewer";
  return (
    <div
      className={
        "flex gap-4 " + (isInterviewer ? "flex-row" : "flex-row-reverse")
      }
    >
      <div
        className={
          "size-9 shrink-0 rounded-full border flex items-center justify-center " +
          (isInterviewer
            ? "border-hairline bg-paper-strong text-mute"
            : "border-primary bg-primary text-primary-foreground")
        }
      >
        <span className="font-display text-sm">
          {isInterviewer ? "AI" : "You"}
        </span>
      </div>
      <div
        className={
          "max-w-[80%] rounded-md px-4 py-3 text-[15px] leading-relaxed border " +
          (isInterviewer
            ? "bg-paper-strong/60 border-hairline text-ink"
            : "bg-primary text-primary-foreground border-primary")
        }
      >
        <span className={streaming ? "ai-cursor" : ""}>{text || "…"}</span>
      </div>
    </div>
  );
}

function EmptyState({
  onSeed,
  disabled,
}: {
  onSeed: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-mute">
        Ready when you are
      </p>
      <h3 className="font-display text-3xl text-ink leading-tight">
        Start the{" "}
        <span className="font-editorial italic text-primary">conversation.</span>
      </h3>
      <p className="text-sm text-mute max-w-[420px] leading-relaxed">
        Greet the interviewer or hit the prompt below to start. Hold the mic
        button to answer by voice.
      </p>
      <button
        onClick={onSeed}
        disabled={disabled}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-sm border border-hairline hover:border-ink hover:bg-paper-strong transition disabled:opacity-50"
      >
        <ArrowUpRight className="size-4" />
        Hi! Excited to chat.
      </button>
    </div>
  );
}

function toUiMessages(transcript: ChatMessage[]): UIMessage[] {
  return transcript.map((message, index) => ({
    id: `saved-${index}-${message.timestamp}`,
    role: message.role === "interviewer" ? "assistant" : message.role,
    parts: [{ type: "text", text: message.content }],
  }));
}

function extractText(m: { parts?: Array<{ type: string; text?: string }> }): string {
  return (m.parts ?? [])
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text!)
    .join("");
}
