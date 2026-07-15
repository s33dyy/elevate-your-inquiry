import { useEffect, useRef, useCallback } from "react";

/**
 * Lightweight Web Audio click/hover sound engine + haptics.
 * No external assets. Synthesizes short soft blips.
 */
let sharedCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      sharedCtx = new AC();
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

function blip(freq: number, dur = 0.06, vol = 0.05, type: OscillatorType = "sine") {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}

export function playHover() {
  blip(880, 0.04, 0.02, "sine");
}

export function playClick() {
  blip(520, 0.05, 0.045, "triangle");
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate?.(8);
    } catch {
      /* noop */
    }
  }
}

export function setSoundMuted(next: boolean) {
  muted = next;
  if (typeof window !== "undefined") {
    localStorage.setItem("techilla_sound_muted", next ? "1" : "0");
  }
}

export function getSoundMuted() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("techilla_sound_muted") === "1";
}

/** Installs global click/hover sound listeners on interactive elements. */
export function useGlobalSoundHaptics() {
  const lastHover = useRef(0);

  useEffect(() => {
    muted = getSoundMuted();

    const isInteractive = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false;
      return !!el.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], .sound-tap, [data-sound]',
      );
    };

    const onPointerOver = (e: PointerEvent) => {
      if (!isInteractive(e.target)) return;
      const now = performance.now();
      if (now - lastHover.current < 60) return;
      lastHover.current = now;
      playHover();
    };
    const onClick = (e: MouseEvent) => {
      if (!isInteractive(e.target)) return;
      playClick();
    };

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
    };
  }, []);
}

export function useSoundToggle() {
  const setMuted = useCallback((v: boolean) => setSoundMuted(v), []);
  return { getMuted: getSoundMuted, setMuted };
}
