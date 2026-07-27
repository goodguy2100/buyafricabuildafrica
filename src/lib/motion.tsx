import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MotionCtx = {
  /** User's explicit preference (null = follow system). */
  preference: "on" | "off" | null;
  /** Whether OS-level reduced-motion is requested. */
  systemReduced: boolean;
  /** Final resolved value: should animations run? */
  motionEnabled: boolean;
  /** True if the current viewport is a small/mobile device. */
  isCompact: boolean;
  toggle: () => void;
  setPreference: (p: "on" | "off" | null) => void;
};

const Ctx = createContext<MotionCtx | null>(null);
const STORAGE_KEY = "baba.motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  const [preference, setPref] = useState<"on" | "off" | null>(null);
  const [systemReduced, setSystemReduced] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Hydrate preference from localStorage (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "on" || raw === "off") setPref(raw);
    } catch {
      /* ignore */
    }
  }, []);

  // Track prefers-reduced-motion + compact viewport.
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cm = window.matchMedia("(max-width: 767px)");
    const syncRm = () => setSystemReduced(rm.matches);
    const syncCm = () => setIsCompact(cm.matches);
    syncRm();
    syncCm();
    rm.addEventListener("change", syncRm);
    cm.addEventListener("change", syncCm);
    return () => {
      rm.removeEventListener("change", syncRm);
      cm.removeEventListener("change", syncCm);
    };
  }, []);

  const setPreference = useCallback((p: "on" | "off" | null) => {
    setPref(p);
    try {
      if (p === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const motionEnabled = useMemo(() => {
    if (preference === "off") return false;
    if (preference === "on") return true;
    // No explicit choice → follow the OS.
    return !systemReduced;
  }, [preference, systemReduced]);

  const toggle = useCallback(() => {
    setPreference(motionEnabled ? "off" : "on");
  }, [motionEnabled, setPreference]);

  // Reflect current state on <html> so pure-CSS rules can react too.
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.motion = motionEnabled ? "on" : "off";
    return () => {
      delete el.dataset.motion;
    };
  }, [motionEnabled]);

  const value = useMemo(
    () => ({ preference, systemReduced, motionEnabled, isCompact, toggle, setPreference }),
    [preference, systemReduced, motionEnabled, isCompact, toggle, setPreference],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMotion(): MotionCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Safe default when used outside provider (e.g. SSR without provider).
    return {
      preference: null,
      systemReduced: false,
      motionEnabled: true,
      isCompact: false,
      toggle: () => {},
      setPreference: () => {},
    };
  }
  return v;
}
