import orchid from "@/assets/plant-orchid.jpg";
import lotus from "@/assets/plant-lotus.jpg";
import succulent from "@/assets/plant-succulent.jpg";
import tropical from "@/assets/plant-tropical.jpg";
import flowers from "@/assets/zone-flowers.jpg";

export const EXPO = {
  nameTh: "มหกรรมพืชสวนโลก จ.อุดรธานี พ.ศ. 2569",
  nameEn: "Udon Thani International Horticultural Expo 2026",
  dates: "1 พ.ย. 2569 – 14 มี.ค. 2570",
  venue: "พื้นที่ชุ่มน้ำหนองแด อ.เมืองอุดรธานี",
  tagline: "Diversity of Life · ความหลากหลายแห่งสรรพชีวิต",
};

export type Zone = {
  id: string;
  nameTh: string;
  nameEn: string;
  icon: string;
  color: string;
  /** focus point on the master plan image, in % */
  x: number;
  y: number;
  blurb: string;
  image: string;
};

export const ZONES: Zone[] = [
  {
    id: "orchid",
    nameTh: "อาคารจัดแสดงกล้วยไม้",
    nameEn: "Orchid Exhibition Building",
    icon: "local_florist",
    color: "var(--secondary)",
    x: 62,
    y: 22,
    blurb: "กล้วยไม้กว่า 300 สายพันธุ์จากทั่วโลก จัดแสดงในโรงเรือนควบคุมอุณหภูมิ",
    image: orchid,
  },
  {
    id: "wetland",
    nameTh: "สระบึงบัว & ทางเดินพื้นที่ชุ่มน้ำ",
    nameEn: "Bung-Bua Wetland Experience",
    icon: "waves",
    color: "var(--primary-bright)",
    x: 22,
    y: 47,
    blurb: "ทางเดินไม้เหนือผืนน้ำ ชมบัวสายพันธุ์ไทยและนกน้ำประจำถิ่นหนองแด",
    image: lotus,
  },
  {
    id: "cactus",
    nameTh: "อาคารจัดแสดงต้นกระบองเพชร",
    nameEn: "Cactus Building",
    icon: "grass",
    color: "var(--marigold)",
    x: 86,
    y: 40,
    blurb: "แคคตัสและไม้อวบน้ำหาชมยาก พร้อมโซนจำหน่ายจากสวนท้องถิ่น",
    image: succulent,
  },
  {
    id: "indoor",
    nameTh: "อาคารเรือนไม้ในร่ม",
    nameEn: "Indoor Plant Building",
    icon: "park",
    color: "var(--primary)",
    x: 78,
    y: 62,
    blurb: "ไม้ใบเขตร้อน มอนสเตอร่า เฟิร์น และไม้ฟอกอากาศสำหรับคนเมือง",
    image: tropical,
  },
  {
    id: "flower",
    nameTh: "สวนไม้ดอก/ไม้ประดับ",
    nameEn: "Flower & Ornamental Plant Garden",
    icon: "filter_vintage",
    color: "var(--secondary)",
    x: 88,
    y: 30,
    blurb: "แปลงไม้ดอกหมุนเวียนตามฤดูกาล จุดถ่ายภาพยอดนิยมของงาน",
    image: flowers,
  },
  {
    id: "isan",
    nameTh: "หมู่บ้านอีสาน",
    nameEn: "Isan Village",
    icon: "cottage",
    color: "var(--marigold)",
    x: 30,
    y: 20,
    blurb: "วิถีเกษตรอีสาน ผ้าย้อมคราม อาหารถิ่น และการแสดงพื้นบ้านทุกเย็น",
    image: tropical,
  },
];

export type Plant = {
  id: string;
  nameTh: string;
  nameEn: string;
  sci: string;
  zoneId: string;
  image: string;
  descTh: string;
  light: string;
  water: string;
  origin: string;
  shopId: string;
  price: number;
};

