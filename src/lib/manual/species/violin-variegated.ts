import type { PlantPack } from "../types";
import { standardSequence } from "./pink-princess";

// ค้นตามขั้นที่ 1 ของ docs/superpowers/newplant_protocol.md เมื่อ 2026-08-04 ครอบคลุมชื่อวิทยาศาสตร์
// + micropropagation, ชื่อพ้อง (ยืนยันว่า "Philodendron panduriforme" ไม่ใช่ชื่อพ้องของพันธุ์นี้
// ตามที่เข้าใจผิดกันทั่วไป), พันธุ์พี่น้อง/สกุลเดียวกัน, ชื่อไทย, สิทธิบัตร, วิทยานิพนธ์
// (OATD ผ่าน web search — ไม่พบเล่มที่ตรงพันธุ์ ยังไม่ได้ค้น ThaiLIS/TDC ผ่านระบบค้นของเว็บโดยตรง)
// และฟอรัมนักปลูก (พบคำแนะนำปักชำจากข้อในดิน เป็น anecdotal ไม่ใช่ tissue culture)
// ดูบันทึกเต็มใน docs/superpowers/search-logs/violin-variegated.md
const searchLog = {
  searchedAt: "2026-08-04",
  searchQueries: [
    "Philodendron bipennifolium micropropagation in vitro tissue culture",
    "Philodendron bipennifolium POWO Plants of the World Online accepted name",
    '"Philodendron bipennifolium" synonym "Philodendron panduriforme" OR "Philodendron williamsii"',
    'ฟิโลเดนดรอน ไวโอลิน เพาะเลี้ยงเนื้อเยื่อ OR "Philodendron bipennifolium" การเพาะเลี้ยงเนื้อเยื่อ',
    "Micropropagation of self-heading Philodendron via direct shoot regeneration node explant BA",
    "US Patent plant tissue culture propagation Philodendron explant preparation",
    '"Philodendron bipennifolium" thesis dissertation micropropagation tissue culture',
    "site:oatd.org Philodendron micropropagation",
    "ThaiLIS TDC วิทยานิพนธ์ ฟิโลเดนดรอน เพาะเลี้ยงเนื้อเยื่อ",
    '"Philodendron bipennifolium" OR "Violin variegated" propagation node cutting forum grower experience',
    '"In vitro micropropagation of Philodendron cannifolium" shoot tip explant results',
  ],
};

