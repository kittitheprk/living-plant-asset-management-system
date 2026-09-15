import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardCheck, Database, Download, Leaf, MapPin, QrCode, UserPlus, Users } from "lucide-react";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/pilot")({
  component: PilotDashboard,
});

const pipeline = [
  { label: "กำหนดโซนและมาตรฐานข้อมูล", status: "เสร็จแล้ว", tone: "done" },
  { label: "สำรวจและสร้าง Tree ID", status: "กำลังดำเนินการ", tone: "active" },
  { label: "ตรวจสอบและรับรองข้อมูล", status: "รอดำเนินการ", tone: "pending" },
  { label: "สร้างหน้า QR และเปิดใช้งาน", status: "รอดำเนินการ", tone: "pending" },
];

const stats = [
  { label: "ต้นไม้ในทะเบียน", value: "126", target: "/ 150 ต้น", icon: Leaf, color: "text-primary" },
  { label: "ข้อมูลผ่านการรับรอง", value: "78%", target: "เป้าหมาย 95%", icon: CheckCircle2, color: "text-secondary" },
  { label: "QR Code พร้อมติดตั้ง", value: "18", target: "/ 30 จุด", icon: QrCode, color: "text-marigold" },
  { label: "ผู้ปฏิบัติงาน", value: "8", target: "คนในโซนนำร่อง", icon: Users, color: "text-primary" },
];

function PilotDashboard() {
  return (
    <AppShell title="ระบบนำร่อง">
      <div className="space-y-5 px-4 py-5">
        <section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary-foreground/70">ระยะที่ 1 · Validation Pilot</p>
              <h1 className="mt-1 text-2xl font-bold">ทะเบียนพืชมีชีวิต</h1>
              <p className="mt-2 text-xs leading-relaxed text-primary-foreground/80">
                พื้นที่นำร่อง: โซนสวนบัวและพื้นที่ชุ่มน้ำหนองแด
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3" aria-hidden="true">
              <ClipboardCheck className="size-7" />
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between text-xs">
            <span>ความคืบหน้าเฟสแรก</span>
            <span className="text-base font-bold">58%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/20">
            <div className="h-full w-[58%] rounded-full bg-marigold" />
          </div>
          <p className="mt-2 text-[11px] text-primary-foreground/65">สัปดาห์ที่ 4 จาก 8 · อัปเดตล่าสุดวันนี้ 09:30 น.</p>
        </section>

        <section className="grid grid-cols-2 gap-3" aria-label="สรุปผลการดำเนินงาน">
          {stats.map(({ label, value, target, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <Icon className={`size-5 ${color}`} aria-hidden="true" />
              <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-0.5 text-xs font-semibold">{label}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{target}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Pipeline การสร้างระบบ</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">ลำดับงานที่ต้องผ่านก่อนขยายพื้นที่</p>
            </div>
            <Database className="size-5 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-4 space-y-3">
            {pipeline.map((item, index) => (
              <div key={item.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${item.tone === "done" ? "bg-secondary text-secondary-foreground" : item.tone === "active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {item.tone === "done" ? "✓" : index + 1}
                  </span>
                  {index < pipeline.length - 1 && <span className="mt-1 h-full w-px bg-border" />}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className={`mt-0.5 text-[11px] ${item.tone === "active" ? "font-semibold text-primary" : "text-muted-foreground"}`}>{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-accent p-4">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-primary">งานถัดไปที่แนะนำ</h2>
              <p className="mt-1 text-xs leading-relaxed text-foreground/75">ตรวจรับข้อมูลต้นไม้ 24 รายการที่รอการยืนยันจากหัวหน้าโซน เพื่อให้ข้อมูลสาธารณะพร้อมเผยแพร่</p>
            </div>
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground transition hover:opacity-90">
            เปิดรายการรอตรวจรับ <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/map" className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-xs font-semibold">
            <MapPin className="size-4 text-primary" aria-hidden="true" /> ดูโซนนำร่อง
          </Link>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-xs font-semibold">
            <Download className="size-4 text-primary" aria-hidden="true" /> Export CSV
          </button>
        </div>
        <Link to="/register" className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-accent px-3 py-3 text-xs font-bold text-primary">
          <UserPlus className="size-4" aria-hidden="true" /> สมัครบัญชีเจ้าหน้าที่ใหม่
        </Link>
        <Link to="/" className="block text-center text-xs font-semibold text-muted-foreground">กลับสู่หน้าผู้เข้าชมทั่วไป</Link>
      </div>
    </AppShell>
  );
}
