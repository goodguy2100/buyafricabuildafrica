import babaLogo from "@/assets/baba-logo.png.asset.json";

interface BabaLogoProps {
  className?: string;
  showText?: boolean;
}

export function BabaLogo({ className = "h-10 w-10", showText = true }: BabaLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={babaLogo.url}
        alt="Buy Africa Build Africa logo"
        className={`${className} object-contain`}
      />
      {showText && (
        <span className="font-display text-xl font-extrabold tracking-tight text-baba-teal">
          BABA
        </span>
      )}
    </div>
  );
}
