-- =====================================================================
-- Living Plant Asset & Nursery Stock Management System
-- งานมหกรรมพืชสวนโลกจังหวัดอุดรธานี พ.ศ. 2569
-- MySQL 8.0 / MariaDB 10.6+
--
-- หลักการออกแบบ:
--  1. Tree ID (plant_code) ไม่ผูกกับ zone หรือ species — ต้นไม้ย้ายได้
--  2. การย้าย = insert ลง plant_location_history ไม่ใช่ update ทับ
--  3. ข้อมูลสาธารณะต้องผ่าน verified ก่อน published
--  4. ทุกตารางมี audit trail (created_at / updated_at / created_by)
-- =====================================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';

-- ---------------------------------------------------------------------
-- ผู้ใช้งานระบบ
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,           -- password_hash() bcrypt เท่านั้น
  full_name     VARCHAR(120) NOT NULL,
  role          ENUM('staff','sales','admin') NOT NULL DEFAULT 'staff',
  phone         VARCHAR(20)  NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  last_login_at DATETIME     NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- โซน — พื้นที่จัดแสดง
-- ---------------------------------------------------------------------
CREATE TABLE zones (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_code     VARCHAR(20)  NOT NULL UNIQUE,    -- เช่น 'UD-A', 'UD-B'
  name_th       VARCHAR(120) NOT NULL,
  name_en       VARCHAR(120) NULL,
  description   TEXT         NULL,
  -- polygon ขอบเขตโซน เก็บเป็น GeoJSON coordinates array
  -- ใช้ JSON แทน SPATIAL เพื่อให้ export/อ่านง่ายและไม่ผูกกับ MySQL version
  boundary_geojson JSON      NULL,
  center_lat    DECIMAL(10,7) NULL,              -- จุดกึ่งกลางไว้ center แผนที่
  center_lng    DECIMAL(10,7) NULL,
  owner_user_id INT UNSIGNED NULL,               -- หัวหน้าโซนผู้รับรองข้อมูล
  target_plant_count INT UNSIGNED NULL,          -- เป้าจำนวนต้นไม้ ใช้คำนวณ % ความครบถ้วน
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_zone_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- ชนิดพืช — master data ใช้ร่วมกันหลายต้น
-- ---------------------------------------------------------------------
CREATE TABLE species (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  species_code    VARCHAR(30)  NOT NULL UNIQUE,  -- เช่น 'SP-00042'
  name_th         VARCHAR(150) NOT NULL,         -- ชื่อไทย — แสดงเป็นหลัก
  name_common_en  VARCHAR(150) NULL,             -- ชื่อสามัญอังกฤษ
  name_scientific VARCHAR(180) NULL,             -- ชื่อวิทยาศาสตร์
  family          VARCHAR(100) NULL,
  story_th        TEXT         NULL,             -- เรื่องราว แสดงหน้า public
  story_en        TEXT         NULL,
  care_light      VARCHAR(80)  NULL,             -- 'แดดจัด' / 'ร่มรำไร'
  care_water      VARCHAR(80)  NULL,
  care_soil       VARCHAR(80)  NULL,
  care_note_th    TEXT         NULL,
  -- ค่าคงที่สำหรับคำนวณคาร์บอน (เฟส 2) — เก็บไว้ตั้งแต่ต้นจะได้ไม่ต้อง migrate
  wood_density    DECIMAL(5,3) NULL,             -- g/cm3
  growth_form     ENUM('tree','shrub','palm','herb','vine','other') DEFAULT 'tree',
  default_image   VARCHAR(255) NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_species_name_th (name_th),
  FULLTEXT KEY ft_species_search (name_th, name_common_en, name_scientific)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- ทะเบียนต้นไม้ — ตารางหัวใจของระบบ
-- ---------------------------------------------------------------------
CREATE TABLE plants (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plant_code     VARCHAR(20)  NOT NULL UNIQUE,   -- Tree ID: NN-UD-000001 ห้ามเปลี่ยนตลอดชีพ
  species_id     INT UNSIGNED NULL,              -- NULL ได้ ระหว่างรอนักวิชาการระบุชนิด
  zone_id        INT UNSIGNED NULL,              -- ตำแหน่งปัจจุบัน เปลี่ยนได้
  lat            DECIMAL(10,7) NULL,
  lng            DECIMAL(10,7) NULL,
  gps_accuracy_m DECIMAL(6,2) NULL,              -- ความแม่นยำ GPS ตอนบันทึก (เมตร)
  landmark_note  VARCHAR(255) NULL,              -- "ข้างศาลาที่ 3" — กัน GPS คลาดเคลื่อน

  -- สถานะข้อมูล: ควบคุมว่าอะไรออกสู่สาธารณะได้ (ตอบความเสี่ยง R1)
  data_status    ENUM('draft','verified','published') NOT NULL DEFAULT 'draft',
  verified_by    INT UNSIGNED NULL,
  verified_at    DATETIME     NULL,

  -- สถานะต้นไม้จริง
  life_status    ENUM('alive','moved','removed','dead') NOT NULL DEFAULT 'alive',
  health_status  ENUM('good','watch','critical','unknown') NOT NULL DEFAULT 'unknown',

  -- ค่าล่าสุด denormalize มาจาก observations เพื่อไม่ต้อง JOIN ตอนแสดงหน้า public
  latest_height_m       DECIMAL(6,2) NULL,
  latest_canopy_m       DECIMAL(6,2) NULL,
  latest_observed_at    DATETIME     NULL,

  is_for_sale    TINYINT(1)   NOT NULL DEFAULT 0, -- โชว์ปุ่มสนใจซื้อหรือไม่
  main_image     VARCHAR(255) NULL,
  public_note_th TEXT         NULL,               -- หมายเหตุที่แสดงสาธารณะได้
  internal_note  TEXT         NULL,               -- ห้ามส่งออก API public เด็ดขาด

  created_by     INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_plant_species FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE SET NULL,
  CONSTRAINT fk_plant_zone    FOREIGN KEY (zone_id)    REFERENCES zones(id)   ON DELETE SET NULL,
  CONSTRAINT fk_plant_creator FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL,
  CONSTRAINT fk_plant_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_plants_zone_status  (zone_id, data_status, life_status),
  INDEX idx_plants_species      (species_id),
  INDEX idx_plants_public       (data_status, life_status, is_for_sale),
  INDEX idx_plants_health       (health_status, zone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- ประวัติการย้ายตำแหน่ง (ตอบความเสี่ยง R2 — ห้าม update ทับ)
-- ---------------------------------------------------------------------
CREATE TABLE plant_location_history (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plant_id     INT UNSIGNED NOT NULL,
  from_zone_id INT UNSIGNED NULL,
  to_zone_id   INT UNSIGNED NULL,
  from_lat     DECIMAL(10,7) NULL,
  from_lng     DECIMAL(10,7) NULL,
  to_lat       DECIMAL(10,7) NULL,
  to_lng       DECIMAL(10,7) NULL,
  reason       VARCHAR(255) NULL,
  moved_at     DATETIME     NOT NULL,
  created_by   INT UNSIGNED NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_plh_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  INDEX idx_plh_plant (plant_id, moved_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- บันทึกการสำรวจ — ข้อมูลที่เจ้าหน้าที่กรอกหน้างาน
-- ---------------------------------------------------------------------
CREATE TABLE observations (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plant_id      INT UNSIGNED NOT NULL,
  observed_at   DATETIME     NOT NULL,
  height_m      DECIMAL(6,2) NULL,
  canopy_m      DECIMAL(6,2) NULL,              -- ขนาดทรงพุ่ม
  dbh_cm        DECIMAL(6,2) NULL,              -- เส้นรอบวงลำต้นที่ความสูงอก (เฟส 2 ใช้คำนวณคาร์บอน)
  health_status ENUM('good','watch','critical') NOT NULL,
  health_note   TEXT         NULL,
  observer_id   INT UNSIGNED NULL,
  -- กันข้อมูลซ้ำจาก offline sync ที่ส่งซ้ำ: client สร้าง uuid มาด้วย
  client_uuid   CHAR(36)     NULL UNIQUE,
  synced_at     DATETIME     NULL,              -- NULL = ยังไม่ sync จากเครื่อง
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_obs_plant    FOREIGN KEY (plant_id)    REFERENCES plants(id) ON DELETE CASCADE,
  CONSTRAINT fk_obs_observer FOREIGN KEY (observer_id) REFERENCES users(id)  ON DELETE SET NULL,
  INDEX idx_obs_plant_date (plant_id, observed_at DESC),
  INDEX idx_obs_observer   (observer_id, observed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- รูปภาพ
-- ---------------------------------------------------------------------
CREATE TABLE plant_images (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plant_id       INT UNSIGNED NOT NULL,
  observation_id BIGINT UNSIGNED NULL,
  file_path      VARCHAR(255) NOT NULL,          -- เก็บนอก webroot เสิร์ฟผ่าน script
  thumb_path     VARCHAR(255) NULL,
  caption        VARCHAR(255) NULL,
  is_public      TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order     SMALLINT     NOT NULL DEFAULT 0,
  file_size      INT UNSIGNED NULL,
  uploaded_by    INT UNSIGNED NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_img_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  CONSTRAINT fk_img_obs   FOREIGN KEY (observation_id) REFERENCES observations(id) ON DELETE SET NULL,
  INDEX idx_img_plant (plant_id, is_public, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- ประวัติการดูแล
-- ---------------------------------------------------------------------
CREATE TABLE maintenance_logs (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plant_id     INT UNSIGNED NOT NULL,
  activity     ENUM('water','fertilize','prune','pest_control','transplant','support','other') NOT NULL,
  activity_note VARCHAR(255) NULL,
  performed_at DATETIME     NOT NULL,
  performed_by INT UNSIGNED NULL,
  client_uuid  CHAR(36)     NULL UNIQUE,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ml_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE,
  CONSTRAINT fk_ml_user  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_ml_plant_date (plant_id, performed_at DESC),
  INDEX idx_ml_activity   (activity, performed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- QR Code — ผูกกับ Tree ID ไม่ผูกกับตำแหน่ง
-- ---------------------------------------------------------------------
CREATE TABLE qr_tags (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tag_code     VARCHAR(30)  NOT NULL UNIQUE,     -- รหัสบนป้ายจริง
  plant_id     INT UNSIGNED NULL,                -- NULL = ป้ายที่ผลิตแล้วยังไม่ผูกต้น
  target_url   VARCHAR(255) NOT NULL,            -- https://plants.example.org/p/NN-UD-000001
  status       ENUM('printed','installed','damaged','retired') NOT NULL DEFAULT 'printed',
  installed_at DATETIME     NULL,
  last_checked_at DATETIME  NULL,                -- ตรวจสแกนได้จริงล่าสุด (ทุก 2 สัปดาห์)
  scan_count   INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_qr_plant FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL,
  INDEX idx_qr_status (status, last_checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- สต็อกเรือนเพาะชำ — ผูกกับ species เป็นหลัก ไม่ใช่ต้นที่จัดแสดง
-- ---------------------------------------------------------------------
CREATE TABLE nursery_stock (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  species_id      INT UNSIGNED NOT NULL,
  size_label      VARCHAR(60)  NOT NULL,          -- 'สูง 1-2 ม.' / 'ถุงดำ 12 นิ้ว'
  quantity        INT          NOT NULL DEFAULT 0,
  price           DECIMAL(12,2) NULL,
  currency        CHAR(3)      NOT NULL DEFAULT 'THB',
  sale_status     ENUM('available','low','out','not_for_sale') NOT NULL DEFAULT 'available',
  -- ตอบความเสี่ยง R3: ถ้าตรวจสอบนานเกิน 7 วัน ให้ซ่อนราคาบนหน้า public อัตโนมัติ
  stock_verified_at DATETIME   NULL,
  verified_by     INT UNSIGNED NULL,
  contact_channel VARCHAR(120) NULL,
  note            VARCHAR(255) NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_species FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_stock_species (species_id, sale_status),
  INDEX idx_stock_stale   (stock_verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- ความสนใจของผู้เข้าชม — มีข้อมูลส่วนบุคคล ต้องระวัง PDPA
-- ---------------------------------------------------------------------
CREATE TABLE interest_events (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plant_id       INT UNSIGNED NULL,               -- ผูกกับ Tree ID ตาม KPI
  species_id     INT UNSIGNED NULL,
  event_type     ENUM('scan','view','interest','price_request','share') NOT NULL,

  -- ข้อมูลติดต่อ: มีเฉพาะ price_request/interest เท่านั้น
  contact_name   VARCHAR(120) NULL,
  contact_phone  VARCHAR(30)  NULL,
  contact_note   VARCHAR(255) NULL,
  consent_at     DATETIME     NULL,               -- PDPA: ต้องมีค่าถ้ามี contact_*
  purge_after    DATE         NULL,               -- ลบอัตโนมัติ (90 วันหลังจบงาน)

  -- ข้อมูลไม่ระบุตัวตน ใช้ทำ analytics
  session_hash   CHAR(64)     NULL,               -- SHA-256 ไม่ใช่ IP ดิบ
  zone_id        INT UNSIGNED NULL,
  user_agent_type ENUM('ios','android','other') NULL,
  lang           VARCHAR(10)  NULL,

  -- สถานะติดตาม Lead (KPI: ทุกการกดสนใจต้องมีสถานะติดตาม)
  lead_status    ENUM('new','contacted','quoted','won','lost','no_contact') NOT NULL DEFAULT 'new',
  assigned_to    INT UNSIGNED NULL,
  followed_up_at DATETIME     NULL,
  lead_note      TEXT         NULL,

  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_ie_plant   FOREIGN KEY (plant_id)   REFERENCES plants(id)  ON DELETE SET NULL,
  CONSTRAINT fk_ie_species FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE SET NULL,
  CONSTRAINT fk_ie_user    FOREIGN KEY (assigned_to) REFERENCES users(id)  ON DELETE SET NULL,

  INDEX idx_ie_plant_type (plant_id, event_type, created_at DESC),
  INDEX idx_ie_lead       (lead_status, created_at DESC),
  INDEX idx_ie_daily      (event_type, created_at),
  INDEX idx_ie_purge      (purge_after)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Audit log — ตอบข้อกำหนดตรวจสอบย้อนหลังได้
-- ---------------------------------------------------------------------
CREATE TABLE audit_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NULL,
  action      VARCHAR(60)  NOT NULL,              -- 'plant.update', 'stock.price_change'
  entity_type VARCHAR(40)  NOT NULL,
  entity_id   VARCHAR(40)  NOT NULL,
  changes     JSON         NULL,                  -- {"field":{"old":x,"new":y}}
  ip_hash     CHAR(64)     NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_entity (entity_type, entity_id, created_at DESC),
  INDEX idx_audit_user   (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- VIEW ที่ใช้บ่อย
-- =====================================================================

-- ความครบถ้วนข้อมูลตามโซน (KPI ≥ 95%)
CREATE OR REPLACE VIEW v_zone_completeness AS
SELECT
  z.id                AS zone_id,
  z.zone_code,
  z.name_th,
  COUNT(p.id)                                             AS total_plants,
  SUM(p.data_status = 'published')                        AS published_count,
  SUM(p.species_id IS NOT NULL
      AND p.main_image IS NOT NULL
      AND p.health_status <> 'unknown')                   AS complete_count,
  ROUND(100.0 * SUM(p.species_id IS NOT NULL
      AND p.main_image IS NOT NULL
      AND p.health_status <> 'unknown')
      / NULLIF(COUNT(p.id),0), 1)                         AS completeness_pct
FROM zones z
LEFT JOIN plants p ON p.zone_id = z.id AND p.life_status = 'alive'
WHERE z.is_active = 1
GROUP BY z.id, z.zone_code, z.name_th;

-- ต้นไม้ยอดนิยม (KPI: รายงานต้นที่ได้รับความสนใจสูงสุด)
CREATE OR REPLACE VIEW v_popular_plants AS
SELECT
  p.plant_code,
  s.name_th AS species_name,
  z.name_th AS zone_name,
  SUM(ie.event_type = 'scan')          AS scans,
  SUM(ie.event_type = 'interest')      AS interests,
  SUM(ie.event_type = 'price_request') AS price_requests
FROM plants p
LEFT JOIN interest_events ie ON ie.plant_id = p.id
LEFT JOIN species s ON s.id = p.species_id
LEFT JOIN zones   z ON z.id = p.zone_id
GROUP BY p.id, p.plant_code, s.name_th, z.name_th
HAVING scans > 0
ORDER BY price_requests DESC, interests DESC, scans DESC;

-- =====================================================================
-- ข้อมูลตั้งต้น
-- =====================================================================
INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2y$10$REPLACE_WITH_REAL_HASH', 'ผู้ดูแลระบบ', 'admin');

INSERT INTO zones (zone_code, name_th, name_en, target_plant_count) VALUES
('UD-A', 'โซนนำร่อง A', 'Pilot Zone A', 150);

-- =====================================================================
-- ฟังก์ชันสร้าง Tree ID — ห้ามให้ผู้ใช้ตั้งเอง (ตอบความเสี่ยง R1)
-- ใช้ transaction + FOR UPDATE ป้องกันเลขซ้ำเมื่อมีคนบันทึกพร้อมกัน
-- =====================================================================
-- ตัวอย่างการเรียกใช้ใน PHP:
--   $pdo->beginTransaction();
--   $n = $pdo->query("SELECT MAX(CAST(SUBSTRING(plant_code,7) AS UNSIGNED))
--                     FROM plants FOR UPDATE")->fetchColumn();
--   $code = sprintf('NN-UD-%06d', $n + 1);
--   ... INSERT ...
--   $pdo->commit();
