import { Sparkles, SparkleIcon } from "lucide-react";
import { useMotion } from "@/lib/motion";

export function MotionToggle({ className = "" }: { className?: string }) {
  const { motionEnabled, toggle } = useMotion();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={motionEnabled}
      aria-label={motionEnabled ? "Turn motion effects off" : "Turn motion effects on"}
      title={motionEnabled ? "Motion effects: on" : "Motion effects: off"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        motionEnabled
          ? "border-baba-blue/30 bg-baba-blue/5 text-baba-blue hover:bg-baba-blue/10"
          : "border-baba-slate/20 bg-transparent text-baba-slate/60 hover:text-baba-slate"
      } ${className}`}
    >
      {motionEnabled ? (
        <Sparkles className="h-4 w-4" />
      ) : (
        <SparkleIcon className="h-4 w-4" />
      )}
    </button>
  );
}
