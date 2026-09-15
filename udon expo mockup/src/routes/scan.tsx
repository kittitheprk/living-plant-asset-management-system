import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { PLANTS, getZone } from "@/data/expo";
import { logVisit } from "@/lib/visits";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "สแกนต้นไม้ | พืชสวนโลก อุดรธานี 2569" },
      {
        name: "description",
        content: "สแกน QR ที่ป้ายต้นไม้เพื่อดูข้อมูล ฟังคำบรรยายด้วย AI และบันทึกโซนที่คุณเข้าชม",
      },
      { property: "og:title", content: "สแกนต้นไม้ | พืชสวนโลก อุดรธานี 2569" },
      {
        property: "og:description",
        content: "สแกน QR ป้ายต้นไม้ ดูข้อมูลพร้อมคำบรรยายเสียงจาก AI",
      },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const scan = () => {
    setBusy(true);
    const plant = PLANTS[Math.floor(Math.random() * PLANTS.length)]!;
    setTimeout(() => {
      logVisit(plant.id, plant.zoneId);
      navigate({ to: "/plant/$id", params: { id: plant.id } });
    }, 900);
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-black">
      <div className="absolute inset-0">
        <img
          src={PLANTS[0]!.image}
          alt="มุมมองกล้อง"
          className="size-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        <div className="bg-weave absolute inset-0 opacity-50" />
      </div>

      <header className="relative z-10 flex h-14 items-center justify-between px-4">
        <span className="material-symbols-outlined text-white">local_florist</span>
        <h1 className="text-sm font-bold tracking-widest text-white">UDON 2026 · SCAN</h1>
        <span className="material-symbols-outlined text-white">flash_on</span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-32">
        <h2 className="text-lg font-bold text-white drop-shadow">สแกน QR ที่ป้ายต้นไม้</h2>
        <p className="mt-1 text-[12px] text-white/80">วางโค้ดให้อยู่ในกรอบ</p>

        <div className="relative mt-8 flex size-64 items-center justify-center">
          <div className="absolute left-0 top-0 size-12 rounded-tl-2xl border-l-4 border-t-4 border-primary-soft" />
          <div className="absolute right-0 top-0 size-12 rounded-tr-2xl border-r-4 border-t-4 border-primary-soft" />
          <div className="absolute bottom-0 left-0 size-12 rounded-bl-2xl border-b-4 border-l-4 border-primary-soft" />
          <div className="absolute bottom-0 right-0 size-12 rounded-br-2xl border-b-4 border-r-4 border-primary-soft" />
          <div className="animate-scan absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary-bright shadow-[0_0_16px_var(--primary-bright)]" />
          <span className="material-symbols-outlined text-[64px] text-white/25">
            qr_code_scanner
          </span>
        </div>

        <button
          onClick={scan}
          disabled={busy}
          className="mt-10 flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-70"
        >
          <span className="material-symbols-outlined text-[20px]">
            {busy ? "hourglass_top" : "center_focus_strong"}
          </span>
          {busy ? "กำลังอ่านข้อมูล..." : "เริ่มสแกน"}
        </button>

        <div className="mt-8 w-full rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
          <p className="text-[11px] font-semibold text-white/90">ป้ายใกล้คุณ</p>
          <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
            {PLANTS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  logVisit(p.id, p.zoneId);
                  navigate({ to: "/plant/$id", params: { id: p.id } });
                }}
                className="w-28 shrink-0 rounded-xl bg-black/40 p-2 text-left"
              >
                <img
                  src={p.image}
                  alt={p.nameTh}
                  loading="lazy"
                  className="h-16 w-full rounded-lg object-cover"
                />
                <span className="mt-1 line-clamp-2 block text-[10px] font-medium text-white">
                  {p.nameTh}
                </span>
                <span className="block truncate text-[9px] text-white/60">
                  {getZone(p.zoneId)?.nameTh}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
