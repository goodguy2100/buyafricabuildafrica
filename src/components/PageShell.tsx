import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { EventPopup } from "./EventPopup";
import { FloatingShapes } from "./FloatingShapes";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col baba-page-wash">
      <FloatingShapes />
      <Header />
      <main className="flex-1">{children}</main>
      <div className="mb-20 sm:mb-24">
        <Footer />
      </div>
      <EventPopup />
    </div>
  );
}

