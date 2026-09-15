import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { AppShell } from "@/components/AppShell";
import { ZoneRail } from "@/components/ZoneRail";
import { PLANTS, ZONES, getZone } from "@/data/expo";
import { currentZoneId } from "@/lib/visits";
import planAsset from "@/assets/master_plan_th.webp.asset.json";

const SearchSchema = z.object({ zone: z.string().optional() });

export const Route = createFileRoute("/map")({
  validateSearch: SearchSchema,
  head: () => ({
    meta: [
      { title: "แผนที่โซนจัดแสดง | พืชสวนโลก อุดรธานี 2569" },
      {
        name: "description",
        content: "เลื่อนโฟกัสแต่ละโซนบนผังงานมหกรรมพืชสวนโลกอุดรธานี พร้อมตำแหน่งที่คุณอยู่ปัจจุบัน",
      },
      { property: "og:title", content: "แผนที่โซนจัดแสดง | พืชสวนโลก อุดรธานี 2569" },
      { property: "og:description", content: "โฟกัสทีละโซนบนผังพื้นที่จัดงานพืชสวนโลกอุดรธานี" },
    ],
  }),
  component: MapPage,
});

const ZOOM = 2.1;

function MapPage() {
  const { zone } = Route.useSearch();
  const navigate = useNavigate({ from: "/map" });
  const [activeId, setActiveId] = useState(zone ?? ZONES[0]!.id);
  const [here, setHere] = useState<string | null>(null);

  useEffect(() => setHere(currentZoneId()), []);
  useEffect(() => {
    if (zone) setActiveId(zone);
  }, [zone]);

  const active = getZone(activeId) ?? ZONES[0]!;
  const zonePlants = PLANTS.filter((p) => p.zoneId === active.id);

  const select = (id: string) => {
    setActiveId(id);
    navigate({ search: { zone: id }, replace: true });
  };

  // Focus transform: keep the selected zone point in the middle of the viewport.
  const tx = (50 - active.x) * ZOOM;
  const ty = (50 - active.y) * ZOOM;

  return (
    <AppShell title="แผนที่งาน">
      <div className="relative mx-4 mt-3 aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-card">
        <div
          className="absolute inset-0 origin-center transition-transform duration-700 ease-out"
          style={{ transform: `scale(${ZOOM}) translate(${tx}%, ${ty}%)` }}
        >
          <img
            src={planAsset.url}
            alt="ผังพื้นที่จัดงานมหกรรมพืชสวนโลกอุดรธานี"
            className="size-full object-cover"
          />
          {ZONES.map((z) => {
            const isActive = z.id === activeId;
            return (
              <button
                key={z.id}
                onClick={() => select(z.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${z.x}%`, top: `${z.y}%` }}
                aria-label={z.nameTh}
              >
                <span
                  className={`flex items-center justify-center rounded-full border-2 border-white shadow-card transition-all ${
                    isActive
                      ? "size-7 bg-secondary text-secondary-foreground"
                      : "size-5 bg-primary text-primary-foreground"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px]">{z.icon}</span>
                </span>
                {here === z.id && (
                  <span className="absolute -inset-2 animate-ping rounded-full border-2 border-secondary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-sm font-bold text-white">{active.nameTh}</p>
          <p className="text-[11px] text-white/80">{active.nameEn}</p>
        </div>
      </div>

      <p className="mt-4 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        เลื่อนเลือกโซน แผนที่จะโฟกัสตาม
      </p>
      <div className="mt-2">
        <ZoneRail activeId={activeId} currentId={here} onSelect={select} />
      </div>

      <section className="mt-4 px-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[13px] leading-relaxed text-muted-foreground">{active.blurb}</p>
          {zonePlants.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold text-primary">ต้นไม้เด่นในโซนนี้</p>
              {zonePlants.map((p) => (
                <Link
                  key={p.id}
                  to="/plant/$id"
                  params={{ id: p.id }}
                  className="flex items-center gap-3 rounded-xl bg-muted p-2"
                >
                  <img
                    src={p.image}
                    alt={p.nameTh}
                    loading="lazy"
                    className="size-12 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{p.nameTh}</span>
                    <span className="block truncate text-[11px] italic text-muted-foreground">
                      {p.sci}
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-muted-foreground">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
          )}
          <Link
            to="/scan"
            className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            สแกนต้นไม้ในโซนนี้
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
