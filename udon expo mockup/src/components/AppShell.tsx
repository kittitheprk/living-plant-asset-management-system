import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { BottomNav } from "./BottomNav";
import logoAsset from "@/assets/logo.webp.asset.json";

export function AppShell({
  children,
  title,
  back,
  transparentHeader = false,
}: {
  children: ReactNode;
  title?: string;
  back?: string;
  transparentHeader?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header
        className={`fixed inset-x-0 top-0 z-40 mx-auto flex h-14 max-w-md items-center justify-between px-4 ${
          transparentHeader
            ? "bg-transparent"
            : "border-b border-border/70 bg-card/90 backdrop-blur-md"
        }`}
      >
        {back ? (
          <Link
            to={back}
            className="flex size-9 items-center justify-center rounded-full bg-card/80 text-foreground shadow-card"
            aria-label="ย้อนกลับ"
          >
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="มหกรรมพืชสวนโลก อุดรธานี 2569" className="h-7 w-auto" />
          </Link>
        )}
        {title ? (
          <h2 className="truncate px-3 text-base font-semibold text-foreground">{title}</h2>
        ) : (
          <span className="text-[11px] font-medium tracking-widest text-primary">UDON 2026</span>
        )}
        <Link
          to="/scan"
          className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-card"
          aria-label="สแกนต้นไม้"
        >
          <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
        </Link>
      </header>

      <main className="flex-1 pb-24 pt-14">{children}</main>
      <BottomNav />
    </div>
  );
}