export const PLANTS: Plant[] = [
  {
    id: "dendrobium-udon",
    nameTh: "กล้วยไม้หวายอุดรสายพันธุ์ใหม่",
    nameEn: "Udon Dendrobium",
    sci: "Dendrobium bigibbum var.",
    zoneId: "orchid",
    image: orchid,
    descTh:
      "กล้วยไม้หวายดอกสีม่วงชมพู ออกดอกปีละ 2 ครั้ง ทนแดดกึ่งร่ม เหมาะปลูกในตะกร้าแขวนกลางแจ้งที่มีแสงรำไร ดอกบานทนกว่า 3 สัปดาห์",
    light: "แสงรำไร 50–70%",
    water: "รดวันเว้นวัน",
    origin: "ภาคอีสาน ประเทศไทย",
    shopId: "orchid-house",
    price: 450,
  },
  {
    id: "nelumbo-nongdaeng",
    nameTh: "บัวหลวงหนองแด",
    nameEn: "Nong Daeng Sacred Lotus",
    sci: "Nelumbo nucifera",
    zoneId: "wetland",
    image: lotus,
    descTh:
      "บัวหลวงพันธุ์ท้องถิ่นของพื้นที่ชุ่มน้ำหนองแด ดอกสีชมพูอมขาว กลิ่นหอมอ่อน เป็นสัญลักษณ์ของงานมหกรรมพืชสวนโลกอุดรธานี",
    light: "แดดเต็มวัน",
    water: "ปลูกในน้ำนิ่งลึก 30–60 ซม.",
    origin: "หนองแด อุดรธานี",
    shopId: "bungbua-farm",
    price: 180,
  },
  {
    id: "echeveria-isan",
    nameTh: "อิชิเวเรียหินอีสาน",
    nameEn: "Isan Echeveria",
    sci: "Echeveria elegans",
    zoneId: "cactus",
    image: succulent,
    descTh:
      "ไม้อวบน้ำใบเรียงเป็นดอกกุหลาบ สีเขียวอมฟ้า ดูแลง่าย ทนแล้ง เหมาะเป็นของฝากจากงานเอ็กซ์โป",
    light: "แดดเช้า 4–6 ชม.",
    water: "สัปดาห์ละครั้ง",
    origin: "เพาะเลี้ยงในอุดรธานี",
    shopId: "cactus-corner",
    price: 120,
  },
  {
    id: "monstera-expo",
    nameTh: "มอนสเตอร่าเอ็กซ์โป",
    nameEn: "Expo Monstera",
    sci: "Monstera deliciosa",
    zoneId: "indoor",
    image: tropical,
    descTh:
      "ไม้ใบยอดนิยม ใบใหญ่เป็นรอยแหว่งสวยงาม ช่วยฟอกอากาศ ปลูกในร่มริมหน้าต่างได้ดี โตเร็วในฤดูฝน",
    light: "ร่ม–แสงรำไร",
    water: "สัปดาห์ละ 2 ครั้ง",
    origin: "อเมริกากลาง",
    shopId: "greenroom",
    price: 690,
  },
];

export type Shop = {
  id: string;
  name: string;
  zoneId: string;
  rating: number;
  reviews: number;
  banner: string;
  about: string;
};

export const SHOPS: Shop[] = [
  {
    id: "orchid-house",
    name: "อุดรออร์คิดเฮ้าส์",
    zoneId: "orchid",
    rating: 4.9,
    reviews: 312,
    banner: orchid,
    about: "ฟาร์มกล้วยไม้ครอบครัว 3 รุ่น ส่งออกกล้วยไม้หวายจากอุดรธานีกว่า 20 ปี",
  },
  {
    id: "bungbua-farm",
    name: "ฟาร์มบัวบึงบัว",
    zoneId: "wetland",
    rating: 4.8,
    reviews: 154,
    banner: lotus,
    about: "อนุรักษ์และเพาะพันธุ์บัวไทยจากพื้นที่ชุ่มน้ำหนองแด",
  },
  {
    id: "cactus-corner",
    name: "แคคตัสคอร์เนอร์",
    zoneId: "cactus",
    rating: 4.7,
    reviews: 208,
    banner: succulent,
    about: "ไม้อวบน้ำและกระบองเพชรนำเข้า พร้อมกระถางเซรามิกงานคราฟต์",
  },
  {
    id: "greenroom",
    name: "กรีนรูมอุดรธานี",
    zoneId: "indoor",
    rating: 4.8,
    reviews: 421,
    banner: tropical,
    about: "ไม้ใบฟอกอากาศสำหรับคอนโดและออฟฟิศ พร้อมบริการจัดสวนในร่ม",
  },
];

