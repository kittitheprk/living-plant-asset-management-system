/**
 * =====================================================================
 * Living Plant Asset Management System (LPAMS) - API & Data Bridge Layer
 * งานมหกรรมพืชสวนโลกจังหวัดอุดรธานี พ.ศ. 2569
 * 
 * Complies with schema.sql & ข้อเสนอโครงการระบบบริหารสินทรัพย์พืชมีชีวิต.pdf
 * =====================================================================
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PLANTS: 'lpams_plants_registry',
    SPECIES: 'lpams_species_master',
    ZONES: 'lpams_zones_master',
    OBSERVATIONS: 'lpams_observations',
    MAINTENANCE: 'lpams_maintenance_logs',
    LOCATION_HISTORY: 'lpams_location_history',
    NURSERY_STOCK: 'lpams_nursery_stock',
    LEADS: 'lpams_interest_leads',
    QR_TAGS: 'lpams_qr_tags',
    AUDIT_LOGS: 'lpams_audit_logs',
    SETTINGS: 'lpams_system_settings'
  };

  // 1. Initial Master Species Dataset
  const DEFAULT_SPECIES = [
    {
      id: 1,
      speciesCode: "SP-ORC-001",
      nameTh: "กล้วยไม้หวายอุดรซันไชน์",
      nameEn: "Udon Sunshine Dendrobium",
      nameScientific: "Dendrobium bigibbum var. udon",
      family: "Orchidaceae",
      careLight: "แดดรำไร 50-70%",
      careWater: "รดน้ำวันเว้นวัน",
      careSoil: "กาบมะพร้าว/ถ่านไม้",
      woodDensity: 0.45,
      growthForm: "herb",
      defaultImage: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&auto=format&fit=crop&q=80",
      storyTh: "กล้วยไม้หวายลูกผสมเอกลักษณ์ประจำจังหวัดอุดรธานี กลิ่นหอมละมุน ช่อดอกบานทนทานกว่า 3 สัปดาห์",
      storyEn: "Iconic hybrid orchid of Udon Thani, noted for its sweet fragrance and durable blooms.",
      priceEstimate: 450
    },
    {
      id: 2,
      speciesCode: "SP-ORC-002",
      nameTh: "กล้วยไม้ช้างกระอุดรธานี",
      nameEn: "Giant Rhynchostylis Orchid",
      nameScientific: "Rhynchostylis gigantea (Lindl.) Ridl.",
      family: "Orchidaceae",
      careLight: "แดดรำไร 60%",
      careWater: "รดน้ำเช้า-เย็น",
      careSoil: "แขวนโปร่ง/กระเช้าไม้สัก",
      woodDensity: 0.42,
      growthForm: "herb",
      defaultImage: "https://images.unsplash.com/photo-1566982267686-eef250c0c04f?w=600&auto=format&fit=crop&q=80",
      storyTh: "กล้วยไม้อิงอาศัยขนาดใหญ่ ช่อดอกห้อยยาว ดอกสีขาวประจุดม่วงแดง กลิ่นหอมแรงยามเช้า",
      storyEn: "Magnificent epiphyte orchid with dense cascading white-and-purple blooms.",
      priceEstimate: 550
    },
    {
      id: 3,
      speciesCode: "SP-WET-001",
      nameTh: "บัวหลวงหนองแดราชินี",
      nameEn: "Nong Daeng Sacred Lotus",
      nameScientific: "Nelumbo nucifera Gaertn.",
      family: "Nelumbonaceae",
      careLight: "แดดจัดเต็มวัน 100%",
      careWater: "น้ำนิ่งลึก 30-60 ซม.",
      careSoil: "ดินเหนียวท้องบึงหนองแด",
      woodDensity: 0.35,
      growthForm: "herb",
      defaultImage: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
      storyTh: "บัวหลวงพันธุ์พื้นเมืองทรงคุณค่าแห่งพื้นที่ชุ่มน้ำหนองแด ดอกสีชมพูซ้อนกลีบงาม ฟอกน้ำและรักษาระบบนิเวศ",
      storyEn: "Native sacred lotus of Nong Daeng wetlands with layered pink petals and natural bio-filtration.",
      priceEstimate: 180
    },
    {
      id: 4,
      speciesCode: "SP-WET-002",
      nameTh: "บัวผันฉลองขวัญสีม่วงคราม",
      nameEn: "King of Siam Water Lily",
      nameScientific: "Nymphaea 'Chalong Kwan'",
      family: "Nymphaeaceae",
      careLight: "แดดจัด 6-8 ชม.",
      careWater: "น้ำลึก 20-40 ซม.",
      careSoil: "ดินเหนียวผสมปุ๋ยบัว",
      woodDensity: 0.32,
      growthForm: "herb",
      defaultImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      storyTh: "บัวประดับระดับโลก กลีบดอกซ้อนสีม่วงครามเข้ม บานตลอดทั้งวัน",
      storyEn: "Award-winning King of Siam water lily boasting vivid royal purple-blue double petals.",
      priceEstimate: 220
    },
    {
      id: 5,
      speciesCode: "SP-CAC-001",
      nameTh: "อิชิเวเรียหินกุหลาบอีสาน",
      nameEn: "Isan Rose Echeveria",
      nameScientific: "Echeveria elegans 'Isan Rose'",
      family: "Crassulaceae",
      careLight: "แดดเช้า 4-6 ชม.",
      careWater: "สัปดาห์ละ 1 ครั้ง",
      careSoil: "ดินแคคตัสโปร่งระบายน้ำดี",
      woodDensity: 0.28,
      growthForm: "succulent",
      defaultImage: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&auto=format&fit=crop&q=80",
      storyTh: "ไม้อวบน้ำรูปทรงกุหลาบ ใบหนาเคลือบแป้งนวล ทนแล้งสูง เพาะพันธุ์ในเรือนเพาะชำอุดรธานี",
      storyEn: "Rose-shaped succulent with powdery blue-green leaves, adapted for hot climates.",
      priceEstimate: 120
    },
    {
      id: 6,
      speciesCode: "SP-IND-001",
      nameTh: "มอนสเตอร่าเดลิซิโอซา เอ็กซ์โป",
      nameEn: "Giant Expo Monstera",
      nameScientific: "Monstera deliciosa Liebm.",
      family: "Araceae",
      careLight: "แสงรำไรในร่ม 40-60%",
      careWater: "สัปดาห์ละ 2 ครั้ง",
      careSoil: "ดินก้ามปูผสมเพอร์ไลต์",
      woodDensity: 0.55,
      growthForm: "vine",
      defaultImage: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80",
      storyTh: "ราชินีแห่งไม้ใบฟอกอากาศ ใบฉลุลายสมบูรณ์แบบ เพิ่มความสดชื่นและลดสารพิษในอาคาร",
      storyEn: "Queen of tropical foliage plants with iconic perforated leaves and high air purification rate.",
      priceEstimate: 690
    },
    {
      id: 7,
      speciesCode: "SP-FLO-001",
      nameTh: "กุหลาบมอญจุฬาลงกรณ์กลิ่นหอม",
      nameEn: "Chulalongkorn Damask Rose",
      nameScientific: "Rosa damascena Mill.",
      family: "Rosaceae",
      careLight: "แดดจัดเต็มวัน 100%",
      careWater: "รดน้ำทุกเช้า",
      careSoil: "ดินร่วนระบายน้ำดีผสมอินทรียวัตถุ",
      woodDensity: 0.48,
      growthForm: "shrub",
      defaultImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80",
      storyTh: "กุหลาบไร้หนามกลีบสีชมพู กลิ่นหอมฟุ้งจรุงใจ นำไปแปรรูปเป็นชากุหลาบและน้ำมันหอมระเหย",
      storyEn: "Thornless heritage rose known for intense perfume and herbal edible petals.",
      priceEstimate: 250
    },
    {
      id: 8,
      speciesCode: "SP-ISA-001",
      nameTh: "ต้นครามย้อมผ้าธรรมชาติวิถีอีสาน",
      nameEn: "True Indigo Plant",
      nameScientific: "Indigofera tinctoria L.",
      family: "Fabaceae",
      careLight: "แดดจัดเต็มวัน 100%",
      careWater: "รดน้ำวันละ 1 ครั้ง",
      careSoil: "ดินร่วนปนทราย",
      woodDensity: 0.60,
      growthForm: "shrub",
      defaultImage: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&auto=format&fit=crop&q=80",
      storyTh: "พืชภูมิปัญญาเศรษฐกิจอีสาน ใบหมักสกัดได้เม็ดสีครามธรรมชาติสำหรับย้อมผ้าไหมและผ้าฝ้าย",
      storyEn: "Traditional botanical dye plant used in authentic handwoven Isan indigo textiles.",
      priceEstimate: 150
    }
  ];

  // 2. Initial Master Zones Dataset (Official Expo Masterplan Zones)
  const DEFAULT_ZONES = [
    { id: 1, zoneCode: "ZONE-A", nameTh: "อาคารจัดแสดงกล้วยไม้", nameEn: "Orchid Exhibition Building", color: "#10b981", icon: "🌸", targetCount: 45, currentCount: 38, leadArborist: "ดร.นิธิศ (หัวหน้าหมวดกล้วยไม้)", centerLat: 13.73970, centerLng: 100.42148 },
    { id: 2, zoneCode: "ZONE-B", nameTh: "สระบึงบัว & ทางเดินชุ่มน้ำ", nameEn: "Bung-Bua Wetland Experience", color: "#0284c7", icon: "🪷", targetCount: 60, currentCount: 52, leadArborist: "นายพงศ์พัฒน์ (นักวิชาการพื้นที่ชุ่มน้ำ)", centerLat: 13.72819, centerLng: 100.45060 },
    { id: 3, zoneCode: "ZONE-C", nameTh: "อาคารจัดแสดงกระบองเพชร", nameEn: "Cactus & Succulents", color: "#f59e0b", icon: "🌵", targetCount: 50, currentCount: 44, leadArborist: "นางสาวศิริพร (ผู้เชี่ยวชาญไม้อวบน้ำ)", centerLat: 13.72238, centerLng: 100.46414 },
    { id: 4, zoneCode: "ZONE-D", nameTh: "อาคารเรือนไม้ในร่ม", nameEn: "Indoor Plant Building", color: "#8b5cf6", icon: "🌿", targetCount: 40, currentCount: 35, leadArborist: "นายอนันต์ (ฝ่ายภูมิทัศน์ในร่ม)", centerLat: 13.72256, centerLng: 100.43656 },
    { id: 5, zoneCode: "ZONE-E", nameTh: "สวนไม้ดอกประดับกลางแจ้ง", nameEn: "Flower & Ornamental Garden", color: "#ec4899", icon: "🌺", targetCount: 75, currentCount: 68, leadArborist: "นางกานดา (ฝ่ายพืชสวนประดับ)", centerLat: 13.73432, centerLng: 100.46093 },
    { id: 6, zoneCode: "ZONE-F", nameTh: "หมู่บ้านเกษตรวิถีอีสาน", nameEn: "Isan Village", color: "#14b8a6", icon: "🏡", targetCount: 35, currentCount: 30, leadArborist: "นายคำดี (ปราชญ์เกษตรพื้นบ้าน)", centerLat: 13.73837, centerLng: 100.44723 },
    { id: 7, zoneCode: "ZONE-G", nameTh: "สวนนานาชาติกลางแจ้ง", nameEn: "International Gardens", color: "#f97316", icon: "🌍", targetCount: 55, currentCount: 42, leadArborist: "นายโรเบิร์ต (ฝ่ายประสานสวนนานาชาติ)", centerLat: 13.71950, centerLng: 100.43920 }
  ];

  // 3. Initial Core Tree Registry Dataset (Tree ID format: NN-UD-000001+)
  const DEFAULT_PLANTS = [
    {
      id: 1,
      plantCode: "NN-UD-000001",
      treeId: "UD-ORC-001",
      speciesId: 1,
      zoneId: 1,
      zoneCode: "ZONE-A",
      lat: 13.73970,
      lng: 100.42148,
      gpsAccuracy: 1.2,
      landmarkNote: "ซุ้มทางเข้าเรือนกระจกควบคุมอุณหภูมิ เสาที่ 2 ฝั่งทิศเหนือ",
      dataStatus: "published", // draft, verified, published
      lifeStatus: "alive",    // alive, moved, removed, dead
      healthStatus: "good",   // good, watch, critical, unknown
      heightM: 0.65,
      canopyM: 0.40,
      dbhCm: 2.5,
      woodDensity: 0.45,
      carbonKgYear: 3.8,
      isForSale: 1,
      price: 450,
      stockQty: 42,
      shopId: "orchid-house",
      mainImage: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&auto=format&fit=crop&q=80",
      publicNote: "ต้นแม่พันธุ์กล้วยไม้หวายอุดรซันไชน์แท้ ทรงพุ่มสมบูรณ์ ดอกบานสะพรั่งพร้อมรับผู้เข้าชม",
      internalNote: "ตรวจสภาพรากอากาศสัปดาห์ละ 1 ครั้ง ฉีดพ่นปุ๋ยสูตรเสมอ 20-20-20 ทุกวันจันทร์",
      verifiedBy: "ดร.นิธิศ (หัวหน้าหมวด)",
      verifiedAt: "2026-08-15 10:30:00",
      scanCount: 184,
      createdAt: "2026-08-01 09:00:00",
      updatedAt: "2026-08-19 14:20:00"
    },
    {
      id: 2,
      plantCode: "NN-UD-000002",
      treeId: "UD-ORC-002",
      speciesId: 2,
      zoneId: 1,
      zoneCode: "ZONE-A",
      lat: 13.73955,
      lng: 100.42162,
      gpsAccuracy: 1.5,
      landmarkNote: "แขวนบนขอนไม้สักทองจำลอง โซนกล้วยไม้ป่าหายาก",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "good",
      heightM: 0.85,
      canopyM: 0.50,
      dbhCm: 3.2,
      woodDensity: 0.42,
      carbonKgYear: 4.1,
      isForSale: 1,
      price: 550,
      stockQty: 18,
      shopId: "orchid-house",
      mainImage: "https://images.unsplash.com/photo-1566982267686-eef250c0c04f?w=600&auto=format&fit=crop&q=80",
      publicNote: "กล้วยไม้ช้างกระอุดรธานี ช่อดอกยาว 30 ซม. กลิ่นหอมสดชื่นเป็นเอกลักษณ์",
      internalNote: "รักษาความชื้นสัมพัทธ์ในอากาศไม่ต่ำกว่า 70%",
      verifiedBy: "ดร.นิธิศ (หัวหน้าหมวด)",
      verifiedAt: "2026-08-15 11:00:00",
      scanCount: 142,
      createdAt: "2026-08-01 09:15:00",
      updatedAt: "2026-08-19 15:10:00"
    },
    {
      id: 3,
      plantCode: "NN-UD-000003",
      treeId: "UD-WET-003",
      speciesId: 3,
      zoneId: 2,
      zoneCode: "ZONE-B",
      lat: 13.72819,
      lng: 100.45060,
      gpsAccuracy: 0.8,
      landmarkNote: "สระบึงบัวหนองแด แปลงทดลองที่ 1 สะพานไม้ทิศตะวันออก",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "good",
      heightM: 1.40,
      canopyM: 1.20,
      dbhCm: 4.0,
      woodDensity: 0.35,
      carbonKgYear: 5.4,
      isForSale: 1,
      price: 180,
      stockQty: 65,
      shopId: "bungbua-farm",
      mainImage: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
      publicNote: "บัวหลวงหนองแดราชินี กลีบซ้อนสีชมพูบริสุทธิ์ ฟอกน้ำธรรมชาติและสร้างร่มเงาให้สัตว์น้ำ",
      internalNote: "ตรวจวัดระดับน้ำให้อยู่ที่ 45 ซม. สม่ำเสมอ ใส่ปุ๋ยบัวอัดเม็ดทุก 15 วัน",
      verifiedBy: "นายพงศ์พัฒน์ (นักวิชาการพื้นที่ชุ่มน้ำ)",
      verifiedAt: "2026-08-16 09:30:00",
      scanCount: 220,
      createdAt: "2026-08-02 10:00:00",
      updatedAt: "2026-08-20 11:25:00"
    },
    {
      id: 4,
      plantCode: "NN-UD-000004",
      treeId: "UD-WET-004",
      speciesId: 4,
      zoneId: 2,
      zoneCode: "ZONE-B",
      lat: 13.72805,
      lng: 100.45085,
      gpsAccuracy: 1.1,
      landmarkNote: "กระถางบัวประดับริมชานเรือนพักผ่อนริมน้ำ",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "good",
      heightM: 0.90,
      canopyM: 0.85,
      dbhCm: 2.8,
      woodDensity: 0.32,
      carbonKgYear: 3.2,
      isForSale: 1,
      price: 220,
      stockQty: 30,
      shopId: "bungbua-farm",
      mainImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
      publicNote: "บัวผันฉลองขวัญ 'King of Siam' กลีบดอกสีม่วงครามซ้อนแน่น",
      internalNote: "เด็ดใบล่างที่เหลืองออกสัปดาห์ละ 2 ครั้งเพื่อกระตุ้นการออกดอก",
      verifiedBy: "นายพงศ์พัฒน์ (นักวิชาการพื้นที่ชุ่มน้ำ)",
      verifiedAt: "2026-08-16 10:15:00",
      scanCount: 165,
      createdAt: "2026-08-02 10:30:00",
      updatedAt: "2026-08-20 12:00:00"
    },
    {
      id: 5,
      plantCode: "NN-UD-000005",
      treeId: "UD-CAC-005",
      speciesId: 5,
      zoneId: 3,
      zoneCode: "ZONE-C",
      lat: 13.72238,
      lng: 100.46414,
      gpsAccuracy: 0.9,
      landmarkNote: "โดมทะเลทราย โซนจำลองเขาหินทรายอีสาน ชั้นจัดแสดงที่ 3",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "good",
      heightM: 0.25,
      canopyM: 0.30,
      dbhCm: 1.5,
      woodDensity: 0.28,
      carbonKgYear: 1.2,
      isForSale: 1,
      price: 120,
      stockQty: 85,
      shopId: "cactus-corner",
      mainImage: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&auto=format&fit=crop&q=80",
      publicNote: "อิชิเวเรียหินกุหลาบอีสาน ทรงกุหลาบสมบูรณ์ ใบอวบหนาสีฟ้าอมเขียวเคลือบแป้ง",
      internalNote: "งดรดน้ำสัมผัสใบโดยตรงเพื่อรักษาผงแป้งนวลบนใบ",
      verifiedBy: "นางสาวศิริพร (ผู้เชี่ยวชาญไม้อวบน้ำ)",
      verifiedAt: "2026-08-16 14:00:00",
      scanCount: 198,
      createdAt: "2026-08-03 08:30:00",
      updatedAt: "2026-08-20 16:40:00"
    },
    {
      id: 6,
      plantCode: "NN-UD-000006",
      treeId: "UD-IND-006",
      speciesId: 6,
      zoneId: 4,
      zoneCode: "ZONE-D",
      lat: 13.72256,
      lng: 100.43656,
      gpsAccuracy: 1.0,
      landmarkNote: "มุม Green Living อาคารเรือนไม้ในร่ม เสากลาง",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "good",
      heightM: 1.85,
      canopyM: 1.40,
      dbhCm: 6.5,
      woodDensity: 0.55,
      carbonKgYear: 6.8,
      isForSale: 1,
      price: 690,
      stockQty: 24,
      shopId: "greenroom",
      mainImage: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&auto=format&fit=crop&q=80",
      publicNote: "มอนสเตอร่าเดลิซิโอซา ฟอร์มยักษ์ ฉลุลายสมบูรณ์ 8 แฉกต่อใบ ความสูงเกือบ 2 เมตร",
      internalNote: "เช็ดใบด้วยน้ำผสมน้ำมันสะเดาเจือจางเดือนละ 2 ครั้งเพื่อป้องกันไรแดง",
      verifiedBy: "นายอนันต์ (ฝ่ายภูมิทัศน์ในร่ม)",
      verifiedAt: "2026-08-17 11:30:00",
      scanCount: 312,
      createdAt: "2026-08-04 11:00:00",
      updatedAt: "2026-08-21 09:15:00"
    },
    {
      id: 7,
      plantCode: "NN-UD-000007",
      treeId: "UD-FLO-007",
      speciesId: 7,
      zoneId: 5,
      zoneCode: "ZONE-E",
      lat: 13.73432,
      lng: 100.46093,
      gpsAccuracy: 1.3,
      landmarkNote: "แปลงกุหลาบวงกลมใจกลางสวนไม้ดอกกลางแจ้ง",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "watch",   // ติดตามอาการเพลี้ยไฟ
      heightM: 1.20,
      canopyM: 0.90,
      dbhCm: 3.8,
      woodDensity: 0.48,
      carbonKgYear: 2.6,
      isForSale: 1,
      price: 250,
      stockQty: 36,
      shopId: "flower-garden",
      mainImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80",
      publicNote: "กุหลาบมอญจุฬาลงกรณ์ ไร้หนาม ส่งกลิ่นหอมอบอวลทั่วบริเวณสวน",
      internalNote: "เฝ้าระวังเพลี้ยไฟช่วงบ่าย ใช้สารชีวภัณฑ์บิวเวอร์เรียฉีดพ่นสม่ำเสมอ",
      verifiedBy: "นางกานดา (ฝ่ายพืชสวนประดับ)",
      verifiedAt: "2026-08-17 15:45:00",
      scanCount: 175,
      createdAt: "2026-08-04 14:20:00",
      updatedAt: "2026-08-21 10:00:00"
    },
    {
      id: 8,
      plantCode: "NN-UD-000008",
      treeId: "UD-ISA-008",
      speciesId: 8,
      zoneId: 6,
      zoneCode: "ZONE-F",
      lat: 13.73837,
      lng: 100.44723,
      gpsAccuracy: 0.7,
      landmarkNote: "ข้างเรือนย้อมผ้าคราม แปลงพืชภูมิปัญญาอีสานแปลงที่ 4",
      dataStatus: "published",
      lifeStatus: "alive",
      healthStatus: "good",
      heightM: 1.50,
      canopyM: 1.10,
      dbhCm: 4.5,
      woodDensity: 0.60,
      carbonKgYear: 3.1,
      isForSale: 1,
      price: 150,
      stockQty: 50,
      shopId: "isan-craft",
      mainImage: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&auto=format&fit=crop&q=80",
      publicNote: "ต้นครามย้อมผ้าธรรมชาติ สายพันธุ์พื้นเมืองลุ่มน้ำสงคราม ให้เม็ดสีครามคุณภาพสูง",
      internalNote: "เก็บเกี่ยวใบสดช่วงเช้าตรู่ก่อนแดดจัดเพื่อให้ได้สารอินดิโกสูงสุด",
      verifiedBy: "นายคำดี (ปราชญ์เกษตร)",
      verifiedAt: "2026-08-18 08:30:00",
      scanCount: 205,
      createdAt: "2026-08-05 09:00:00",
      updatedAt: "2026-08-21 08:45:00"
    }
  ];

  // 4. Initial Observation Records (Survey history)
  const DEFAULT_OBSERVATIONS = [
    { id: 1, plantId: 1, plantCode: "NN-UD-000001", observedAt: "2026-08-19 10:15:00", heightM: 0.65, canopyM: 0.40, dbhCm: 2.5, healthStatus: "good", healthNote: "ใบเขียวสด ดอกออก 4 ช่อ รากสมบูรณ์", observer: "นายสุรชัย (นักสำรวจ)" },
    { id: 2, plantId: 2, plantCode: "NN-UD-000002", observedAt: "2026-08-19 10:30:00", heightM: 0.85, canopyM: 0.50, dbhCm: 3.2, healthStatus: "good", healthNote: "ช่อดอกสมบูรณ์ มีกลิ่นหอมชัดเจน", observer: "นายสุรชัย (นักสำรวจ)" },
    { id: 3, plantId: 6, plantCode: "NN-UD-000006", observedAt: "2026-08-20 14:00:00", heightM: 1.85, canopyM: 1.40, dbhCm: 6.5, healthStatus: "good", healthNote: "ใบใหม่คลี่ 2 ใบ ลายฉลุคมชัด ไม่มีรอยโรค", observer: "นางสาวมลฤดี (ผู้ช่วยวิจัย)" },
    { id: 4, plantId: 7, plantCode: "NN-UD-000007", observedAt: "2026-08-21 09:20:00", heightM: 1.20, canopyM: 0.90, dbhCm: 3.8, healthStatus: "watch", healthNote: "พบเพลี้ยไฟประปรายที่ยอดอ่อน ได้ฉีดพ่นชีวภัณฑ์แล้ว", observer: "นายวีระ (ฝ่ายดูแลสวน)" }
  ];

  // 5. Initial Maintenance Logs
  const DEFAULT_MAINTENANCE = [
    { id: 1, plantId: 1, plantCode: "NN-UD-000001", activity: "fertilize", note: "ฉีดพ่นปุ๋ยเกล็ดสูตร 20-20-20 ความเข้มข้น 1 กรัม/ลิตร", performedAt: "2026-08-18 07:30:00", performer: "ทีมงานเรือนกระจก A" },
    { id: 2, plantId: 3, plantCode: "NN-UD-000003", activity: "water", note: "ปรับสมดุลระดับน้ำในสระทดลองหนองแด", performedAt: "2026-08-19 08:00:00", performer: "ทีมงานชลประทานสวน" },
    { id: 3, plantId: 6, plantCode: "NN-UD-000006", activity: "support", note: "เปลี่ยนหลักค้ำยันกาบมะพร้าวความสูง 2 เมตร", performedAt: "2026-08-19 16:30:00", performer: "นายอนันต์" },
    { id: 4, plantId: 7, plantCode: "NN-UD-000007", activity: "pest_control", note: "ฉีดพ่นเชื้อราบิวเวอร์เรียกำจัดเพลี้ยไฟแปลงกุหลาบ", performedAt: "2026-08-21 07:00:00", performer: "ทีมงานอารักขาพืช" }
  ];

  // 6. Initial Visitor Interest Leads (CRM Pipeline)
  const DEFAULT_LEADS = [
    { id: 1, plantId: 1, treeId: "UD-ORC-001", plantName: "กล้วยไม้หวายอุดรซันไชน์", customerName: "คุณกิตติมา วิทยา", phone: "089-112-3344", activityType: "direct_order", quantity: 1, totalThb: 450, status: "completed", note: "ชำระผ่าน PromptPay QR นัดรับสินค้า ณ จุดรับกลาง", timestamp: "2026-08-19 14:20:00" },
    { id: 2, plantId: 6, treeId: "UD-IND-006", plantName: "มอนสเตอร่าเดลิซิโอซา เอ็กซ์โป", customerName: "ดร.ประเสริฐ สุขุม", phone: "081-445-9988", activityType: "price_request", quantity: 2, totalThb: 1380, status: "in_progress", note: "ขอใบเสนอราคาและบริการจัดส่งรถควบคุมอุณหภูมิ จ.ขอนแก่น", timestamp: "2026-08-20 11:15:00" },
    { id: 3, plantId: 3, treeId: "UD-WET-003", plantName: "บัวหลวงหนองแดราชินี", customerName: "คุณวิภาวรรณ ชัยเจริญ", phone: "086-334-5511", activityType: "interest_click", quantity: 5, totalThb: 900, status: "contacted", note: "สนใจนำไปปลูกในบ่อบัวรีสอร์ต อ.กุมภวาปี", timestamp: "2026-08-20 15:40:00" },
    { id: 4, plantId: 5, treeId: "UD-CAC-005", plantName: "อิชิเวเรียหินกุหลาบอีสาน", customerName: "คุณธนกร เลิศวิทย์", phone: "082-998-1122", activityType: "interest_click", quantity: 10, totalThb: 1200, status: "new", note: "สอบถามราคาส่งสำหรับเป็นของชำร่วยงานสัมมนา", timestamp: "2026-08-21 09:30:00" }
  ];

  // Helper: Read JSON from LocalStorage with fallback
  function readStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn(`[LPAMS_API] Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  // Helper: Write JSON to LocalStorage and broadcast event
  function writeStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('lpams_data_updated', { detail: { key, data } }));
      return true;
    } catch (e) {
      console.error(`[LPAMS_API] Error writing ${key} to storage:`, e);
      return false;
    }
  }

  // Initialize DB if not present
  function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.SPECIES)) writeStorage(STORAGE_KEYS.SPECIES, DEFAULT_SPECIES);
    if (!localStorage.getItem(STORAGE_KEYS.ZONES)) writeStorage(STORAGE_KEYS.ZONES, DEFAULT_ZONES);
    if (!localStorage.getItem(STORAGE_KEYS.PLANTS)) writeStorage(STORAGE_KEYS.PLANTS, DEFAULT_PLANTS);
    if (!localStorage.getItem(STORAGE_KEYS.OBSERVATIONS)) writeStorage(STORAGE_KEYS.OBSERVATIONS, DEFAULT_OBSERVATIONS);
    if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) writeStorage(STORAGE_KEYS.MAINTENANCE, DEFAULT_MAINTENANCE);
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) writeStorage(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
  }

  initDatabase();

  /**
   * ===================================================================
   * Public LPAMS API Engine
   * ===================================================================
   */
  const LPAMS_API = {
    // -----------------------------------------------------------------
    // 1. Plant Asset Registry (CRUD & Lifecycle)
    // -----------------------------------------------------------------
    getAllPlants(filter = {}) {
      let list = readStorage(STORAGE_KEYS.PLANTS, DEFAULT_PLANTS);
      if (filter.zoneId) list = list.filter(p => p.zoneId === Number(filter.zoneId));
      if (filter.dataStatus) list = list.filter(p => p.dataStatus === filter.dataStatus);
      if (filter.healthStatus) list = list.filter(p => p.healthStatus === filter.healthStatus);
      if (filter.isForSale !== undefined) list = list.filter(p => p.isForSale === Number(filter.isForSale));
      if (filter.query) {
        const q = filter.query.toLowerCase().trim();
        list = list.filter(p => 
          p.plantCode.toLowerCase().includes(q) || 
          p.treeId.toLowerCase().includes(q) ||
          p.landmarkNote?.toLowerCase().includes(q) ||
          this.getSpeciesById(p.speciesId)?.nameTh.toLowerCase().includes(q)
        );
      }
      return list;
    },

    getPublishedPlants() {
      return this.getAllPlants({ dataStatus: 'published', lifeStatus: 'alive' });
    },

    getPlantById(id) {
      const list = readStorage(STORAGE_KEYS.PLANTS, DEFAULT_PLANTS);
      return list.find(p => p.id === Number(id) || p.plantCode === String(id) || p.treeId === String(id)) || null;
    },

    savePlant(plantData, operatorName = "เจ้าหน้าที่ LPAMS") {
      let list = readStorage(STORAGE_KEYS.PLANTS, DEFAULT_PLANTS);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (plantData.id) {
        // Update existing plant
        const idx = list.findIndex(p => p.id === Number(plantData.id));
        if (idx !== -1) {
          const oldPlant = list[idx];
          
          // Check location change for audit log (ความเสี่ยง R2)
          if (oldPlant.zoneId !== plantData.zoneId || oldPlant.lat !== plantData.lat || oldPlant.lng !== plantData.lng) {
            this.logLocationHistory({
              plantId: oldPlant.id,
              plantCode: oldPlant.plantCode,
              fromZoneId: oldPlant.zoneId,
              toZoneId: plantData.zoneId,
              fromLat: oldPlant.lat,
              fromLng: oldPlant.lng,
              toLat: plantData.lat,
              toLng: plantData.lng,
              reason: plantData.relocationReason || "ย้ายแปลงจัดแสดงตามแผนปรับภูมิทัศน์",
              movedBy: operatorName
            });
          }

          list[idx] = { ...oldPlant, ...plantData, updatedAt: now };
          writeStorage(STORAGE_KEYS.PLANTS, list);
          this.syncZoneCounts();
          return list[idx];
        }
      }

      // Create new plant asset (Auto-generate Tree ID: NN-UD-000001+)
      const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
      const paddedCode = String(newId).padStart(6, '0');
      const plantCode = plantData.plantCode || `NN-UD-${paddedCode}`;
      const treeId = plantData.treeId || `UD-EXP-${String(newId).padStart(3, '0')}`;

      const newPlant = {
        id: newId,
        plantCode,
        treeId,
        speciesId: Number(plantData.speciesId) || 1,
        zoneId: Number(plantData.zoneId) || 1,
        zoneCode: this.getZoneById(plantData.zoneId)?.zoneCode || "ZONE-A",
        lat: Number(plantData.lat) || 13.7225,
        lng: Number(plantData.lng) || 100.4420,
        gpsAccuracy: Number(plantData.gpsAccuracy) || 1.0,
        landmarkNote: plantData.landmarkNote || "จุดสำรวจแปลงพืชสวนโลก 2569",
        dataStatus: plantData.dataStatus || "draft",
        lifeStatus: plantData.lifeStatus || "alive",
        healthStatus: plantData.healthStatus || "good",
        heightM: Number(plantData.heightM) || 1.0,
        canopyM: Number(plantData.canopyM) || 0.8,
        dbhCm: Number(plantData.dbhCm) || 3.0,
        carbonKgYear: Number(plantData.carbonKgYear) || 3.5,
        isForSale: plantData.isForSale !== undefined ? Number(plantData.isForSale) : 1,
        price: Number(plantData.price) || 350,
        stockQty: Number(plantData.stockQty) || 20,
        shopId: plantData.shopId || "orchid-house",
        mainImage: plantData.mainImage || "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&auto=format&fit=crop&q=80",
        publicNote: plantData.publicNote || "",
        internalNote: plantData.internalNote || "",
        verifiedBy: plantData.verifiedBy || null,
        verifiedAt: plantData.verifiedAt || null,
        scanCount: 0,
        createdAt: now,
        updatedAt: now
      };

      list.push(newPlant);
      writeStorage(STORAGE_KEYS.PLANTS, list);
      this.syncZoneCounts();
      return newPlant;
    },

    deletePlant(id) {
      let list = readStorage(STORAGE_KEYS.PLANTS, DEFAULT_PLANTS);
      list = list.filter(p => p.id !== Number(id));
      writeStorage(STORAGE_KEYS.PLANTS, list);
      this.syncZoneCounts();
      return true;
    },

    verifyAndPublishPlant(id, verifierName = "หัวหน้าหมวดวิชาการพืช") {
      let list = readStorage(STORAGE_KEYS.PLANTS, DEFAULT_PLANTS);
      const idx = list.findIndex(p => p.id === Number(id));
      if (idx !== -1) {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        list[idx].dataStatus = 'published';
        list[idx].verifiedBy = verifierName;
        list[idx].verifiedAt = now;
        list[idx].updatedAt = now;
        writeStorage(STORAGE_KEYS.PLANTS, list);
        return list[idx];
      }
      return null;
    },

    // -----------------------------------------------------------------
    // 2. Observations & Field Health Inspections
    // -----------------------------------------------------------------
    getObservationsByPlant(plantId) {
      const list = readStorage(STORAGE_KEYS.OBSERVATIONS, DEFAULT_OBSERVATIONS);
      return list.filter(o => o.plantId === Number(plantId)).sort((a, b) => new Date(b.observedAt) - new Date(a.observedAt));
    },

    addObservation(obsData, operatorName = "เจ้าหน้าที่สำรวจ") {
      let list = readStorage(STORAGE_KEYS.OBSERVATIONS, DEFAULT_OBSERVATIONS);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newObs = {
        id: list.length > 0 ? Math.max(...list.map(o => o.id)) + 1 : 1,
        plantId: Number(obsData.plantId),
        plantCode: obsData.plantCode || `NN-UD-${String(obsData.plantId).padStart(6, '0')}`,
        observedAt: obsData.observedAt || now,
        heightM: Number(obsData.heightM) || 0,
        canopyM: Number(obsData.canopyM) || 0,
        dbhCm: Number(obsData.dbhCm) || 0,
        healthStatus: obsData.healthStatus || "good",
        healthNote: obsData.healthNote || "",
        observer: obsData.observer || operatorName
      };

      list.push(newObs);
      writeStorage(STORAGE_KEYS.OBSERVATIONS, list);

      // Denormalize into Plant master record
      const plant = this.getPlantById(obsData.plantId);
      if (plant) {
        plant.heightM = newObs.heightM;
        plant.canopyM = newObs.canopyM;
        plant.dbhCm = newObs.dbhCm;
        plant.healthStatus = newObs.healthStatus;
        this.savePlant(plant, operatorName);
      }

      return newObs;
    },

    // -----------------------------------------------------------------
    // 3. Maintenance Logs
    // -----------------------------------------------------------------
    getMaintenanceLogs(plantId = null) {
      let list = readStorage(STORAGE_KEYS.MAINTENANCE, DEFAULT_MAINTENANCE);
      if (plantId) list = list.filter(m => m.plantId === Number(plantId));
      return list.sort((a, b) => new Date(b.performedAt) - new Date(a.performedAt));
    },

    addMaintenanceLog(logData, operatorName = "ทีมงานดูแลสวน") {
      let list = readStorage(STORAGE_KEYS.MAINTENANCE, DEFAULT_MAINTENANCE);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const newLog = {
        id: list.length > 0 ? Math.max(...list.map(m => m.id)) + 1 : 1,
        plantId: Number(logData.plantId),
        plantCode: logData.plantCode || `NN-UD-${String(logData.plantId).padStart(6, '0')}`,
        activity: logData.activity || "water", // water, fertilize, prune, pest_control, transplant, support
        note: logData.note || "",
        performedAt: logData.performedAt || now,
        performer: logData.performer || operatorName
      };

      list.push(newLog);
      writeStorage(STORAGE_KEYS.MAINTENANCE, list);
      return newLog;
    },

    // -----------------------------------------------------------------
    // 4. Relocation & Audit History
    // -----------------------------------------------------------------
    logLocationHistory(historyData) {
      let list = readStorage(STORAGE_KEYS.LOCATION_HISTORY, []);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const entry = {
        id: list.length + 1,
        ...historyData,
        movedAt: now
      };
      list.push(entry);
      writeStorage(STORAGE_KEYS.LOCATION_HISTORY, list);
      return entry;
    },

    getLocationHistory(plantId = null) {
      let list = readStorage(STORAGE_KEYS.LOCATION_HISTORY, []);
      if (plantId) list = list.filter(h => h.plantId === Number(plantId));
      return list;
    },

    // -----------------------------------------------------------------
    // 5. Visitor Leads & Commercial Pipeline (CRM)
    // -----------------------------------------------------------------
    getAllLeads() {
      return readStorage(STORAGE_KEYS.LEADS, DEFAULT_LEADS).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },

    recordVisitorLead(leadData) {
      let list = readStorage(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const plant = this.getPlantById(leadData.plantId);
      
      const newLead = {
        id: list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1,
        plantId: plant ? plant.id : 1,
        treeId: plant ? plant.treeId : (leadData.treeId || "UD-EXP-001"),
        plantName: plant ? this.getSpeciesById(plant.speciesId)?.nameTh : (leadData.plantName || "ต้นไม้จัดแสดง"),
        customerName: leadData.customerName || "ผู้เข้าชมทั่วไป",
        phone: leadData.phone || "-",
        activityType: leadData.activityType || "interest_click", // interest_click, price_request, direct_order
        quantity: Number(leadData.quantity) || 1,
        totalThb: Number(leadData.totalThb) || (plant ? plant.price : 350),
        status: leadData.status || "new", // new, contacted, in_progress, completed, cancelled
        note: leadData.note || "บันทึกความสนใจจากแอปพลิเคชันมือถือ",
        timestamp: now
      };

      list.unshift(newLead);
      writeStorage(STORAGE_KEYS.LEADS, list);

      // Increment plant scan count
      if (plant) {
        plant.scanCount = (plant.scanCount || 0) + 1;
        this.savePlant(plant);
      }

      return newLead;
    },

    updateLeadStatus(leadId, newStatus, staffNote = "") {
      let list = readStorage(STORAGE_KEYS.LEADS, DEFAULT_LEADS);
      const idx = list.findIndex(l => l.id === Number(leadId));
      if (idx !== -1) {
        list[idx].status = newStatus;
        if (staffNote) list[idx].note = `${list[idx].note} [บันทึก: ${staffNote}]`;
        writeStorage(STORAGE_KEYS.LEADS, list);
        return list[idx];
      }
      return null;
    },

    // -----------------------------------------------------------------
    // 6. Master Zones & Species
    // -----------------------------------------------------------------
    getAllZones() {
      return readStorage(STORAGE_KEYS.ZONES, DEFAULT_ZONES);
    },

    getZoneById(id) {
      const list = this.getAllZones();
      return list.find(z => z.id === Number(id) || z.zoneCode === String(id)) || null;
    },

    getAllSpecies() {
      return readStorage(STORAGE_KEYS.SPECIES, DEFAULT_SPECIES);
    },

    getSpeciesById(id) {
      const list = this.getAllSpecies();
      return list.find(s => s.id === Number(id) || s.speciesCode === String(id)) || null;
    },

    syncZoneCounts() {
      const plants = this.getAllPlants();
      let zones = this.getAllZones();
      zones = zones.map(z => {
        const count = plants.filter(p => p.zoneId === z.id && p.lifeStatus === 'alive').length;
        return { ...z, currentCount: count };
      });
      writeStorage(STORAGE_KEYS.ZONES, zones);
    },

    // -----------------------------------------------------------------
    // 7. Executive Dashboard KPIs & Analytics
    // -----------------------------------------------------------------
    getDashboardKPIs() {
      const plants = this.getAllPlants();
      const leads = this.getAllLeads();
      const zones = this.getAllZones();

      const totalLivingTrees = plants.filter(p => p.lifeStatus === 'alive').length;
      const totalPublished = plants.filter(p => p.dataStatus === 'published').length;
      const goodHealthCount = plants.filter(p => p.healthStatus === 'good').length;
      const healthIndexPct = totalLivingTrees > 0 ? Math.round((goodHealthCount / totalLivingTrees) * 100) : 100;
      
      const totalCarbonKg = plants.reduce((sum, p) => sum + (Number(p.carbonKgYear) || 0), 0);
      const totalCarbonTons = (totalCarbonKg / 1000).toFixed(2);

      const totalScans = plants.reduce((sum, p) => sum + (Number(p.scanCount) || 0), 0);
      const totalRevenue = leads.filter(l => l.status === 'completed').reduce((sum, l) => sum + (Number(l.totalThb) || 0), 0);
      const activeLeadsCount = leads.filter(l => l.status === 'new' || l.status === 'in_progress').length;

      // Completeness % across zones
      const totalTarget = zones.reduce((sum, z) => sum + (z.targetCount || 50), 0);
      const completenessPct = Math.min(100, Math.round((totalLivingTrees / totalTarget) * 100));

      return {
        totalLivingTrees,
        totalPublished,
        healthIndexPct,
        totalCarbonTons,
        totalScans,
        totalRevenue,
        activeLeadsCount,
        completenessPct,
        zonesSummary: zones.map(z => ({
          code: z.zoneCode,
          nameTh: z.nameTh,
          color: z.color,
          current: z.currentCount || 0,
          target: z.targetCount || 50,
          pct: Math.min(100, Math.round(((z.currentCount || 0) / (z.targetCount || 50)) * 100))
        }))
      };
    },

    // -----------------------------------------------------------------
    // 8. Data Export, Backup & Portability (ตอบโจทย์ TOR หน้า 3-5)
    // -----------------------------------------------------------------
    exportFullDatabaseJSON() {
      const dump = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0-enterprise",
        system: "Living Plant Asset Management System (LPAMS) Udon Thani Expo 2026",
        species: this.getAllSpecies(),
        zones: this.getAllZones(),
        plants: this.getAllPlants(),
        observations: readStorage(STORAGE_KEYS.OBSERVATIONS, DEFAULT_OBSERVATIONS),
        maintenance: readStorage(STORAGE_KEYS.MAINTENANCE, DEFAULT_MAINTENANCE),
        leads: this.getAllLeads(),
        locationHistory: readStorage(STORAGE_KEYS.LOCATION_HISTORY, [])
      };
      return JSON.stringify(dump, null, 2);
    },

    exportPlantsCSV() {
      const plants = this.getAllPlants();
      const headers = ["ID", "Tree_ID", "Plant_Code", "Species_Name_TH", "Species_Scientific", "Zone_Code", "Lat", "Lng", "Health_Status", "Data_Status", "Height_M", "Canopy_M", "DBH_CM", "Carbon_KG_Year", "Price_THB", "Stock_QTY", "Scan_Count", "Verified_By", "Updated_At"];
      
      const rows = plants.map(p => {
        const spec = this.getSpeciesById(p.speciesId) || {};
        return [
          p.id,
          `"${p.treeId}"`,
          `"${p.plantCode}"`,
          `"${spec.nameTh || ''}"`,
          `"${spec.nameScientific || ''}"`,
          `"${p.zoneCode}"`,
          p.lat,
          p.lng,
          `"${p.healthStatus}"`,
          `"${p.dataStatus}"`,
          p.heightM,
          p.canopyM,
          p.dbhCm,
          p.carbonKgYear,
          p.price,
          p.stockQty,
          p.scanCount,
          `"${p.verifiedBy || ''}"`,
          `"${p.updatedAt}"`
        ].join(",");
      });

      return [headers.join(","), ...rows].join("\n");
    },

    importFullDatabaseJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.species) writeStorage(STORAGE_KEYS.SPECIES, data.species);
        if (data.zones) writeStorage(STORAGE_KEYS.ZONES, data.zones);
        if (data.plants) writeStorage(STORAGE_KEYS.PLANTS, data.plants);
        if (data.observations) writeStorage(STORAGE_KEYS.OBSERVATIONS, data.observations);
        if (data.maintenance) writeStorage(STORAGE_KEYS.MAINTENANCE, data.maintenance);
        if (data.leads) writeStorage(STORAGE_KEYS.LEADS, data.leads);
        return { success: true, message: "นำเข้าและกู้คืนฐานข้อมูลสำเร็จ 100%" };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    resetToDefaultDemo() {
      localStorage.removeItem(STORAGE_KEYS.SPECIES);
      localStorage.removeItem(STORAGE_KEYS.ZONES);
      localStorage.removeItem(STORAGE_KEYS.PLANTS);
      localStorage.removeItem(STORAGE_KEYS.OBSERVATIONS);
      localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
      localStorage.removeItem(STORAGE_KEYS.LOCATION_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      initDatabase();
      window.dispatchEvent(new CustomEvent('lpams_data_updated', { detail: { action: 'reset' } }));
    }
  };

  // Expose globally
  window.LPAMS_API = LPAMS_API;

})(typeof window !== 'undefined' ? window : this);
