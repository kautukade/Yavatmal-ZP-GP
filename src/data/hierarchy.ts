import { Block, Department, District, GramPanchayat } from "@/types";

export const DISTRICT: District = {
  id: "d-yvt",
  name: "Yavatmal",
  nameMr: "यवतमाळ",
  state: "Maharashtra",
};

// 16 Panchayat Samitis (Blocks) of Yavatmal district
export const BLOCKS: Block[] = [
  { id: "b-yavatmal", districtId: "d-yvt", name: "Yavatmal", nameMr: "यवतमाळ", demoIllustrativeGpCount: 92, isPilot: true },
  { id: "b-arni", districtId: "d-yvt", name: "Arni", nameMr: "आर्णी", demoIllustrativeGpCount: 71 },
  { id: "b-babhulgaon", districtId: "d-yvt", name: "Babhulgaon", nameMr: "बाभूळगाव", demoIllustrativeGpCount: 58 },
  { id: "b-kalamb", districtId: "d-yvt", name: "Kalamb", nameMr: "कळंब", demoIllustrativeGpCount: 63 },
  { id: "b-darwha", districtId: "d-yvt", name: "Darwha", nameMr: "दारव्हा", demoIllustrativeGpCount: 88 },
  { id: "b-digras", districtId: "d-yvt", name: "Digras", nameMr: "दिग्रस", demoIllustrativeGpCount: 61 },
  { id: "b-ner", districtId: "d-yvt", name: "Ner", nameMr: "नेर", demoIllustrativeGpCount: 66 },
  { id: "b-pusad", districtId: "d-yvt", name: "Pusad", nameMr: "पुसद", demoIllustrativeGpCount: 96 },
  { id: "b-umarkhed", districtId: "d-yvt", name: "Umarkhed", nameMr: "उमरखेड", demoIllustrativeGpCount: 84 },
  { id: "b-mahagaon", districtId: "d-yvt", name: "Mahagaon", nameMr: "महागाव", demoIllustrativeGpCount: 74 },
  { id: "b-kelapur", districtId: "d-yvt", name: "Kelapur (Pandharkawada)", nameMr: "केळापूर", demoIllustrativeGpCount: 79 },
  { id: "b-ralegaon", districtId: "d-yvt", name: "Ralegaon", nameMr: "राळेगाव", demoIllustrativeGpCount: 69 },
  { id: "b-ghatanji", districtId: "d-yvt", name: "Ghatanji", nameMr: "घाटंजी", demoIllustrativeGpCount: 72 },
  { id: "b-wani", districtId: "d-yvt", name: "Wani", nameMr: "वणी", demoIllustrativeGpCount: 81 },
  { id: "b-maregaon", districtId: "d-yvt", name: "Maregaon", nameMr: "मारेगाव", demoIllustrativeGpCount: 47 },
  { id: "b-zari", districtId: "d-yvt", name: "Zari-Jamani", nameMr: "झरी-जामणी", demoIllustrativeGpCount: 40 },
];

// Reference figure only — from public district administrative information.
export const DISTRICT_GP_REFERENCE = 1201;

// Pilot block: Yavatmal — 5 fully-populated ILLUSTRATIVE pilot GPs.
// Clearly fictional/demo names so mock operational problems are never read as
// facts about any real Gram Panchayat.
export const PILOT_GPS: GramPanchayat[] = [
  { id: "gp-borgaon", blockId: "b-yavatmal", districtId: "d-yvt", name: "Pilot GP A", nameMr: "प्रायोगिक ग्रा.पं. अ", population: 4820, isPilot: true },
  { id: "gp-lohara", blockId: "b-yavatmal", districtId: "d-yvt", name: "Pilot GP B", nameMr: "प्रायोगिक ग्रा.पं. ब", population: 6210, isPilot: true },
  { id: "gp-waghapur", blockId: "b-yavatmal", districtId: "d-yvt", name: "Pilot GP C", nameMr: "प्रायोगिक ग्रा.पं. क", population: 3540, isPilot: true },
  { id: "gp-pimpalgaon", blockId: "b-yavatmal", districtId: "d-yvt", name: "Pilot GP D", nameMr: "प्रायोगिक ग्रा.पं. ड", population: 5130, isPilot: true },
  { id: "gp-sawargaon", blockId: "b-yavatmal", districtId: "d-yvt", name: "Pilot GP E", nameMr: "प्रायोगिक ग्रा.पं. इ", population: 2980, isPilot: true },
];

// Additional demo GPs (5-8 per block) — lightweight, for UI population
const DEMO_GP_NAMES: [string, string][] = [
  ["Kinhi", "किन्ही"],
  ["Ambeda", "अंबेडा"],
  ["Chinchghat", "चिंचघाट"],
  ["Dhamani", "धामणी"],
  ["Ghodkhindi", "घोडखिंडी"],
  ["Nimbhora", "निंभोरा"],
  ["Palodi", "पळोदी"],
  ["Rui", "रुई"],
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const otherGps: GramPanchayat[] = [];
BLOCKS.forEach((b) => {
  const count = b.id === "b-yavatmal" ? 3 : 6; // pilot block already has 5 pilot GPs
  for (let i = 0; i < count; i++) {
    const [n, nm] = DEMO_GP_NAMES[i % DEMO_GP_NAMES.length];
    otherGps.push({
      id: `gp-${slug(b.name)}-${i}`,
      blockId: b.id,
      districtId: "d-yvt",
      name: `${n} (${b.name})`,
      nameMr: `${nm}`,
      population: 1800 + ((i * 733 + b.name.length * 91) % 4200),
    });
  }
});

export const GPS: GramPanchayat[] = [...PILOT_GPS, ...otherGps];

export const DEPARTMENTS: Department[] = [
  { id: "dept-water", name: "Water & Sanitation", nameMr: "पाणी व स्वच्छता" },
  { id: "dept-engineering", name: "Engineering / Works", nameMr: "बांधकाम" },
  { id: "dept-mgnrega", name: "MGNREGA", nameMr: "मनरेगा" },
  { id: "dept-health", name: "Health", nameMr: "आरोग्य" },
  { id: "dept-education", name: "Education", nameMr: "शिक्षण" },
  { id: "dept-agriculture", name: "Agriculture", nameMr: "कृषी" },
  { id: "dept-panchayat", name: "Panchayat Administration", nameMr: "पंचायत प्रशासन" },
];

// ---- lookup helpers ----
export const blockById = (id?: string) => BLOCKS.find((b) => b.id === id);
export const gpById = (id?: string) => GPS.find((g) => g.id === id);
export const deptById = (id?: string) => DEPARTMENTS.find((d) => d.id === id);
export const gpsInBlock = (blockId: string) => GPS.filter((g) => g.blockId === blockId);
export const pilotGpIds = PILOT_GPS.map((g) => g.id);

/** Number of GP records actually loaded in the demo dataset. */
export const DEMO_GP_COUNT = GPS.length;
export const demoGpsLoaded = (blockId: string) => GPS.filter((g) => g.blockId === blockId).length;
