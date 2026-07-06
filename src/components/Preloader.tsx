import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const PHASES = [
  "Initializing Experience",
  "Loading Assets",
  "Preparing Experience",
  "Almost Ready",
] as const;

/**
 * Premium fullscreen preloader.
 * Shows animated wordmark + soft purple glow + cycling status + progress bar.
 * Unmounts via fade after `duration` (default 1600ms).
 */
export default function Preloader({
  onDone,
  duration = 1700,
  ready = true,
}: {
  onDone: () => void;
  duration?: number;
  ready?: boolean;
}) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const readyRef = (function () {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const r = useState({ current: ready })[0];
    r.current = ready;
    return r;
  })();

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 400 : duration;

    const start = performance.now();
    let raf = 0;
    let finished = false;
    const tick = (now: number) => {
      const elapsed = now - start;
      const rawP = Math.min(1, elapsed / total);
      // Cap visible progress at 90% until scene is ready
      const cappedP = readyRef.current ? rawP : Math.min(rawP, 0.9);
      const eased = 1 - Math.pow(1 - cappedP, 3);
      setProgress(eased);
      const idx = Math.min(PHASES.length - 1, Math.floor(eased * PHASES.length));
      setPhase(idx);
      if (readyRef.current && rawP >= 1) {
        if (!finished) {
          finished = true;
          setTimeout(() => setVisible(false), 180);
          setTimeout(onDone, 620);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, onDone, readyRef]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#0B0B0F" }}
          role="status"
          aria-live="polite"
          aria-label="Loading Techilla"
        >
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(139,125,255,0.18) 0%, transparent 55%)",
              filter: "blur(50px)",
            }}
          />

          <div className="relative flex flex-col items-center px-6">
            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 font-display text-4xl italic tracking-tight text-foreground sm:text-5xl"
            >
              <motion.span
                aria-hidden="true"
                animate={{
                  boxShadow: [
                    "0 0 10px rgba(139,125,255,0.4)",
                    "0 0 24px rgba(139,125,255,0.9)",
                    "0 0 10px rgba(139,125,255,0.4)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #8B7DFF 0%, #B4A9FF 100%)",
                }}
              />
              Techilla
            </motion.div>

            {/* Progress bar */}
            <div
              className="mt-10 h-[2px] w-56 overflow-hidden rounded-full sm:w-72"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <motion.div
                className="h-full"
                style={{
                  width: `${progress * 100}%`,
                  background:
                    "linear-gradient(90deg, #8B7DFF 0%, #B4A9FF 100%)",
                  boxShadow: "0 0 12px rgba(139,125,255,0.6)",
                }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
            </div>

            {/* Cycling status */}
            <div className="relative mt-5 h-5 w-64 overflow-hidden text-center sm:w-72">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="section-index absolute inset-0"
                >
                  {PHASES[phase]}…
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
