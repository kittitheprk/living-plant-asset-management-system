# 🌿 Living Plant Asset Management System (LPAMS)

**ระบบบริหารสินทรัพย์พืชมีชีวิตระดับองค์กร**

> Enterprise-grade Living Plant Asset & Nursery Stock Management System  
> สำหรับงานมหกรรมพืชสวนโลก จ.อุดรธานี พ.ศ. 2569  
> _International Horticultural Expo — Udon Thani, Thailand 2026_

---

## 📋 Overview | ภาพรวมระบบ

LPAMS เป็นแพลตฟอร์มดิจิทัลแบบครบวงจรสำหรับบริหารจัดการพืชมีชีวิตตลอด lifecycle ตั้งแต่ลงทะเบียนต้นไม้ ติดตามสุขภาพ ติด QR Tag จัดการสต็อกเรือนเพาะชำ ไปจนถึงระบบ E-Commerce และวิเคราะห์ข้อมูลผู้เข้าชม

LPAMS is a full-lifecycle digital platform for managing living plant assets — from tree registration, health monitoring, QR tag tracking, and nursery stock management to visitor analytics and e-commerce.

---

## 🏗️ System Architecture | สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Visitor PWA │  │  Admin Panel │  │  Arborist Field App   │ │
│  │  (index.html)│  │ (admin.html) │  │  (arborist.html)      │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬────────────┘ │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┴────────────┐ │
│  │              API Bridge Layer (api_bridge.js)              │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
├─────────────────────────────┼───────────────────────────────────┤
│                      SERVER LAYER                               │
│  ┌──────────────────────────┴─────────────────────────────────┐ │
│  │              PHP Backend (backen/)                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐  │ │
│  │  │  Public API  │  │  Admin API  │  │  Auth & RBAC      │  │ │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬──────────┘  │ │
│  └─────────┼───────────────┼──────────────────┼──────────────┘ │
│  ┌─────────┴───────────────┴──────────────────┴──────────────┐ │
│  │                  MySQL 8.0 / MariaDB 10.6+                │ │
│  │  plants · species · zones · observations · nursery_stock  │ │
│  │  qr_tags · interest_events · audit_logs                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Modules | โมดูลหลัก

### 1. 🌳 Plant Registry (ทะเบียนต้นไม้)
- **Tree ID** (`NN-UD-XXXXXX`) — รหัสถาวรตลอดชีพของต้นไม้ ไม่ผูกกับตำแหน่ง
- ติดตามสถานะชีวิต (`alive` / `moved` / `removed` / `dead`)
- ติดตามสุขภาพ (`good` / `watch` / `critical` / `unknown`)
- ระบบตรวจสอบข้อมูล: `draft` → `verified` → `published`

### 2. 🗺️ Zone & GIS Management (จัดการโซนและแผนที่)
- โซนจัดแสดงพร้อม GeoJSON boundary
- Leaflet interactive map พร้อม GPS tracking
- ประวัติการย้ายตำแหน่ง (location history) — insert-only, ไม่ update ทับ

### 3. 📊 Field Observation (บันทึกการสำรวจภาคสนาม)
- วัดความสูง ทรงพุ่ม เส้นรอบวงลำต้น (DBH)
- รองรับ offline sync ด้วย `client_uuid` ป้องกันข้อมูลซ้ำ
- แนบรูปภาพประกอบ

### 4. 🏷️ QR Tag System (ระบบ QR Code)
- สร้าง QR Code ผูกกับ Tree ID
- ติดตามสถานะป้าย: `printed` → `installed` → `damaged` → `retired`
- นับจำนวนการสแกน

### 5. 🌱 Nursery Stock Management (จัดการสต็อกเรือนเพาะชำ)
- จัดการสต็อกผูกกับ species (ไม่ใช่ต้นจัดแสดง)
- ระบบ auto-hide ราคาเมื่อไม่ตรวจสอบเกิน 7 วัน
- สถานะสต็อก: `available` / `low` / `out` / `not_for_sale`

