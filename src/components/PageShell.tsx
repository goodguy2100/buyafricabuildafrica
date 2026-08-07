import { useEffect, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { EventPopup } from "./EventPopup";
import { WhatsAppButton } from "./WhatsAppButton";
import { FloatingShapes, type ShapePreset } from "./FloatingShapes";
import { useMotion } from "@/lib/motion";

/**
 * Auto-reveal top-level sections in <main> as they scroll into view.
 * Elements opt in via <section> tag or [data-reveal]. If motion is off,
 * everything renders immediately with no transitions.
 */
function useAutoReveal(enabled: boolean) {
  useEffect(() => {
    // Never hide the first (above-the-fold) section — it holds the LCP
    // element, and gating it behind hydration delays first paint badly.
    const firstSection = document.querySelector<HTMLElement>("main > section");
    firstSection?.classList.remove("baba-reveal");
    firstSection?.classList.add("baba-reveal-in");

    const sectionTargets = Array.from(
      document.querySelectorAll<HTMLElement>("main > section, main [data-reveal]"),
    ).filter((el) => el !== firstSection && !el.hasAttribute("data-no-reveal"));
    const stackTargets = Array.from(
      document.querySelectorAll<HTMLElement>("main [data-stack]"),
    ).filter((el) => !firstSection?.contains(el));
    const targets = [...sectionTargets, ...stackTargets];

    if (targets.length === 0) return;

    if (!enabled) {
      sectionTargets.forEach((el) => {
        el.classList.remove("baba-reveal");
        el.classList.add("baba-reveal-in");
      });
      stackTargets.forEach((el) => el.classList.add("baba-stack-in"));
      return;
    }

    sectionTargets.forEach((el) => el.classList.add("baba-reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          if (el.hasAttribute("data-stack")) {
            el.classList.add("baba-stack-in");
          } else {
            el.classList.add("baba-reveal-in");
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => io.observe(el));

    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 0.9 && rect.bottom > 0) {
          if (el.hasAttribute("data-stack")) {
            el.classList.add("baba-stack-in");
          } else {
            el.classList.add("baba-reveal-in");
          }
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
      <WhatsAppButton />
    </div>
  );
}

