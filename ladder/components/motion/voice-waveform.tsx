"use client";

import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 5;
const IDLE_LEVELS = Array(BAR_COUNT).fill(0.18);

export function VoiceWaveform({ active }: { active: boolean }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [levels, setLevels] = useState<number[]>(IDLE_LEVELS);

  useEffect(() => {
    if (!active) {
      stopAll();
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(data);
          const next: number[] = [];
          const step = Math.floor(data.length / BAR_COUNT);
          for (let i = 0; i < BAR_COUNT; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0;
            const avg = sum / step / 255;
            next.push(Math.max(0.18, Math.min(1, avg * 1.6)));
          }
          setLevels(next);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // mic blocked — render idle bars
      }
    })();

    return () => {
      cancelled = true;
      stopAll();
    };

    function stopAll() {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      analyserRef.current = null;
    }
  }, [active]);

  const visibleLevels = active ? levels : IDLE_LEVELS;

  return (
    <div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center gap-[3px] pointer-events-none"
    >
      {visibleLevels.map((v, i) => (
        <span
          key={i}
          className="block w-[2.5px] rounded-full bg-current"
          style={{
            height: `${Math.round(v * 22)}px`,
            transition: "height 80ms cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: 0.95,
          }}
        />
      ))}
    </div>
  );
}