### 6. 🛒 E-Commerce Manager (ระบบร้านค้า)
- จัดการร้านค้า / สินค้าภายในงาน
- ระบบ Lead Tracking สำหรับผู้สนใจซื้อ
- Dashboard ติดตามยอดขาย

### 7. 📈 Visitor Analytics (วิเคราะห์ผู้เข้าชม)
- ติดตาม scan / view / interest / price_request / share
- Session-based tracking (SHA-256, ไม่เก็บ IP ดิบ)
- PDPA-compliant — รองรับ consent + auto-purge

### 8. 📝 Audit Trail (ระบบตรวจสอบย้อนหลัง)
- บันทึกทุกการเปลี่ยนแปลงข้อมูล
- JSON diff (`{field: {old, new}}`)
- ทุกตารางมี `created_at` / `updated_at` / `created_by`

---

## 💻 Tech Stack | เทคโนโลยี

| Layer | Technology |
|-------|-----------|
| **Frontend (Visitor)** | HTML5, CSS3, Vanilla JS, PWA (Service Worker) |
| **Frontend (Admin)** | Single-page admin panel, Material Symbols, Font Awesome |
| **GIS/Maps** | Leaflet.js, GeoJSON |
| **QR Code** | QRCode.js |
| **API Layer** | `api_bridge.js` — client-side data bridge |
| **Backend** | PHP (plain, no framework) |
| **Database** | MySQL 8.0 / MariaDB 10.6+ |
| **Auth** | Session-based RBAC (`staff` / `sales` / `admin`) |
| **Fonts** | Plus Jakarta Sans, Prompt (Thai) |
| **Mockup App** | TanStack Router, Vite, React, TypeScript, shadcn/ui |

---

## 📁 Project Structure | โครงสร้างโปรเจกต์

```text
living-plant-asset-management-system/
├── index.html                  # 🌐 Visitor-facing PWA (main app)
├── admin.html                  # 🔧 Enterprise Admin Dashboard (LPAMS)
├── arborist.html               # 🌳 Arborist Field Survey App
├── ecommerce_manager.html      # 🛒 E-Commerce Management Panel
├── api_bridge.js               # 🔗 API Bridge Layer (client ↔ backend)
├── schema.sql                  # 🗄️ Full database schema (MySQL 8.0)
├── manifest.json               # 📱 PWA manifest
│
├── backen/                     # ⚙️ PHP Backend
│   ├── public/                 #    Visitor-facing pages (tree.php, interest.php)
│   ├── admin/                  #    Admin panel (dashboard, tree/zone/species forms)
│   ├── includes/               #    Shared PHP helpers (auth, visitor identity)
│   ├── config/                 #    Database & app configuration
│   ├── docs/                   #    Architecture docs, install.sql, migrations
│   └── tests/                  #    Test suite
│
├── image/                      # 🖼️ Static assets (logo, hero banner, expo map)
├── map/                        # 🗺️ GIS data (GeoJSON, GeoPackage)
│
├── udon expo mockup/           # 📱 React/Vite mockup app (TanStack Router + shadcn/ui)
│   ├── src/
│   │   ├── components/         #    UI components (AppShell, BottomNav, ZoneRail)
│   │   ├── routes/             #    TanStack Router pages (map, market, scan, etc.)
│   │   └── data/               #    Expo data
│   └── ...
│
└── team skill/                 # 🤖 AI Agent skill definitions
    ├── project-manager.skill
    ├── frontend-developer.skill
    ├── backend-api.skill
    ├── gis-maps.skill
    ├── ai-engineer.skill
    └── ...
```

---

## 🗄️ Database Design | การออกแบบฐานข้อมูล

### Core Tables

