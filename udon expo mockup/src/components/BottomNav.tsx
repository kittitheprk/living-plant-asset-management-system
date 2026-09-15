import { Link } from "@tanstack/react-router";

const ITEMS = [
  { to: "/", icon: "home", label: "หน้าหลัก" },
  { to: "/map", icon: "map", label: "แผนที่" },
  { to: "/scan", icon: "qr_code_scanner", label: "สแกน" },
  { to: "/market", icon: "storefront", label: "อีคอมเมิร์ซ" },
  { to: "/news", icon: "event_note", label: "ข่าวสาร" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-20 max-w-md items-center justify-around border-t border-border/70 bg-card/95 px-2 pb-1 backdrop-blur-xl" aria-label="เมนูผู้ใช้งานทั่วไป">
      {ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/" }}
          className="group flex flex-col items-center justify-center rounded-full px-3 py-1.5 text-muted-foreground transition-colors"
          activeProps={{ className: "text-primary" }}
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined mb-0.5 text-[24px] ${isActive ? "rounded-full bg-accent px-4 py-0.5 text-primary" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
