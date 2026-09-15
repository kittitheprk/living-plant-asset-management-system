# Team Skills — 10 ตำแหน่ง

ชุด Skill สำหรับโครงการ **ระบบบริหารสินทรัพย์พืชมีชีวิตและช่องทางการขายผ่าน QR Code**
งานมหกรรมพืชสวนโลกจังหวัดอุดรธานี พ.ศ. 2569

## ความต่างจากไฟล์ prompt เดิม

ไฟล์ `01-10-*.md` ในโฟลเดอร์นี้คือ **System Prompt** สำหรับแพลตฟอร์ม Agent ภายนอก
(OpenAI GPTs, CrewAI, Dify, Langflow)

ไฟล์ `.skill` คือ **Skill สำหรับ Claude** ที่ต่างออกไปตรงที่

| | prompt เดิม | .skill |
|---|---|---|
| ความยาว | ~10 บรรทัด | SKILL.md 4,000-7,000 ตัวอักษร + reference files |
| ข้อมูลโครงการ | ไม่มี | ฝังข้อเท็จจริงจาก PDF ข้อเสนอโครงการทั้งหมด (งบ, KPI, ความเสี่ยง, schema) |
| โค้ด | ไม่มี | schema.sql, PHP, JavaScript, SQL, bash ที่ copy ไปใช้ได้จริง |
| การเลือกเทคโนโลยี | ระบุ Flutter/K8s ลอยๆ | แยก Track A (งบจริง) / Track B (เฟส 2) พร้อมเกณฑ์ตัดสิน |
| การเรียกใช้ | ต้องเลือกเอง | Claude เรียกอัตโนมัติเมื่อเจอคำที่ตรง |

## รายชื่อ Skill

| ไฟล์ | บทบาท | reference files |
|------|-------|----------------|
| `ai-orchestrator.skill` | **AI Orchestrator & Product Owner** (หัวหน้าทีม) | orchestration-playbook.md, market-research.md |
| `project-manager.skill` | Project Manager | estimation-and-risk.md |
| `uiux-designer.skill` | UI/UX Designer | screen-specs.md, thai-ux-copy.md |
| `frontend-developer.skill` | Frontend Developer | pwa-patterns.md |
| `backend-api.skill` | Backend & API | schema.sql, api-spec.md |
| `gis-maps.skill` | GIS & Maps | geo-recipes.md |
| `ai-engineer.skill` | AI Engineer | ai-architecture.md |
| `data-analytics.skill` | Data Analytics | kpi-queries.sql, carbon-calculation.md |
| `devops-cloud.skill` | DevOps & Cloud | infra-runbook.md |
| `qa-security.skill` | QA & Security | test-cases.md, security-checklist.md |

ทุก skill มี `project-context.md` และ `dual-track.md` ร่วมกัน เพื่อให้ทุกตำแหน่งยึดข้อเท็จจริงชุดเดียวกัน

## วิธีติดตั้ง

1. เปิดไฟล์ `.skill` ในแชท Claude → กดบันทึกเป็น skill (ถ้าองค์กรอนุญาต)
2. หรือแตก zip แล้ววางโฟลเดอร์ใน `.claude/skills/` ของโปรเจกต์

## วิธีเริ่มใช้งาน

**โยนโจทย์ให้ `ai-orchestrator` ก่อนเสมอ** แล้วมันจะบอกเองว่าควรเรียก skill ไหนต่อ
และในลำดับอะไร ตัวอย่างโจทย์ที่ใช้เริ่มได้เลย:

- "สัปดาห์แรกควรเริ่มจากอะไร"
- "ผู้บริหารอยากได้ระบบแปลภาษา ทำได้ไหม"
- "ตรวจงานชิ้นนี้ให้หน่อย" (แนบผลงานจาก agent ตัวอื่น)
- "ตอนนี้อยู่สัปดาห์ที่ 5 แล้ว สรุปสถานะให้ผู้บริหารหน่อย"