export const violinVariegatedPack: PlantPack = {
  slug: "violin-variegated",
  scientificName: "Philodendron bipennifolium ‘Violin’ variegated",
  commonName: "ฟิโลเดนดรอน ไวโอลิน ด่าง",
  method: "nodal",
  summary:
    "ยังไม่มีงานตรงพันธุ์ ใช้ค่าระดับสกุลจากพันธุ์พี่น้องแบบ self-heading และสิทธิบัตรอุตสาหกรรมเป็นจุดตั้งต้น " +
    "โดยต้องระวังว่าพันธุ์นี้เป็นไม้เลื้อย ต่างจากพันธุ์ที่มีงานรองรับซึ่งเป็นทรงพุ่มตั้ง (self-heading)",
  durationLabel: "4 ถึง 8 เดือน",
  growthFormId: "climbing-vine-visible-node",
  genusId: "philodendron",
  traitIds: ["variegated"],
  sequence: [...standardSequence],
  overrides: {
    cut: {
      illustrationId: "cut-explant-violin-bipennifolium",
      actions: [
        "ตัดยอดอ่อนยาวประมาณ 4 ถึง 5 ซม. จากปลายยอด นับจากปลายยอดลงมา ไม่ใช่จากก้านใบ",
        "ตัดใต้ข้อโดยไม่ตัดผ่านตา",
        "เหลือเนื้อไว้เหนือและใต้ตาพอให้จับได้ตอนฟอก แล้วค่อยตัดแต่งเหลือช่วงข้อสั้น 3 ถึง 5 มม. ก่อนวางลงอาหาร",
        "วัดความยาวชิ้นแล้วจดไว้",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-us-patent-4855236"],
        sourcePages: {
          "source-us-patent-4855236":
            "หัวข้อ “Initiation of In Vitro Culture” ใต้ Example 1 (สิทธิบัตรนี้ไม่มีเลขหน้ากำกับในเวอร์ชันเว็บของ Google Patents ใช้ชื่อหัวข้อแทน)",
        },
        note:
          "ตัวเลขมาจากสิทธิบัตรอุตสาหกรรมของพันธุ์พี่น้อง Philodendron 'Burgundy' (ทรงพุ่มตั้ง ไม่ใช่ไม้เลื้อยแบบ Violin) " +
          "ไม่ใช่งานตีพิมพ์ที่ผ่านการทบทวน และไม่ใช่ตัวเลขที่ยืนยันแล้วสำหรับ Violin ด่างโดยตรง ใช้เป็นจุดตั้งต้นเท่านั้น",
      },
      referenceImages: [
        {
          url: "https://www.rareplantfairy.com/products/philodendron-bipennifolium-variegated-violin-growers-choice",
          label: "Rare Plant Fairy — Philodendron Bipennifolium Variegated 'Violin'",
          note: "รูปสินค้าจากร้านขายต้นไม้ สงวนลิขสิทธิ์ผู้ขาย ใช้ดูลักษณะลายด่างของพันธุ์นี้เท่านั้น ไม่ใช่คำแนะนำตำแหน่งตัดหรือหลักฐานทางวิชาการ",
        },
        {
          url: "https://www.limitedleaves.com/en/bippenifolium-aurea-variegated.html",
          label: "Limited Leaves — Bippenifolium Aurea Variegated Ø14",
          note: "รูปสินค้าจากร้านขายต้นไม้ สงวนลิขสิทธิ์ผู้ขาย ใช้ดูลักษณะลายด่างของพันธุ์นี้เท่านั้น ไม่ใช่คำแนะนำตำแหน่งตัดหรือหลักฐานทางวิชาการ",
        },
      ],
    },
    sterilize: {
      actions: [
        "อ่านฉลากว่าน้ำยามีโซเดียมไฮโปคลอไรต์กี่เปอร์เซ็นต์ แล้วคำนวณให้ได้คลอรีนออกฤทธิ์ 0.5 ถึง 1.0 เปอร์เซ็นต์",
        "ตวงสารฟอกด้วย syringe ไม่ใช่ถ้วยตวงทรงกรวย เพราะช่วงล่างของกรวยแคบและขีดถี่จนอ่านคลาดเคลื่อนได้หลายสิบเปอร์เซ็นต์",
        "หยดน้ำยาล้างจาน 1 ถึง 2 หยดต่อสารฟอก 100 มิลลิลิตร แล้วคนเบา ๆ อย่าให้เป็นฟองมาก",
        "เทสารฟอกที่เจือจางแล้วลงภาชนะ ใส่ชิ้นพืชให้จมทั้งหมด",
        "เริ่มจับเวลาหลังใส่ชิ้นสุดท้ายลงไปแล้วเท่านั้น",
        "เขย่าหรือคนเบา ๆ ตลอดเวลาที่แช่ อย่าปล่อยให้ชิ้นนิ่ง",
        "ทางเลือกทดลอง (ยังไม่เคยทดสอบกับพันธุ์นี้มาก่อนแม้แต่ครั้งเดียว): แทนที่จะล้างด้วยน้ำปลอดเชื้อเฉย ๆ " +
          "3 รอบตามค่าเริ่มต้น จะเตรียมน้ำ rinse ที่มีคลอรีนออกฤทธิ์ต่ำ ๆ ประมาณ 300 ppm แยกต่างหาก " +
          "(เจือจาก[[nadcc|NaDCC]]หรือ NaOCl เจือจางมาก ๆ ก็ได้) แล้วล้างด้วยน้ำนี้แทน 3 รอบ รอบละประมาณหนึ่งนาทีก็ได้ " +
          "แนวคิดคือให้น้ำล้างมีฤทธิ์ฆ่าเชื้อที่หลุดออกมาจากผิวชิ้นพืชไปด้วย ไม่ใช่แค่ชะสารฟอกออก ถ้าไม่มั่นใจให้ใช้ " +
          "น้ำปลอดเชื้อธรรมดาตามค่าเริ่มต้นไปก่อน",
        "ถ้าเลือกทางเลือกทดลอง ให้ล้างด้วยน้ำปลอดเชื้อธรรมดาอีกหนึ่งรอบสุดท้ายก่อนตัดแต่งและวางลงอาหาร " +
          "เพื่อไม่ให้มีคลอรีนตกค้างสัมผัสรอยตัดสด",
        "จดเวลาและจำนวนรอบที่ทำจริง ไม่ใช่ที่ตั้งใจจะทำ รวมถึงจดด้วยว่ารอบล้างใช้น้ำปลอดเชื้อธรรมดาหรือน้ำ rinse คลอรีนต่ำ",
      ],
      safetyNotes: [
        "ห้ามผสมสารฟอกกับกรด แอมโมเนีย หรือแอลกอฮอล์ เพราะเกิดแก๊สพิษ",
        "ถ้าจะใช้สารต้านการเกิดสีน้ำตาลต่อ เช่น สารละลาย[[ascorbic-acid|กรดแอสคอร์บิก (วิตามินซี)]] หรือ[[citric-acid|กรดซิตริก]] " +
          "ต้องล้างสารฟอกออกให้หมดก่อน เพราะสารเหล่านั้นเป็นกรดและจะทำปฏิกิริยากับสารฟอกที่ค้างอยู่",
        "ทำในที่อากาศถ่ายเท และสวมแว่นตานิรภัย",
        "ถ้าใช้เม็ดคลอรีน[[nadcc|NaDCC]]เชิงพาณิชย์ (เม็ดฟู่สำหรับทำน้ำดื่มหรือสระว่ายน้ำ) เป็นน้ำ rinse ต้องรู้ว่าเม็ดพวกนี้ " +
          "ไม่ใช่ NaDCC ล้วนแบบ reagent-grade มักผสมสารอื่นเพื่อให้เกิดฟองหรือกันจับตัวเป็นก้อน ยังไม่มีใครทดสอบว่า " +
          "สารเหล่านั้นกระทบเนื้อเยื่อพืชไหม",
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-us-patent-4855236", "source-nadcc-explant-sterilisation"],
        sourcePages: {
          "source-us-patent-4855236":
            "หัวข้อ “Initiation of In Vitro Culture” ใต้ Example 1 (สิทธิบัตรนี้ไม่มีเลขหน้ากำกับในเวอร์ชันเว็บของ Google Patents ใช้ชื่อหัวข้อแทน)",
        },
        note:
          "การฟอกหลักอ้างสิทธิบัตรอุตสาหกรรมของพันธุ์พี่น้อง Philodendron 'Burgundy' (ทรงพุ่มตั้ง ไม่ใช่ไม้เลื้อยแบบ Violin) " +
          "ตัดยอดอ่อนยาว 4 ถึง 5 ซม. จากต้นแม่ แล้วฟอกสามขั้นต่อเนื่อง: Proceptil 1.0% 30 นาที, " +
          "สารผสม Captan 0.2% กับ Benlate 0.1% 30 นาที, และปิดท้ายด้วย NaOCl ออกฤทธิ์ 1.0% 20 นาที " +
          "ก่อนล้างและตัดแต่งเหลือ 3 ถึง 5 มม. เป็นสิทธิบัตร ไม่ใช่งานตีพิมพ์ที่ผ่านการทบทวน จึงให้ระดับ adapted " +
          "สูงสุดตามกฎเพดานของแหล่งประเภทนี้ และเป็นสูตรฟอกที่ซับซ้อนกว่า NaOCl เดี่ยวที่ใช้ในคู่มืออื่น " +
          "ผู้ใช้ที่บ้านอาจเข้าถึงแค่ NaOCl ให้เริ่มจากช่วงคลอรีนออกฤทธิ์ 0.5 ถึง 1.0% ตามส่วนที่ 2 ของโปรโตคอลแทน " +
          "ทางเลือกทดลองเรื่องน้ำ rinse คลอรีนต่ำ 300 ppm ยืมตัวเลขจาก Parkinson, Prendergast & Sayegh (1996) " +
          "ที่ใช้ NaDCC 300 ppm นาน 24 ถึง 48 ชั่วโมงฆ่าเชื้อ shoot explant จากภาคสนามโดยตรง (ไม่ใช่แค่ rinse " +
          "สั้น ๆ หลังฟอกด้วยสารอื่นแบบที่เสนอที่นี่) รายงานว่าพิษต่อเนื้อเยื่อต่ำและจำกัดอยู่แค่ใบแก่กับรอยตัด " +
          "งานนี้ไม่ได้ทำกับ Araceae และไม่ได้ทดสอบรูปแบบ rinse แบบนี้เลย จึงเป็นการประยุกต์ของเจ้าของระบบเอง " +
          "ทั้งหมด ยังไม่เคยทดลองจริงกับพันธุ์นี้แม้แต่ครั้งเดียว บันทึกแนวคิดและชุดทดลองเปรียบเทียบที่วางแผนไว้ " +
          "อยู่ใน new_idea.md (ไฟล์บันทึกส่วนตัว ไม่ใช่ไฟล์ระบบ) ห้ามยกระดับความมั่นใจของขั้นนี้จนกว่าจะมีผล " +
          "ทดลองจริงมายืนยัน",
      },
      // เวอร์ชันมีโครงสร้างของทางเลือกทดลอง NaDCC ในย่อหน้า actions ข้างบน ใช้กระจายรอบจุดตั้งต้น 300 ppm
      // เป็นช่วง 150-450 ให้ BracketNotice ชวนทดสอบเป็น 3 ระดับ (A/B/C) แทนตัวเลขจุดเดียว เพราะยังไม่ยืนยัน
      // เป็นแผ่นเสริมนำร่องของฟีเจอร์เลือกวิธีฆ่าเชื้อ (ดู java-fern.ts อีกแผ่นที่ทำคู่กัน) ยังไม่ rollout
      // ครบทุกพันธุ์ในระบบ
      doses: {
        "sterilize.dose.nadcc": {
          method: "nadcc",
          form: "น้ำ rinse NaDCC เจือจาง (คลอรีนออกฤทธิ์)",
          low: 150,
          high: 450,
          unit: "mg/L",
          durationMin: [1, 1],
          movesLowerWhen: ["เนื้อด่างมาก", "ชิ้นพืชบอบบาง"],
          movesHigherWhen: ["ปนเปื้อนซ้ำที่ระดับต่ำ", "ต้นแม่มาจากกลางแจ้งสกปรก"],
          evidence: {
            level: "adapted",
            sourceIds: ["source-nadcc-explant-sterilisation"],
            note:
              "ยืมตัวเลขจาก Parkinson, Prendergast & Sayegh (1996) ที่ใช้ NaDCC 300 ppm นาน 24 ถึง 48 ชั่วโมง " +
              "ฆ่าเชื้อ shoot explant จากภาคสนามโดยตรง ไม่ใช่ rinse สั้น ๆ แบบที่เสนอที่นี่ และไม่ได้ทำกับ Araceae " +
              "เลย ช่วง 150 ถึง 450 ppm เป็นการกระจายรอบ 300 ppm ให้ทดสอบเป็นช่วงตามกฎ bracket ของระบบ " +
              "ไม่ใช่ตัวเลขที่มีงานรองรับโดยตรง ยังไม่เคยทดลองจริงกับพันธุ์นี้แม้แต่ครั้งเดียว",
          },
        },
      },
    },
    multiply: {
      evidence: {
        level: "adapted",
        sourceIds: ["source-selfheading-philodendron-2012", "source-cannifolium-2008", "source-birkin-thai-2023"],
        sourcePages: {
          "source-selfheading-philodendron-2012": "Scientia Horticulturae เล่ม 141, หน้า 23–29",
          "source-cannifolium-2008": "Journal of Plant Biotechnology เล่ม 35, หน้า 203–208",
          "source-birkin-thai-2023": "PSRU Journal of Science and Technology ปีที่ 8 ฉบับที่ 1, หน้า 17–36",
        },
        note:
          "งานทดสอบ Philodendron แบบทรงพุ่มตั้งหลายพันธุ์จากต้นแม่จริง พบว่าชิ้นส่วนข้อลำต้นตอบสนองดีที่สุด " +
          "เมื่อเทียบกับแผ่นใบและก้านใบ และ BA 0.5 ถึง 1 mg/L ให้ยอดที่ความถี่ 55.6 ถึง 80.6% เฉลี่ย 40.8 ถึง 50.4 ยอดต่อชิ้น " +
          "แล้วแต่พันธุ์ที่ทดสอบ งานอีกสองชิ้นให้ผลไปทางเดียวกัน คือ Philodendron cannifolium ใช้ BAP 1.0 mg/L " +
          "ร่วมกับ IBA 0.5 mg/L ได้ 11.4 ยอดต่อชิ้น และงานไทยของ Philodendron 'Birkin' ใช้ BA 2 mg/L ได้ราว 4.7 ยอดต่อชิ้น " +
          "สามงานนี้จึงยืนยันช่วง BA ที่ใช้ได้ผลไปในทิศทางเดียวกัน แต่พันธุ์ในทุกงานเป็นทรงพุ่มตั้งหรือยังไม่ยืนยันรูปแบบการเจริญ " +
          "ไม่มีงานใดทำกับพันธุ์ไม้เลื้อยแบบ Violin โดยตรง อัตราตอบสนองจริงของ Violin อาจต่างจากนี้ ให้ถือเป็นจุดตั้งต้นเท่านั้น",
      },
    },
    root: {
      evidence: {
        level: "adapted",
        sourceIds: ["source-selfheading-philodendron-2012", "source-cannifolium-2008"],
        sourcePages: {
          "source-selfheading-philodendron-2012": "Scientia Horticulturae เล่ม 141, หน้า 23–29",
          "source-cannifolium-2008": "Journal of Plant Biotechnology เล่ม 35, หน้า 203–208",
        },
        note:
          "งานเดียวกับขั้นเพิ่มจำนวน ยอดที่ได้จากอาหาร BA 0.5 mg/L นำไปออกรากด้วย IBA 0.1 ถึง 1 mg/L " +
          "บ่มหนึ่งเดือน ต้นที่ออกรากรอดหลังปรับสภาพในโรงเรือน 100% งาน Philodendron cannifolium ใช้ NAA 1 ถึง 2 mg/L " +
          "แทน ก็ได้ราก 100% เช่นกัน เป็นออกซินคนละตัว ระบบเก็บสูตร IBA ไว้เป็นหลัก และมี NAA เป็นทางเลือกในสูตรอาหาร",
      },
    },
    acclimatize: {
      evidence: { level: "adapted", sourceIds: ["source-kew-philodendron"], note: "ใช้หลักการปรับสภาพทั่วไปของสกุล" },
    },
    monitor: {
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: searchLog.searchedAt,
        searchQueries: searchLog.searchQueries,
        note: "ยังไม่มีงานประเมินความคงตัวของลายด่างพันธุ์นี้ ต่างจาก Pink Princess ที่มีงานปี 2025 ประเมินไว้",
      },
    },
  },
  mediaRecipes: [
    {
      id: "establishment",
      title: "ระยะตั้งต้น",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
      ],
      evidence: {
        level: "unsupported",
        sourceIds: [],
        searchedAt: searchLog.searchedAt,
        searchQueries: searchLog.searchQueries,
        note: "ไม่มีงานตรงพันธุ์รายงานสูตรตั้งต้นก่อนใส่ฮอร์โมน สูตรนี้เป็นอาหารพื้นฐานทั่วไป",
      },
    },
    {
      id: "multiplication",
      title: "ระยะเพิ่มจำนวนยอด",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "BA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่ ห้ามชั่งผงโดยตรงเมื่อทำปริมาณน้อย จุดเริ่มของช่วงที่งานทดสอบ 0.5 ถึง 1 mg/L" },
      ],
      evidence: { level: "adapted", sourceIds: ["source-selfheading-philodendron-2012"] },
    },
    {
      id: "rooting",
      title: "ระยะออกราก",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 0.5, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "IBA", amountPerLiter: 0.5, unit: "mg/L", note: "ใช้น้ำยาแม่ กึ่งกลางของช่วงที่งานทดสอบ 0.1 ถึง 1 mg/L" },
      ],
      evidence: { level: "adapted", sourceIds: ["source-selfheading-philodendron-2012"] },
    },
    {
      id: "rooting-naa",
      title: "ระยะออกราก ทางเลือกที่ใช้ NAA",
      pH: "5.7 ถึง 5.8",
      ingredients: [
        { name: "MS basal salts", amountPerLiter: 1, unit: "×" },
        { name: "Sucrose", amountPerLiter: 30, unit: "g/L" },
        { name: "Agar", amountPerLiter: 7.5, unit: "g/L" },
        { name: "NAA", amountPerLiter: 1, unit: "mg/L", note: "ใช้น้ำยาแม่ จุดเริ่มของช่วงที่งานทดสอบ 1 ถึง 2 mg/L" },
      ],
      evidence: {
        level: "adapted",
        sourceIds: ["source-cannifolium-2008"],
        sourcePages: { "source-cannifolium-2008": "Journal of Plant Biotechnology เล่ม 35, หน้า 203–208" },
        note: "งาน Philodendron cannifolium ใช้ NAA แทน IBA ได้ราก 100% เท่ากัน เป็นสกุลเดียวกันแต่คนละสาร ยังไม่มีงานเปรียบเทียบตรง ๆ",
      },
    },
  ],
  sourceIds: [
    "source-violin-gap",
    "source-kew-bipennifolium",
    "source-kew-philodendron",
    "source-selfheading-philodendron-2012",
    "source-cannifolium-2008",
    "source-birkin-thai-2023",
    "source-us-patent-4855236",
    "source-violin-anecdotal-cutting",
    "source-nadcc-explant-sterilisation",
  ],
};