export type Product = {
  id: string;
  shopId: string;
  plantId?: string;
  name: string;
  price: number;
  compareAt?: number;
  image: string;
  sold: number;
  rating: number;
  tag?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    shopId: "orchid-house",
    plantId: "dendrobium-udon",
    name: "กล้วยไม้หวายอุดร ต้นพร้อมดอก",
    price: 450,
    compareAt: 590,
    image: orchid,
    sold: 1240,
    rating: 4.9,
    tag: "ขายดี",
  },
  {
    id: "p2",
    shopId: "bungbua-farm",
    plantId: "nelumbo-nongdaeng",
    name: "บัวหลวงหนองแด พร้อมกระถางดินเผา",
    price: 180,
    image: lotus,
    sold: 860,
    rating: 4.8,
    tag: "ของฝากประจำงาน",
  },
  {
    id: "p3",
    shopId: "cactus-corner",
    plantId: "echeveria-isan",
    name: "เซ็ตไม้อวบน้ำ 3 กระถาง",
    price: 120,
    compareAt: 160,
    image: succulent,
    sold: 2310,
    rating: 4.7,
    tag: "ลดราคา",
  },
  {
    id: "p4",
    shopId: "greenroom",
    plantId: "monstera-expo",
    name: "มอนสเตอร่าใบใหญ่ กระถาง 10 นิ้ว",
    price: 690,
    image: tropical,
    sold: 430,
    rating: 4.8,
  },
  {
    id: "p5",
    shopId: "orchid-house",
    name: "ปุ๋ยกล้วยไม้สูตรเร่งดอก",
    price: 90,
    image: orchid,
    sold: 3120,
    rating: 4.6,
  },
  {
    id: "p6",
    shopId: "greenroom",
    name: "กระถางเซรามิกงานคราฟต์อุดรธานี",
    price: 250,
    image: succulent,
    sold: 780,
    rating: 4.9,
  },
  {
    id: "p7",
    shopId: "bungbua-farm",
    name: "เมล็ดบัวสายพันธุ์ผสม 10 เมล็ด",
    price: 60,
    image: lotus,
    sold: 1540,
    rating: 4.5,
  },
  {
    id: "p8",
    shopId: "cactus-corner",
    name: "แคคตัสด่างหาชมยาก",
    price: 1290,
    compareAt: 1590,
    image: succulent,
    sold: 96,
    rating: 5,
    tag: "หาชมยาก",
  },
];

export type Highlight = {
  id: string;
  time: string;
  title: string;
  zoneId: string;
  image: string;
};

export const HIGHLIGHTS: Highlight[] = [
  {
    id: "h1",
    time: "09:30",
    title: "พิธีเปิดสวนกล้วยไม้ประจำวัน",
    zoneId: "orchid",
    image: orchid,
  },
  { id: "h2", time: "11:00", title: "ล่องเรือชมบัวบานยามสาย", zoneId: "wetland", image: lotus },
  {
    id: "h3",
    time: "14:00",
    title: "เวิร์กชอปจัดสวนไม้อวบน้ำ",
    zoneId: "cactus",
    image: succulent,
  },
  { id: "h4", time: "16:30", title: "การแสดงหมอลำหมู่บ้านอีสาน", zoneId: "isan", image: tropical },
  {
    id: "h5",
    time: "18:00",
    title: "แสง สี เสียง สวนไม้ดอกยามค่ำ",
    zoneId: "flower",
    image: flowers,
  },
];

export const NEWS = [
  {
    id: "n1",
    date: "18 ส.ค. 2569",
    title: "เปิดจำหน่ายบัตรเข้าชมล่วงหน้า ลด 25% ถึงสิ้นเดือน",
    excerpt: "ผู้ซื้อบัตรล่วงหน้าได้รับต้นกล้าบัวหนองแดเป็นของที่ระลึกฟรี 1 ต้น",
    image: lotus,
  },
  {
    id: "n2",
    date: "12 ส.ค. 2569",
    title: "45 ประเทศยืนยันร่วมประกวดสวนนานาชาติ",
    excerpt: "สวนนานาชาติจะจัดแสดงในโซนกลางของพื้นที่จัดงาน พร้อมชิงถ้วยพระราชทาน",
    image: flowers,
  },
  {
    id: "n3",
    date: "5 ส.ค. 2569",
    title: "อาคารเรือนกระจกใหม่คืบหน้า 82%",
    excerpt: "โครงสร้างโดมหลักแล้วเสร็จ เตรียมติดตั้งระบบควบคุมอุณหภูมิเดือนหน้า",
    image: tropical,
  },
];

export const getZone = (id: string) => ZONES.find((z) => z.id === id);
export const getPlant = (id: string) => PLANTS.find((p) => p.id === id);
export const getShop = (id: string) => SHOPS.find((s) => s.id === id);
