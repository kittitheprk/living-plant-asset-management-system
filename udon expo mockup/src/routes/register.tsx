import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Leaf } from "lucide-react";

import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <AppShell title="สมัครใช้งาน">
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary-soft text-secondary">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">ส่งคำขอสมัครแล้ว</h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">ผู้ดูแลระบบจะตรวจสอบสิทธิ์เจ้าหน้าที่และส่งผลการอนุมัติไปยังอีเมลของคุณ</p>
          <Link to="/pilot" className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">กลับสู่ระบบนำร่อง</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="สมัครใช้งาน">
      <div className="px-4 py-6">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-card">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10">
            <Leaf className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs text-primary-foreground/70">Living Plant Asset Management</p>
          <h1 className="mt-1 text-2xl font-bold">สร้างบัญชีเจ้าหน้าที่</h1>
          <p className="mt-2 text-xs leading-relaxed text-primary-foreground/80">สำหรับทีมสำรวจ เจ้าของโซน ฝ่ายสวน และฝ่ายขาย</p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <label className="block text-sm font-semibold">ชื่อ–นามสกุล
            <input required name="name" type="text" placeholder="เช่น อรทัย ใจดี" className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30" />
          </label>
          <label className="block text-sm font-semibold">อีเมลหน่วยงาน
            <input required name="email" type="email" placeholder="name@organization.go.th" className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30" />
          </label>
          <label className="block text-sm font-semibold">บทบาทการใช้งาน
            <select required name="role" defaultValue="" className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30">
              <option value="" disabled>เลือกบทบาท</option>
              <option value="survey">ทีมสำรวจ / เจ้าหน้าที่สวน</option>
              <option value="zone-owner">เจ้าของโซน / ผู้รับรองข้อมูล</option>
              <option value="nursery">ฝ่ายเรือนเพาะชำ</option>
              <option value="sales">ฝ่ายขาย</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">รหัสผ่าน
            <span className="relative mt-1.5 block">
              <input required minLength={8} name="password" type={showPassword ? "text" : "password"} placeholder="อย่างน้อย 8 ตัวอักษร" className="w-full rounded-xl border border-input bg-card px-3 py-3 pr-11 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <input required type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" /> ยอมรับเงื่อนไขการใช้งานและการเก็บข้อมูลเพื่อการบริหารสินทรัพย์พืช
          </label>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-card transition hover:opacity-90">สมัครใช้งาน <ArrowLeft className="size-4 rotate-180" aria-hidden="true" /></button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">มีบัญชีอยู่แล้ว? <Link to="/pilot" className="font-bold text-primary">เข้าสู่ระบบนำร่อง</Link></p>
      </div>
    </AppShell>
  );
}
