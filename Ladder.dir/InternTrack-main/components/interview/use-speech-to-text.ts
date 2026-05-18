"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>; resultIndex: number }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

/**
 * Hold-to-talk speech-to-text using the browser's Web Speech API.
 * Returns interim transcript while listening and a `finalTranscript` once the
 * user releases the button. Falls back gracefully if unsupported.
 */
export function useSpeechToText(opts?: {
  lang?: string;
  onFinalTranscript?: (text: string) => void;
}) {
  const lang = opts?.lang ?? "en-NZ";
  const onFinalTranscript = opts?.onFinalTranscript;
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  );
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const accumRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i] as unknown as {
          0: { transcript: string };
          isFinal: boolean;
        };
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      if (finalText) accumRef.current += finalText;
      setInterim(interimText);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    accumRef.current = "";
    setInterim("");
    setFinalTranscript("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // already started
    }
  }, []);

  const stopAndCommit = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setListening(false);
    setInterim("");
    const text = (accumRef.current || "").trim();
    if (text) {
      onFinalTranscript?.(text);
      setFinalTranscript(text);
      // Reset on next tick so a subsequent commit fires effects again
      setTimeout(() => setFinalTranscript(""), 50);
    }
  }, [onFinalTranscript]);

  return {
    supported,
    listening,
    interim,
    finalTranscript,
    start,
    stopAndCommit,
  };
}
