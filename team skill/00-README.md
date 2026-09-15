# Smart Expo & Living Plant Asset — AI Agent Team (10 ตำแหน่ง)

โฟลเดอร์นี้มีของ **2 ชุด** สำหรับโครงการ *ระบบบริหารสินทรัพย์พืชมีชีวิตและช่องทางการขายผ่าน QR Code*
งานมหกรรมพืชสวนโลกจังหวัดอุดรธานี พ.ศ. 2569

---

## ชุดที่ 1 — System Prompt (ไฟล์ `01-10-*.md`)

สำหรับนำไปวางในแพลตฟอร์ม Agent ภายนอก (OpenAI GPTs, CrewAI, Dify, Langflow)

**วิธีใช้:** สร้าง Agent ใหม่ 1 ตัวต่อไฟล์ แล้วคัดลอกเนื้อหาในช่อง code block ไปวางเป็น System Prompt

| # | ไฟล์ | บทบาท |
|---|------|--------|
| 1 | `01-project-manager-agent.md` | Project / Product Manager |
| 2 | `02-uiux-designer-agent.md` | UI/UX System Designer |
| 3 | `03-frontend-mobile-developer-agent.md` | Frontend Mobile Developer |
| 4 | `04-backend-api-developer-agent.md` | Backend & API Developer |
| 5 | `05-gis-maps-specialist-agent.md` | GIS & Maps Integration Specialist |
| 6 | `06-ai-ml-engineer-agent.md` | AI & Machine Learning Engineer |
| 7 | `07-data-analytics-engineer-agent.md` | IoT & Data Analytics Engineer |
| 8 | `08-devops-cloud-agent.md` | DevOps & Cloud Scalability |
| 9 | `09-qa-security-agent.md` | QA & Security Engineer |
| 10 | `10-ai-orchestrator-agent.md` | **AI Orchestrator & Product Owner** (หัวหน้าทีม) |

---

## ชุดที่ 2 — Skill สำหรับ Claude (ไฟล์ `*.skill`)

ชุดเดียวกันแต่ทำเป็น Skill เต็มรูปแบบ อิงข้อเท็จจริงจาก PDF ข้อเสนอโครงการ
ดูรายละเอียดใน **`README-skills.md`**

| ไฟล์ | บทบาท | มีอะไรข้างใน |
|------|-------|-------------|
| `udon-orchestrator.skill` | **หัวหน้าทีม** | ตารางมอบหมายงาน, workflow 5 แบบ, quality gate รายตำแหน่ง, เกณฑ์ escalation |
| `udon-pm.skill` | Project Manager | ประมาณการงาน 112 points, ความเสี่ยง 5 ข้อพร้อม early warning |
| `udon-uiux.skill` | UI/UX Designer | design token, spec หน้าจอ, UX copy ภาษาไทย |
| `udon-frontend.skill` | Frontend Developer | โค้ด PWA offline-first, QR scanner, service worker |
| `udon-backend.skill` | Backend & API | `schema.sql` เต็ม 12 ตาราง + API spec + โค้ด PHP |
| `udon-gis.skill` | GIS & Maps | สูตร haversine, point-in-polygon, geo-fence + hysteresis |
| `udon-ai.skill` | AI Engineer | สถาปัตยกรรม pre-generate, สคริปต์แปล/TTS, RAG prompt |
| `udon-analytics.skill` | Data Analytics | KPI queries ครบ 6 ข้อ, สูตรคำนวณคาร์บอน Chave 2014 |
| `udon-devops.skill` | DevOps & Cloud | runbook ติดตั้ง, สคริปต์ backup/restore/export, load test |
| `udon-qa.skill` | QA & Security | test case 30+ เคส, OWASP checklist, PDPA checklist |

**วิธีติดตั้ง:** เปิดไฟล์ `.skill` ในแชท Claude แล้วกดบันทึก
หรือแตก zip วางในโฟลเดอร์ `.claude/skills/` ของโปรเจกต์

**เริ่มใช้งาน:** โยนโจทย์ให้ `udon-orchestrator` ก่อน แล้วมันจะบอกเองว่าควรเรียกใครต่อ

---

## ลำดับการทำงานของทีม

```
              ┌──────────────────────────────┐
              │  AI Orchestrator (หัวหน้าทีม) │
              │  รับโจทย์ → แตกงาน → ตรวจงาน  │
              └───────────────┬──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   1. PM                 2. UI/UX              3. Backend
   backlog/timeline      journey/wireframe     schema/API
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ↓
              4. Frontend + GIS  (ทำงานคู่กัน)
                              ↓
              5. AI  +  6. Analytics  (เฟส 2)
                              ↓
              7. DevOps  (infra/backup/deploy)
                              ↓
              8. QA & Security  (เข้ามาตั้งแต่ต้น ไม่ใช่ท้ายสุด)
```

**หมายเหตุ 2 ข้อ:**

- **Backend ต้องมาก่อน Frontend เสมอ** — API contract ต้องนิ่งก่อน ไม่งั้น frontend สมมติ API เอง แล้วต้องแก้สองรอบ
- **QA ควรเข้ามาตั้งแต่ขั้นออกแบบ** — test case ที่เขียนตั้งแต่ต้นทำให้ทีมพัฒนารู้เกณฑ์ผ่านชัดเจนก่อนลงมือเขียนโค้ด

---

## ข้อควรรู้ก่อนใช้งาน

Prompt ชุดที่ 1 เขียนไว้ก่อนอ่านเอกสารข้อเสนอโครงการ จึงมีบางจุดที่ขัดกับ scope จริง
Skill ชุดที่ 2 แก้จุดเหล่านี้แล้วและจะเตือนทุกครั้ง:

| ประเด็น | prompt เดิม | ความจริงจากเอกสาร |
|--------|------------|------------------|
| งบพัฒนา | Flutter + Kubernetes | งบพัฒนาซอฟต์แวร์จริง 300,000 บาท จาก 850,000 |
| แพลตฟอร์ม | Native Mobile App | เอกสารระบุ "ระบบเว็บ" — PWA เหมาะกว่าในบริบท Expo |
| โหลด | "คนหลักหมื่นพร้อมกัน" | คำนวณจริงได้ ~0.6 req/s ตอน peak |
| E-commerce | ตัดสต็อก + ชำระเงิน | เฟส 1 มีแค่บันทึกความสนใจ ให้ฝ่ายขายติดต่อกลับ |
| AI แปล/TTS/Heatmap | ระบุเป็นฟีเจอร์หลัก | ไม่มีในเอกสาร = นอกงบ 850k |
| Carbon Credit | คำนวณในระบบ | ต้องผ่านการรับรอง T-VER ระบบทำได้แค่ "ประมาณการ" |
| Traffic คู่แข่ง | ให้ AI วิเคราะห์เอง | AI เข้าถึงข้อมูลนี้ไม่ได้ — skill เปลี่ยนเป็นออกแบบวิธีเก็บข้อมูลให้คนทำ |
