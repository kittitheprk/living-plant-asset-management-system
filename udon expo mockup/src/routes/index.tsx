import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { EXPO, HIGHLIGHTS, NEWS, ZONES, getZone } from "@/data/expo";
import { currentZoneId } from "@/lib/visits";
import heroAsset from "@/assets/hero_banner_desktop.webp.asset.json";
import siteAsset from "@/assets/exposite-homepage.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "มหกรรมพืชสวนโลก อุดรธานี 2569 | คู่มือชมงาน" },
      {
        name: "description",
        content:
          "ไฮไลต์ประจำวัน แผนที่โซนจัดแสดง สแกนต้นไม้ฟังคำบรรยายด้วย AI และตลาดต้นไม้ของงาน Udon Thani International Horticultural Expo 2026",
      },
      { property: "og:title", content: "มหกรรมพืชสวนโลก อุดรธานี 2569 | คู่มือชมงาน" },
      {
        property: "og:description",
        content: "ไฮไลต์ประจำวัน แผนที่โซน สแกนต้นไม้ด้วย AI และตลาดต้นไม้ในงานพืชสวนโลกอุดรธานี",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [here, setHere] = useState<string | null>(null);
  useEffect(() => setHere(currentZoneId()), []);
  const hereZone = here ? getZone(here) : undefined;

  return (
    <AppShell>
      {/* Event headline banner */}
      <section className="px-4 pt-3">
        <div className="overflow-hidden rounded-3xl shadow-card">
          <img
            src={heroAsset.url}
            alt={EXPO.nameTh}
            className="h-auto w-full"
            width={1920}
            height={760}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="rounded-full bg-secondary-soft px-3 py-1 text-secondary">
            {EXPO.dates}
          </span>
          <span className="rounded-full bg-accent px-3 py-1 text-primary">{EXPO.venue}</span>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-4 grid grid-cols-2 gap-3 px-4">
        <Link
          to="/scan"
          className="flex items-center gap-3 rounded-2xl bg-primary p-4 text-primary-foreground shadow-card"
        >
          <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
          <span className="text-sm font-semibold leading-tight">
            สแกนต้นไม้
            <br />
            <span className="text-[11px] font-normal opacity-80">ฟังคำบรรยาย AI</span>
          </span>
        </Link>
        <Link
          to="/market"
          className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground shadow-card"
        >
          <span className="material-symbols-outlined text-[28px]">shopping_basket</span>
          <span className="text-sm font-semibold leading-tight">
            สนใจซื้อต้นไม้
            <br />
            <span className="text-[11px] font-normal opacity-85">ตลาดต้นไม้ในงาน</span>
          </span>
        </Link>
      </section>

      <section className="mt-4 px-4">
        <Link
          to="/pilot"
          className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent p-3"
        >
          <span className="material-symbols-outlined text-primary">inventory_2</span>
          <span className="flex-1 text-[13px] leading-snug">
            <span className="font-semibold text-primary">เข้าสู่ระบบนำร่องสำหรับเจ้าหน้าที่</span>
            <br />
            <span className="text-muted-foreground">ทะเบียนพืช · ตรวจรับข้อมูล · Pipeline เฟสแรก</span>
          </span>
          <span className="material-symbols-outlined text-primary">chevron_right</span>
        </Link>
      </section>

      {hereZone && (
        <section className="mt-4 px-4">
          <Link
            to="/map"
            search={{ zone: hereZone.id }}
            className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-accent p-3"
          >
            <span className="material-symbols-outlined text-primary">my_location</span>
            <span className="flex-1 text-[13px] leading-snug">
              <span className="font-semibold text-primary">คุณอยู่โซน {hereZone.nameTh}</span>
              <br />
              <span className="text-muted-foreground">แตะเพื่อดูบนแผนที่</span>
            </span>
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </Link>
        </section>
      )}

      {/* Daily highlights */}
      <section className="mt-6">
        <SectionHead title="ไฮไลต์ประจำวัน" sub="เลื่อนดูกิจกรรมวันนี้" to="/news" />
        <div className="no-scrollbar snap-x-mandatory mt-3 flex gap-3 overflow-x-auto px-4">
          {HIGHLIGHTS.map((h) => {
            const zone = getZone(h.zoneId);
            return (
              <Link
                key={h.id}
                to="/map"
                search={{ zone: h.zoneId }}
                className="relative w-64 shrink-0 snap-center overflow-hidden rounded-2xl shadow-card"
              >
                <img
                  src={h.image}
                  alt={h.title}
                  loading="lazy"
                  className="h-40 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <span className="rounded-full bg-marigold px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {h.time}
                  </span>
                  <p className="mt-1.5 text-sm font-semibold leading-snug text-white">{h.title}</p>
                  <p className="text-[11px] text-white/80">{zone?.nameTh}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Zones overview */}
      <section className="mt-6">
        <SectionHead title="โซนจัดแสดง" sub="6 โซนหลักในพื้นที่ชุ่มน้ำหนองแด" to="/map" />
        <div className="mt-3 space-y-2.5 px-4">
          {ZONES.slice(0, 4).map((zone) => (
            <Link
              key={zone.id}
              to="/map"
              search={{ zone: zone.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5"
            >
              <img
                src={zone.image}
                alt={zone.nameTh}
                loading="lazy"
                className="size-16 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{zone.nameTh}</span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
                  {zone.blurb}
                </span>
              </span>
              <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
            </Link>
          ))}
        </div>
        <div className="mt-3 px-4">
          <Link to="/map" className="block overflow-hidden rounded-2xl shadow-card">
            <img
              src={siteAsset.url}
              alt="ผังพื้นที่จัดงาน"
              loading="lazy"
              className="h-40 w-full object-cover"
            />
          </Link>
        </div>
      </section>

      {/* News */}
      <section className="mt-6">
        <SectionHead title="ข่าวสารงาน" sub="อัปเดตล่าสุด" to="/news" />
        <div className="mt-3 space-y-2.5 px-4">
          {NEWS.slice(0, 2).map((n) => (
            <Link
              key={n.id}
              to="/news"
              className="flex gap-3 rounded-2xl border border-border bg-card p-2.5"
            >
              <img
                src={n.image}
                alt={n.title}
                loading="lazy"
                className="size-20 rounded-xl object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="text-[10px] font-medium text-secondary">{n.date}</span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-snug">
                  {n.title}
                </span>
                <span className="mt-1 line-clamp-2 block text-[11px] text-muted-foreground">
                  {n.excerpt}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 px-4 text-center text-[11px] text-muted-foreground">{EXPO.tagline}</p>
    </AppShell>
  );
}

function SectionHead({ title, sub, to }: { title: string; sub: string; to: string }) {
  return (
    <div className="flex items-end justify-between px-4">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <Link to={to} className="text-[12px] font-semibold text-primary">
        ดูทั้งหมด
      </Link>
    </div>
  );
}
