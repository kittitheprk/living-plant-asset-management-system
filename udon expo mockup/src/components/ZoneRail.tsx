import { ZONES } from "@/data/expo";

export function ZoneRail({
  activeId,
  currentId,
  onSelect,
}: {
  activeId: string;
  currentId?: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="no-scrollbar snap-x-mandatory flex gap-3 overflow-x-auto px-4 pb-1">
      {ZONES.map((zone) => {
        const active = zone.id === activeId;
        return (
          <button
            key={zone.id}
            onClick={() => onSelect(zone.id)}
            className={`relative w-40 shrink-0 snap-center rounded-2xl border p-3 text-left transition-all ${
              active
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-card text-foreground"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${active ? "" : "text-primary"}`}
            >
              {zone.icon}
            </span>
            <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug">
              {zone.nameTh}
            </p>
            <p
              className={`mt-0.5 truncate text-[10px] ${active ? "opacity-80" : "text-muted-foreground"}`}
            >
              {zone.nameEn}
            </p>
            {currentId === zone.id && (
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-semibold text-secondary-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-secondary-foreground" />
                คุณอยู่ที่นี่
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