Orchestrator ถูกเขียนไม่ให้ลงมือทำงานเฉพาะทางแทนลูกทีม — ถ้าโจทย์เป็นเรื่อง schema
มันจะเรียก `backend-api` ไม่ใช่ออกแบบเอง

## จุดสำคัญที่ skill เหล่านี้ยึดไว้

ระหว่างทำ skill พบว่า prompt เดิมบางข้อขัดกับเอกสารข้อเสนอโครงการ
skill จึงถูกเขียนให้เตือนเรื่องเหล่านี้ทุกครั้ง:

1. **งบพัฒนาซอฟต์แวร์จริงคือ 300,000 บาท** จาก 850,000 บาท ที่เหลือเป็นค่าสำรวจ ผลิต QR อบรม hosting
   → Flutter 2 platform + Kubernetes กินงบหมดก่อนเริ่มทำ backend

2. **โหลดจริงประมาณ 0.6 req/s ตอน peak** VPS เดียว + Cloudflare รับได้เกินพอ 300 เท่า
   → ปัญหาจริงคือความเสถียรและ backup ไม่ใช่ scale

3. **ฟีเจอร์ AI แปลภาษา, TTS, Heatmap, Carbon Credit ไม่มีในเอกสารข้อเสนอ**
   → skill จะติดป้าย "นอกงบเดิม" ทุกครั้งพร้อมประมาณการเพิ่ม

4. **เฟส 1 ไม่มีระบบชำระเงินและไม่มีการตัดสต็อกอัตโนมัติ** มีแค่บันทึกความสนใจแล้วให้ฝ่ายขายติดต่อกลับ

5. **"Carbon Credit" ต้องผ่านการรับรอง T-VER** ซอฟต์แวร์คำนวณเองไม่ได้
   → skill ใช้คำว่า "ประมาณการคาร์บอนสะสม" พร้อม disclaimer เสมอ

6. **GPS คลาดเคลื่อน 10-50 เมตร แต่ต้นไม้ห่างกัน 3-8 เมตร**
   → QR คือตัวระบุหลัก GPS เป็นข้อมูลประกอบเท่านั้น

7. **ราคาบนหน้า public คือความเสี่ยงสูงสุด (R3)**
   → schema มี `stock_verified_at` และซ่อนราคาอัตโนมัติถ้าไม่ได้ตรวจเกิน 7 วัน

8. **AI เข้าถึงข้อมูล traffic/ยอดดาวน์โหลดของคู่แข่งไม่ได้**
   → `ai-orchestrator` จะออกแบบวิธีเก็บข้อมูลให้คนไปทำเอง แทนการแต่งตัวเลข
   และบังคับแยกรายงานเป็น 3 กล่อง: รู้แน่ / ตั้งสมมติฐาน / ยังไม่รู้

---

## หมายเหตุการเปลี่ยนชื่อ

ชุดนี้ตัดคำนำหน้า `udon-` ออกแล้ว ชื่อเดิมกับชื่อใหม่เทียบกันดังนี้

| ชื่อเดิม | ชื่อใหม่ |
|---------|---------|
| `udon-orchestrator` | `ai-orchestrator` |
| `udon-pm` | `project-manager` |
| `udon-uiux` | `uiux-designer` |
| `udon-frontend` | `frontend-developer` |
| `udon-backend` | `backend-api` |
| `udon-gis` | `gis-maps` |
| `udon-ai` | `ai-engineer` |
| `udon-analytics` | `data-analytics` |
| `udon-devops` | `devops-cloud` |
| `udon-qa` | `qa-security` |

การอ้างอิงข้ามกันภายใน skill (เช่น ตารางมอบหมายงานใน `ai-orchestrator`) ถูกแก้ให้ตรงกับชื่อใหม่แล้ว

**ไฟล์ `udon-*.skill` เดิมยังอยู่ในโฟลเดอร์นี้ — ลบทิ้งได้เลย** ไม่งั้นจะมี skill ซ้ำกัน 2 ชุด
