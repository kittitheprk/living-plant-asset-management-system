import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { BottomNav } from "@/components/BottomNav";
import { PLANTS, getPlant, getShop, getZone } from "@/data/expo";
import { describePlant, speakText } from "@/lib/ai.functions";
import { logVisit } from "@/lib/visits";

const LANGS = [
  { id: "th", label: "ไทย" },
  { id: "en", label: "English" },
  { id: "zh", label: "中文" },
  { id: "ja", label: "日本語" },
] as const;

export const Route = createFileRoute("/plant/$id")({
  loader: ({ params }) => {
    const plant = getPlant(params.id);
    if (!plant) throw notFound();
    return { plant };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "ไม่พบข้อมูลต้นไม้" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.plant.nameTh} | ข้อมูลต้นไม้ในงานพืชสวนโลกอุดรธานี`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.plant.descTh.slice(0, 150) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.plant.descTh.slice(0, 150) },
      ],
    };
  },
  component: PlantPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div>
        <p className="text-base font-semibold">ไม่พบข้อมูลต้นไม้นี้</p>
        <Link to="/scan" className="mt-3 inline-block text-sm font-semibold text-primary">
          กลับไปสแกนอีกครั้ง
        </Link>
      </div>
    </div>
  ),
});

function PlantPage() {
  const { plant } = Route.useLoaderData();
  const zone = getZone(plant.zoneId);
  const shop = getShop(plant.shopId);

  const [lang, setLang] = useState<(typeof LANGS)[number]["id"]>("th");
  const [narration, setNarration] = useState(plant.descTh);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const describe = useServerFn(describePlant);
  const speak = useServerFn(speakText);

  useEffect(() => {
    logVisit(plant.id, plant.zoneId);
    setNarration(plant.descTh);
    setLang("th");
  }, [plant.id, plant.zoneId, plant.descTh]);

  const translate = async (next: (typeof LANGS)[number]["id"]) => {
    setLang(next);
    if (next === "th") {
      setNarration(plant.descTh);
      return;
    }
    setLoadingText(true);
    try {
      const res = await describe({
        data: { name: `${plant.nameTh} (${plant.nameEn})`, text: plant.descTh, lang: next },
      });
      setNarration(res.text || plant.descTh);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "แปลภาษาไม่สำเร็จ");
      setLang("th");
    } finally {
      setLoadingText(false);
    }
  };

  const play = async () => {
    setLoadingAudio(true);
    try {
      const res = await speak({ data: { text: narration } });
      audioRef.current?.pause();
      const audio = new Audio(res.audio);
      audioRef.current = audio;
      await audio.play();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เล่นเสียงไม่สำเร็จ");
    } finally {
      setLoadingAudio(false);
    }
  };

  const related = PLANTS.filter((p) => p.id !== plant.id).slice(0, 3);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background pb-40">
      <div className="relative">
        <img src={plant.image} alt={plant.nameTh} className="h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        <Link
          to="/scan"
          className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-card/90 shadow-card"
          aria-label="ย้อนกลับ"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </Link>
        <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
          สแกนสำเร็จ
        </span>
      </div>

      <div className="-mt-8 rounded-t-3xl bg-background px-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">{plant.nameTh}</h1>
            <p className="text-[12px] text-muted-foreground">{plant.nameEn}</p>
            <p className="text-[12px] italic text-muted-foreground">{plant.sci}</p>
          </div>
          {zone && (
            <Link
              to="/map"
              search={{ zone: zone.id }}
              className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold text-primary"
            >
              {zone.nameTh}
            </Link>
          )}
        </div>

        {/* AI guide */}
        <section className="mt-4 rounded-2xl border border-primary/20 bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <p className="text-[13px] font-bold">ไกด์ AI · แปลภาษา & บรรยายเสียง</p>
          </div>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => translate(l.id)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  lang === l.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="mt-3 min-h-[76px] text-[13px] leading-relaxed text-foreground">
            {loadingText ? "กำลังแปลด้วย AI..." : narration}
          </p>
          <button
            onClick={play}
            disabled={loadingAudio || loadingText}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-3 text-sm font-semibold text-secondary-foreground disabled:opacity-70"
          >
            <span className="material-symbols-outlined text-[20px]">
              {loadingAudio ? "graphic_eq" : "volume_up"}
            </span>
            {loadingAudio ? "กำลังสร้างเสียง..." : "ฟังคำบรรยาย"}
          </button>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: "wb_sunny", label: "แสง", value: plant.light },
            { icon: "water_drop", label: "น้ำ", value: plant.water },
            { icon: "public", label: "ถิ่นกำเนิด", value: plant.origin },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl border border-border bg-card p-3">
              <span className="material-symbols-outlined text-[20px] text-primary">{f.icon}</span>
              <p className="mt-1 text-[10px] text-muted-foreground">{f.label}</p>
              <p className="text-[11px] font-semibold leading-snug">{f.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-5">
          <h3 className="text-base font-bold">ต้นไม้อื่นที่น่าสนใจ</h3>
          <div className="no-scrollbar mt-2 flex gap-3 overflow-x-auto">
            {related.map((p) => (
              <Link
                key={p.id}
                to="/plant/$id"
                params={{ id: p.id }}
                className="w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img
                  src={p.image}
                  alt={p.nameTh}
                  loading="lazy"
                  className="h-20 w-full object-cover"
                />
                <span className="block p-2 text-[11px] font-semibold leading-snug">{p.nameTh}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Interested → shop */}
      <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-md border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md shadow-sheet">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground">สนใจซื้อต้นนี้</p>
            <p className="text-base font-bold text-secondary">฿{plant.price.toLocaleString()}</p>
            <p className="truncate text-[10px] text-muted-foreground">โดย {shop?.name}</p>
          </div>
          <Link
            to="/market/shop/$shopId"
            params={{ shopId: plant.shopId }}
            search={{ plant: plant.id }}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            <span className="material-symbols-outlined text-[20px]">storefront</span>
            เข้าชมร้าน
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
