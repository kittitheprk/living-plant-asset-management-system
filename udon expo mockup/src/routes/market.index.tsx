import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { PRODUCTS, SHOPS, ZONES, getShop } from "@/data/expo";
import heroAsset from "@/assets/hero_banner_desktop.webp.asset.json";

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด", icon: "grid_view" },
  { id: "orchid", label: "กล้วยไม้", icon: "local_florist" },
  { id: "wetland", label: "บัว & ไม้น้ำ", icon: "waves" },
  { id: "cactus", label: "ไม้อวบน้ำ", icon: "grass" },
  { id: "indoor", label: "ไม้ใบในร่ม", icon: "park" },
];

export const Route = createFileRoute("/market/")({
  head: () => ({
    meta: [
      { title: "ตลาดต้นไม้ในงาน | พืชสวนโลก อุดรธานี 2569" },
      {
        name: "description",
        content:
          "ช้อปกล้วยไม้ บัวหนองแด ไม้อวบน้ำ และไม้ใบจากร้านค้าในงานมหกรรมพืชสวนโลก จ.อุดรธานี 2569",
      },
      { property: "og:title", content: "ตลาดต้นไม้ในงาน | พืชสวนโลก อุดรธานี 2569" },
      {
        property: "og:description",
        content: "ช้อปต้นไม้จากร้านค้าในงานพืชสวนโลกอุดรธานี ส่งตรงจากสวนท้องถิ่น",
      },
    ],
  }),
  component: MarketPage,
});

function MarketPage() {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const products = useMemo(
    () =>
      PRODUCTS.filter((p) => {
        const shop = getShop(p.shopId);
        const inCat = cat === "all" || shop?.zoneId === cat;
        const inQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
        return inCat && inQ;
      }),
    [cat, q],
  );

  return (
    <AppShell title="ตลาดต้นไม้">
      <div className="px-4 pt-3">
        <label className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5">
          <span className="material-symbols-outlined text-[20px] text-muted-foreground">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาต้นไม้ เมล็ด กระถาง..."
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="mt-3 px-4">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={heroAsset.url}
            alt="โปรโมชันตลาดต้นไม้"
            className="h-28 w-full object-cover"
            width={1920}
            height={760}
          />
          <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/60 to-transparent p-4">
            <p className="text-sm font-bold text-white">ส่งตรงจากสวนอุดรธานี</p>
            <p className="text-[11px] text-white/85">ลดสูงสุด 30% เฉพาะผู้เข้าชมงาน</p>
          </div>
        </div>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-colors ${
              cat === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      <section className="mt-4 px-4">
        <div className="flex items-end justify-between">
          <h3 className="text-base font-bold">ร้านค้าแนะนำ</h3>
          <span className="text-[11px] text-muted-foreground">{SHOPS.length} ร้านในงาน</span>
        </div>
        <div className="no-scrollbar mt-2 flex gap-3 overflow-x-auto">
          {SHOPS.map((s) => (
            <Link
              key={s.id}
              to="/market/shop/$shopId"
              params={{ shopId: s.id }}
              className="w-40 shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <img src={s.banner} alt={s.name} loading="lazy" className="h-20 w-full object-cover" />
              <span className="block p-2">
                <span className="block truncate text-[12px] font-semibold">{s.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="material-symbols-outlined text-[12px] text-marigold">star</span>
                  {s.rating} · {ZONES.find((z) => z.id === s.zoneId)?.nameTh}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 px-4">
        <h3 className="text-base font-bold">สินค้าทั้งหมด</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <Link
              key={p.id}
              to="/market/shop/$shopId"
              params={{ shopId: p.shopId }}
              search={{ plant: p.plantId }}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                {p.tag && (
                  <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-secondary-foreground">
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-[12px] font-medium leading-snug">{p.name}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-secondary">
                    ฿{p.price.toLocaleString()}
                  </span>
                  {p.compareAt && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      ฿{p.compareAt.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="material-symbols-outlined text-[12px] text-marigold">star</span>
                  {p.rating} · ขายแล้ว {p.sold.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {products.length === 0 && (
          <p className="py-10 text-center text-[13px] text-muted-foreground">ไม่พบสินค้าที่ค้นหา</p>
        )}
      </section>
    </AppShell>
  );
}