| Table | Description |
|-------|------------|
| `users` | ผู้ใช้งานระบบ (RBAC: staff / sales / admin) |
| `zones` | โซนจัดแสดง พร้อม GeoJSON boundary |
| `species` | Master data ชนิดพืช (ชื่อไทย/อังกฤษ/วิทยาศาสตร์) |
| `plants` | **ตารางหัวใจ** — ทะเบียนต้นไม้ทุกต้น |
| `plant_location_history` | ประวัติการย้ายตำแหน่ง (append-only) |
| `observations` | บันทึกการสำรวจภาคสนาม |
| `plant_images` | รูปภาพต้นไม้ |
| `maintenance_logs` | ประวัติการดูแล (รดน้ำ, ตัดแต่ง, ฯลฯ) |
| `qr_tags` | QR Code tags ผูกกับ Tree ID |
| `nursery_stock` | สต็อกเรือนเพาะชำ |
| `interest_events` | ข้อมูลผู้สนใจ + Lead tracking |
| `audit_logs` | Audit trail ทุกการเปลี่ยนแปลง |

### Key Views

| View | Purpose |
|------|---------|
| `v_zone_completeness` | KPI ความครบถ้วนข้อมูลตามโซน (เป้า ≥ 95%) |
| `v_popular_plants` | ต้นไม้ยอดนิยม (scans, interests, price requests) |

### Design Principles
1. **Tree ID ไม่ผูกกับตำแหน่ง** — ต้นไม้ย้ายได้ รหัสไม่เปลี่ยน
2. **การย้าย = INSERT** ลง `plant_location_history` — ห้าม UPDATE ทับ
3. **ข้อมูลสาธารณะต้องผ่าน verified** ก่อน published
4. **ทุกตารางมี audit trail** (`created_at` / `updated_at` / `created_by`)
5. **PDPA-compliant** — consent tracking + auto-purge สำหรับข้อมูลส่วนบุคคล

---

## 🚀 Getting Started | เริ่มต้นใช้งาน

### Prerequisites

- PHP 7.4+ (with `pdo_mysql`, `mbstring`)
- MySQL 8.0 / MariaDB 10.6+
- Web server (Apache / Nginx)
- Node.js 18+ (for mockup app only)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/kittitheprk/living-plant-asset-management-system.git
cd living-plant-asset-management-system

# 2. Setup database
mysql -u root -p < schema.sql

# 3. Configure backend
cp backen/config/config.example.php backen/config/config.php
# Edit config.php with your database credentials

# 4. Start viewing the PWA
# Open index.html in a browser, or serve with a local web server

# 5. (Optional) Run the React mockup app
cd "udon expo mockup"
npm install
npm run dev
```

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `ChangeMe123!` |

> ⚠️ **อย่าลืมเปลี่ยนรหัสผ่านก่อน deploy จริง!**

---

## 📄 Documentation | เอกสาร

Detailed documentation is available in [`backen/docs/`](backen/docs/):

| Document | Description |
|----------|------------|
| [`architecture.md`](backen/docs/architecture.md) | System architecture & request flow |
| [`database.md`](backen/docs/database.md) | Full schema design & rationale |
| [`page-flow.md`](backen/docs/page-flow.md) | Page/route map & structure |
| [`user-flow.md`](backen/docs/user-flow.md) | Visitor & admin user flows |
| [`rbac.md`](backen/docs/rbac.md) | Role hierarchy & access control |
| [`map-system.md`](backen/docs/map-system.md) | GIS map system design |
| [`visitor-identity.md`](backen/docs/visitor-identity.md) | Visitor tracking & dedup |
| [`multilingual-and-ai-translation.md`](backen/docs/multilingual-and-ai-translation.md) | TH/EN/ZH + AI translation |

---

## 🤝 Contributing | การมีส่วนร่วม

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is developed for the **International Horticultural Expo 2026, Udon Thani, Thailand** (งานมหกรรมพืชสวนโลก จ.อุดรธานี พ.ศ. 2569).

---

<p align="center">
  🌿 Built with ❤️ for Udon Thani Horticultural Expo 2026 🌿<br>
  <strong>Living Plant Asset Management System</strong>
</p>
