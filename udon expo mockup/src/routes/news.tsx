import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/AppShell";
import { HIGHLIGHTS, NEWS, getZone } from "@/data/expo";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "ข่าวสารและกิจกรรม | พืชสวนโลก อุดรธานี 2569" },
      {
        name: "description",
        content: "ข่าวสารล่าสุดและตารางกิจกรรมประจำวันของมหกรรมพืชสวนโลก จ.อุดรธานี พ.ศ. 2569",
      },
      { property: "og:title", content: "ข่าวสารและกิจกรรม | พืชสวนโลก อุดรธานี 2569" },
      { property: "og:description", content: "อัปเดตข่าวงานและตารางกิจกรรมประจำวันของงานเอ็กซ์โป" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  return (
    <AppShell title="ข่าวสาร & กิจกรรม">
      <section className="px-4 pt-4">
        <h3 className="text-lg font-bold">ตารางกิจกรรมวันนี้</h3>
        <div className="mt-3 space-y-2">
          {HIGHLIGHTS.map((h) => (
            <Link
              key={h.id}
              to="/map"
              search={{ zone: h.zoneId }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-[12px] font-bold text-primary">
                {h.time}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold leading-snug">{h.title}</span>
                <span className="text-[11px] text-muted-foreground">{getZone(h.zoneId)?.nameTh}</span>
              </span>
              <span className="material-symbols-outlined text-muted-foreground">place</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 px-4">
        <h3 className="text-lg font-bold">ข่าวสารงาน</h3>
        <div className="mt-3 space-y-3">
          {NEWS.map((n) => (
            <article key={n.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <img
                src={n.image}
                alt={n.title}
                loading="lazy"
                className="h-40 w-full object-cover"
              />
              <div className="p-3">
                <span className="text-[10px] font-semibold text-secondary">{n.date}</span>
                <h4 className="mt-1 text-sm font-bold leading-snug">{n.title}</h4>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{n.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
