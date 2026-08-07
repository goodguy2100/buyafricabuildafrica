import { MessageCircle } from "lucide-react";

/** BABA support line — displayed locally, dialled internationally. */
const WHATSAPP_NUMBER = "254746216258";
const DISPLAY_NUMBER = "0746 216258";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello BABA, I'd like to get in touch.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with BABA on WhatsApp at ${DISPLAY_NUMBER}`}
      className="group fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
