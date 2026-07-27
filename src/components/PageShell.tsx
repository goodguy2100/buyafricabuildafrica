import { useEffect, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { EventPopup } from "./EventPopup";
import { FloatingShapes, type ShapePreset } from "./FloatingShapes";
import { useMotion } from "@/lib/motion";

/**
 * Auto-reveal top-level sections in <main> as they scroll into view.
 * Elements opt in via <section> tag or [data-reveal]. If motion is off,
 * everything renders immediately with no transitions.
 */
function useAutoReveal(enabled: boolean) {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("main > section, main [data-reveal]"),
    );
    if (targets.length === 0) return;

    if (!enabled) {
      targets.forEach((el) => {
        el.classList.remove("baba-reveal");
        el.classList.add("baba-reveal-in");
      });
      return;
    }

    targets.forEach((el) => {
      el.classList.add("baba-reveal");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("baba-reveal-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => io.observe(el));

    // Safety net: anything already in the viewport at mount should reveal
    // immediately (IntersectionObserver fires async, avoids first-paint flash).
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.9 && rect.bottom > 0) {
          el.classList.add("baba-reveal-in");
          io.unobserve(el);
        }
      });
    });

    return () => io.disconnect();
  }, [enabled]);
}

export function PageShell({
  children,
  preset = "default",
}: {
  children: ReactNode;
  preset?: ShapePreset;
}) {
  const { motionEnabled } = useMotion();
  useAutoReveal(motionEnabled);

  return (
    <div className="relative flex min-h-screen flex-col baba-page-wash">
      <FloatingShapes preset={preset} />
      <Header />
      <main className="flex-1">{children}</main>
      <div className="mb-20 sm:mb-24">
        <Footer />
      </div>
      <EventPopup />
    </div>
  );
}

