import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { getSoundMuted, setSoundMuted } from "@/hooks/useSoundHaptics";

export function BlogTopBar({ backLabel }: { backLabel?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(getSoundMuted());
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleMute = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  };

  return (
    <>
      <header className="glass-nav fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="font-display text-xl tracking-tight text-foreground sm:text-2xl">
            Techilla
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/" className="section-index hover:text-white">
              Home
            </Link>
            <Link
              to="/blog"
              className="section-index hover:text-white"
              activeOptions={{ exact: true }}
              activeProps={{ style: { color: "white" } }}
            >
              Blog
            </Link>
            <Link to="/careers" className="section-index hover:text-white">
              Careers
            </Link>
            <SocialLinks size={16} />
            <button
              type="button"
              aria-label={muted ? "Unmute sounds" : "Mute sounds"}
              onClick={toggleMute}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <Link
              to="/"
              hash="apply"
              className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {backLabel ?? "Apply"}
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-xl tracking-tight text-foreground"
            >
              Techilla
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-8 px-8">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-4xl tracking-tight text-foreground"
            >
              Home
            </Link>
            <Link
              to="/blog"
              onClick={() => setOpen(false)}
              className="font-display text-4xl tracking-tight text-foreground"
            >
              Blog
            </Link>
            <Link
              to="/careers"
              onClick={() => setOpen(false)}
              className="font-display text-4xl tracking-tight text-foreground"
            >
              Careers
            </Link>
            <Link
              to="/"
              hash="apply"
              onClick={() => setOpen(false)}
              className="font-display text-4xl tracking-tight"
              style={{ color: "#B4A9FF" }}
            >
              Apply →
            </Link>
          </nav>

          <div className="border-t border-border px-8 py-6">
            <div className="flex items-center justify-between">
              <span className="section-index">Follow</span>
              <SocialLinks size={20} />
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? "Sound off" : "Sound on"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
