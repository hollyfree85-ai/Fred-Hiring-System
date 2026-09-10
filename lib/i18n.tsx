"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import generatedTranslations from "@/lib/ui-translations.json";

export const appLocales = ["en", "id", "zh-CN", "zh-TW", "es"] as const;
export type AppLocale = (typeof appLocales)[number];

export const localeOptions: Array<{ value: AppLocale; shortLabel: string; label: string }> = [
  { value: "en", shortLabel: "EN", label: "English" },
  { value: "id", shortLabel: "ID", label: "Bahasa Indonesia" },
  { value: "zh-CN", shortLabel: "简体", label: "简体中文" },
  { value: "zh-TW", shortLabel: "繁體", label: "繁體中文" },
  { value: "es", shortLabel: "ES", label: "Español" },
];

type TranslationCatalog = Record<string, string>;
type TranslationMap = Record<Exclude<AppLocale, "en">, TranslationCatalog>;
type TranslationValues = Record<string, string | number>;

const translations = generatedTranslations as TranslationMap;
const supplementalTranslations: TranslationMap = {
  id: {
    "Restaurant type": "Jenis restoran",
    "Job family": "Kelompok posisi",
    "Experience level": "Tingkat pengalaman",
    "Assessment path:": "Jalur asesmen:",
    "Choose a restaurant type, job family, position, and experience level.": "Pilih jenis restoran, kelompok posisi, posisi, dan tingkat pengalaman.",
    "Choose a position from the selected job family.": "Pilih posisi yang tersedia di kelompok posisi tersebut.",
    "Service model & price point": "Model pelayanan & tingkat harga",
    "American restaurant concepts": "Konsep restoran Amerika",
    "Steak, barbecue & meat": "Steak, BBQ & daging",
    "Seafood concepts": "Konsep restoran seafood",
    "Japanese concepts": "Konsep restoran Jepang",
    "Chinese & Taiwanese concepts": "Konsep restoran Tiongkok & Taiwan",
    "Korean concepts": "Konsep restoran Korea",
    "Southeast Asian concepts": "Konsep restoran Asia Tenggara",
    "Management": "Manajemen",
    "Kitchen Management": "Manajemen Dapur",
    "Server & Guest Service": "Server & Pelayanan Tamu",
    "Host, Cashier & Front Desk": "Host, Kasir & Front Desk",
    "Bar & Beverage": "Bar & Minuman",
    "Food Runner, Busser & Expo": "Food Runner, Busser & Expo",
    "General Kitchen / Cook": "Dapur Umum / Koki",
    "Japanese & Sushi": "Dapur Jepang & Sushi",
    "Hibachi / Teppanyaki": "Hibachi / Teppanyaki",
    "Specialty Kitchen": "Dapur Spesialis",
    "Takeout, Delivery & Catering": "Takeout, Delivery & Catering",
    "Utility, Cleaning & Support": "Kebersihan & Pendukung Operasional",
    "Not recorded": "Belum tercatat",
    "Restaurant type: {restaurant}": "Jenis restoran: {restaurant}",
    "Random work judgment": "Penilaian kerja acak",
    "Tailored technical": "Teknis sesuai posisi",
    "Work psychology": "Psikologi kerja",
    "{count} positions": "{count} posisi",
    "{family} selected": "{family} dipilih",
    "all {count} positions in this job family are shown above in alphabetical order.": "semua {count} posisi dalam kelompok ini ditampilkan di atas secara alfabetis.",
    "The assessment combines 30 non-clinical work-psychology questions with 45 technical questions tailored to the position you choose.": "Asesmen ini terdiri dari 30 pertanyaan psikologi kerja nonklinis dan 45 pertanyaan teknis yang disesuaikan dengan posisi pilihan Anda.",
    "Work-psychology statement.": "Pernyataan psikologi kerja.",
    "Answer based on how you usually behave at work—not the answer that merely sounds ideal.": "Jawablah sesuai perilaku Anda yang biasanya di tempat kerja—bukan sekadar jawaban yang terdengar paling ideal.",
    "Technical section starts here.": "Bagian teknis dimulai di sini.",
    "The next 45 questions are tailored to the restaurant concept, position, and experience level you selected.": "45 pertanyaan berikutnya disesuaikan dengan konsep restoran, posisi, dan tingkat pengalaman yang Anda pilih.",
    "Work Psychology · Integrity & Reliability": "Psikologi Kerja · Integritas & Keandalan",
    "Work Psychology · Teamwork & Service": "Psikologi Kerja · Kerja Sama & Pelayanan",
    "Work Psychology · Emotional Control & Adaptability": "Psikologi Kerja · Pengendalian Emosi & Adaptasi",
    "Integrity & reliability": "Integritas & keandalan",
    "Teamwork & service": "Kerja sama & pelayanan",
    "Emotional control & adaptability": "Pengendalian emosi & adaptasi",
    "Technical knowledge": "Pengetahuan teknis",
    "Work psychology profile": "Profil psikologi kerja",
    "Confidential report": "Laporan rahasia",
    "Six non-clinical work traits based on the first 30 responses.": "Enam karakteristik kerja nonklinis berdasarkan 30 jawaban pertama.",
    "30 psychology questions": "30 pertanyaan psikologi",
    "Manager follow-up:": "Pendalaman oleh manajer:",
    "This profile describes job-related response patterns. It is not a clinical test, personality diagnosis, or substitute for a structured interview.": "Profil ini menggambarkan pola respons terkait pekerjaan. Ini bukan tes klinis, diagnosis kepribadian, atau pengganti wawancara terstruktur.",
    "Weighted score: Role Technical Knowledge 60% and Work Psychology 40% (Integrity & Reliability 15%, Teamwork & Service 12.5%, Emotional Control & Adaptability 12.5%). The work-psychology inventory contains 30 questions across six traits; the role section contains 45 technical questions. Passing requires 75% overall, every section minimum, and no zero-point answer on a designated critical item.": "Nilai berbobot: Pengetahuan Teknis Posisi 60% dan Psikologi Kerja 40% (Integritas & Keandalan 15%, Kerja Sama & Pelayanan 12,5%, Pengendalian Emosi & Adaptasi 12,5%). Inventori psikologi kerja berisi 30 pertanyaan dalam enam karakteristik; bagian posisi berisi 45 pertanyaan teknis. Kelulusan memerlukan nilai keseluruhan 75%, setiap batas minimum bagian terpenuhi, dan tidak ada jawaban bernilai nol pada item kritis yang ditentukan.",
    "Show password": "Tampilkan kata sandi",
    "Hide password": "Sembunyikan kata sandi",
    "Manager follow-up": "Pendalaman oleh manajer",
    "Potential adjacent role based on the candidate's strongest work-psychology signal ({trait}) and the requested role family. Verify it with a separate role-specific interview or skills check.": "Posisi ini layak dipertimbangkan karena masih berdekatan dengan kelompok posisi yang diminta dan memanfaatkan sinyal psikologi kerja terkuat kandidat ({trait}). Tetap konfirmasikan melalui wawancara atau uji keterampilan khusus posisi tersebut.",
    "job-related work patterns": "pola kerja yang relevan",
    "Alternative positions to explore": "Posisi alternatif untuk dipertimbangkan",
    "Alternative roles are exploratory, not automatic placement decisions.": "Posisi alternatif hanya untuk bahan pertimbangan, bukan keputusan penempatan otomatis.",
    "PAGE 1 · PERSONALITY": "HALAMAN 1 · KEPRIBADIAN",
    "Candidate personality profile": "Profil kepribadian kandidat",
    "Job-related, non-clinical work traits": "Karakter kerja nonklinis yang relevan dengan pekerjaan",
    "PAGE 2 · JOB FIT": "HALAMAN 2 · KESESUAIAN POSISI",
    "Fit with the requested position": "Kesesuaian dengan posisi yang diminta",
    "Minimum met": "Memenuhi batas",
    "Below minimum": "Di bawah batas",
    "Requested position": "Posisi yang diminta",
    "Evidence supporting fit": "Bukti yang mendukung kesesuaian",
    "Evidence requiring verification": "Bukti yang perlu dikonfirmasi",
    "No section reached the strength marker; confirm capability in a structured interview.": "Belum ada bagian yang mencapai penanda kekuatan; konfirmasikan kemampuan melalui wawancara terstruktur.",
    "No major section priority was identified; verify technical knowledge in the interview.": "Tidak ada prioritas besar yang teridentifikasi; tetap konfirmasikan pengetahuan teknis saat wawancara.",
    "Recommended path": "Jalur yang direkomendasikan",
    "The requested position remains the recommended path. Continue with the standard structured interview and reference process.": "Posisi yang diminta tetap menjadi jalur yang direkomendasikan. Lanjutkan dengan wawancara terstruktur dan pemeriksaan referensi sesuai standar.",
    "PAGE 3 · DECISION SUPPORT": "HALAMAN 3 · DUKUNGAN KEPUTUSAN",
    "SWOT, development & next-best roles": "SWOT, pengembangan & posisi alternatif",
    "Practical guidance for a consistent, job-related manager review": "Panduan praktis untuk peninjauan manajer yang konsisten dan relevan dengan pekerjaan",
    "No verified strength signal.": "Belum ada sinyal kekuatan yang terkonfirmasi.",
    "No major weakness identified.": "Tidak ada kelemahan utama yang teridentifikasi.",
    "Continue structured development.": "Lanjutkan pengembangan secara terstruktur.",
    "Verify performance under live restaurant conditions.": "Konfirmasikan kinerja dalam kondisi operasional restoran yang nyata.",
    "What to develop": "Hal yang perlu dikembangkan",
    "Position recommendation": "Rekomendasi posisi",
    "Alternative positions to explore: {positions}": "Posisi alternatif untuk dipertimbangkan: {positions}",
    "The confidential PDF contains a three-page personality, job-fit, and SWOT/development report.": "PDF rahasia ini berisi tiga halaman: kepribadian, kesesuaian posisi, serta SWOT dan pengembangan.",
    "These adjacent roles may better match the current evidence. Each requires a separate role-specific interview or skills check.": "Posisi-posisi terkait ini mungkin lebih sesuai dengan bukti saat ini. Masing-masing tetap memerlukan wawancara atau uji keterampilan khusus posisi.",
    "Separate role-specific verification required.": "Perlu verifikasi khusus untuk posisi ini.",
  },
  es: {
    "Restaurant type": "Tipo de restaurante",
    "Job family": "Área de trabajo",
    "Experience level": "Nivel de experiencia",
    "Assessment path:": "Ruta de la evaluación:",
    "Choose a restaurant type, job family, position, and experience level.": "Elige el tipo de restaurante, el área de trabajo, el puesto y el nivel de experiencia.",
    "Choose a position from the selected job family.": "Elige un puesto dentro del área de trabajo seleccionada.",
    "Service model & price point": "Modelo de servicio y nivel de precios",
    "American restaurant concepts": "Conceptos de restaurantes estadounidenses",
    "Steak, barbecue & meat": "Steakhouse, BBQ y carnes",
    "Seafood concepts": "Conceptos de restaurantes de mariscos",
    "Japanese concepts": "Conceptos de restaurantes japoneses",
    "Chinese & Taiwanese concepts": "Conceptos chinos y taiwaneses",
    "Korean concepts": "Conceptos de restaurantes coreanos",
    "Southeast Asian concepts": "Conceptos del Sudeste Asiático",
    "Management": "Gerencia",
    "Kitchen Management": "Gerencia de Cocina",
    "Server & Guest Service": "Meseros y Atención al Cliente",
    "Host, Cashier & Front Desk": "Recepción, Caja y Reservas",
    "Bar & Beverage": "Bar y Bebidas",
    "Food Runner, Busser & Expo": "Food Runner, Busser y Expo",
    "General Kitchen / Cook": "Cocina General",
    "Japanese & Sushi": "Cocina Japonesa y Sushi",
    "Hibachi / Teppanyaki": "Hibachi / Teppanyaki",
    "Specialty Kitchen": "Cocina Especializada",
    "Takeout, Delivery & Catering": "Pedidos para Llevar, Entrega y Catering",
    "Utility, Cleaning & Support": "Limpieza y Apoyo Operativo",
    "Not recorded": "No registrado",
    "Restaurant type: {restaurant}": "Tipo de restaurante: {restaurant}",
    "Random work judgment": "Criterio laboral aleatorio",
    "Tailored technical": "Técnicas según el puesto",
    "Work psychology": "Psicología laboral",
    "{count} positions": "{count} puestos",
    "{family} selected": "Área seleccionada: {family}",
    "all {count} positions in this job family are shown above in alphabetical order.": "arriba aparecen los {count} puestos de esta área en orden alfabético.",
    "The assessment combines 30 non-clinical work-psychology questions with 45 technical questions tailored to the position you choose.": "La evaluación combina 30 preguntas de psicología laboral no clínica con 45 preguntas técnicas adaptadas al puesto elegido.",
    "Work-psychology statement.": "Afirmación de psicología laboral.",
    "Answer based on how you usually behave at work—not the answer that merely sounds ideal.": "Responde según tu conducta habitual en el trabajo, no según la opción que simplemente suene ideal.",
    "Technical section starts here.": "Aquí comienza la sección técnica.",
    "The next 45 questions are tailored to the restaurant concept, position, and experience level you selected.": "Las siguientes 45 preguntas se adaptan al concepto del restaurante, el puesto y el nivel de experiencia elegidos.",
    "Work Psychology · Integrity & Reliability": "Psicología laboral · Integridad y confiabilidad",
    "Work Psychology · Teamwork & Service": "Psicología laboral · Trabajo en equipo y servicio",
    "Work Psychology · Emotional Control & Adaptability": "Psicología laboral · Control emocional y adaptabilidad",
    "Integrity & reliability": "Integridad y confiabilidad",
    "Teamwork & service": "Trabajo en equipo y servicio",
    "Emotional control & adaptability": "Control emocional y adaptabilidad",
    "Technical knowledge": "Conocimientos técnicos",
    "Work psychology profile": "Perfil de psicología laboral",
    "Confidential report": "Informe confidencial",
    "Six non-clinical work traits based on the first 30 responses.": "Seis rasgos laborales no clínicos basados en las primeras 30 respuestas.",
    "30 psychology questions": "30 preguntas de psicología",
    "Manager follow-up:": "Seguimiento del gerente:",
    "This profile describes job-related response patterns. It is not a clinical test, personality diagnosis, or substitute for a structured interview.": "Este perfil describe patrones de respuesta relacionados con el trabajo. No es una prueba clínica, un diagnóstico de personalidad ni un sustituto de una entrevista estructurada.",
    "Weighted score: Role Technical Knowledge 60% and Work Psychology 40% (Integrity & Reliability 15%, Teamwork & Service 12.5%, Emotional Control & Adaptability 12.5%). The work-psychology inventory contains 30 questions across six traits; the role section contains 45 technical questions. Passing requires 75% overall, every section minimum, and no zero-point answer on a designated critical item.": "Puntuación ponderada: Conocimientos técnicos del puesto 60% y Psicología laboral 40% (Integridad y confiabilidad 15%, Trabajo en equipo y servicio 12,5%, Control emocional y adaptabilidad 12,5%). El inventario de psicología laboral contiene 30 preguntas sobre seis rasgos; la sección del puesto contiene 45 preguntas técnicas. Para aprobar se requiere un 75% general, cumplir el mínimo de cada sección y no obtener cero puntos en ningún elemento crítico designado.",
    "Show password": "Mostrar contraseña",
    "Hide password": "Ocultar contraseña",
    "Manager follow-up": "Seguimiento del gerente",
    "Potential adjacent role based on the candidate's strongest work-psychology signal ({trait}) and the requested role family. Verify it with a separate role-specific interview or skills check.": "Este puesto puede explorarse porque es cercano al área solicitada y aprovecha la señal más fuerte de psicología laboral del candidato ({trait}). Confírmalo con una entrevista o prueba de habilidades específica para ese puesto.",
    "job-related work patterns": "patrones laborales relevantes",
    "Alternative positions to explore": "Puestos alternativos para explorar",
    "Alternative roles are exploratory, not automatic placement decisions.": "Los puestos alternativos son opciones para explorar, no decisiones automáticas de asignación.",
    "PAGE 1 · PERSONALITY": "PÁGINA 1 · PERSONALIDAD",
    "Candidate personality profile": "Perfil de personalidad del candidato",
    "Job-related, non-clinical work traits": "Rasgos laborales no clínicos relacionados con el puesto",
    "PAGE 2 · JOB FIT": "PÁGINA 2 · COMPATIBILIDAD",
    "Fit with the requested position": "Compatibilidad con el puesto solicitado",
    "Minimum met": "Mínimo cumplido",
    "Below minimum": "Por debajo del mínimo",
    "Requested position": "Puesto solicitado",
    "Evidence supporting fit": "Evidencia que respalda la compatibilidad",
    "Evidence requiring verification": "Evidencia que requiere verificación",
    "No section reached the strength marker; confirm capability in a structured interview.": "Ninguna sección alcanzó el nivel de fortaleza; confirma la capacidad en una entrevista estructurada.",
    "No major section priority was identified; verify technical knowledge in the interview.": "No se detectó una prioridad principal; aun así, verifica los conocimientos técnicos en la entrevista.",
    "Recommended path": "Ruta recomendada",
    "The requested position remains the recommended path. Continue with the standard structured interview and reference process.": "El puesto solicitado sigue siendo la ruta recomendada. Continúa con la entrevista estructurada y la verificación de referencias habituales.",
    "PAGE 3 · DECISION SUPPORT": "PÁGINA 3 · APOYO A LA DECISIÓN",
    "SWOT, development & next-best roles": "FODA, desarrollo y puestos alternativos",
    "Practical guidance for a consistent, job-related manager review": "Guía práctica para una revisión gerencial uniforme y relacionada con el puesto",
    "No verified strength signal.": "No hay una señal de fortaleza verificada.",
    "No major weakness identified.": "No se identificó una debilidad principal.",
    "Continue structured development.": "Continúa con un plan de desarrollo estructurado.",
    "Verify performance under live restaurant conditions.": "Verifica el desempeño en condiciones reales de restaurante.",
    "What to develop": "Qué debe desarrollar",
    "Position recommendation": "Recomendación de puesto",
    "Alternative positions to explore: {positions}": "Puestos alternativos para explorar: {positions}",
    "The confidential PDF contains a three-page personality, job-fit, and SWOT/development report.": "El PDF confidencial contiene tres páginas: personalidad, compatibilidad con el puesto y FODA/desarrollo.",
    "These adjacent roles may better match the current evidence. Each requires a separate role-specific interview or skills check.": "Estos puestos relacionados pueden encajar mejor con la evidencia actual. Cada uno requiere una entrevista o prueba de habilidades específica.",
    "Separate role-specific verification required.": "Requiere verificación específica para el puesto.",
  },
  "zh-CN": {
    "Restaurant type": "餐厅类型", "Job family": "岗位类别", "Experience level": "经验水平", "Assessment path:": "测评路径：",
    "Choose a restaurant type, job family, position, and experience level.": "请选择餐厅类型、岗位类别、应聘职位和经验水平。",
    "Choose a position from the selected job family.": "请选择该岗位类别下的职位。",
    "Service model & price point": "服务模式与价格定位", "American restaurant concepts": "美式餐厅类型", "Steak, barbecue & meat": "牛排、烧烤与肉类餐厅",
    "Seafood concepts": "海鲜餐厅类型", "Japanese concepts": "日式餐厅类型", "Chinese & Taiwanese concepts": "中式与台式餐厅类型",
    "Korean concepts": "韩式餐厅类型", "Southeast Asian concepts": "东南亚餐厅类型", "Management": "餐厅管理",
    "Kitchen Management": "厨房管理", "Server & Guest Service": "餐厅服务与顾客接待", "Host, Cashier & Front Desk": "迎宾、收银与前台",
    "Bar & Beverage": "酒吧与饮品", "Food Runner, Busser & Expo": "传菜、清台与出餐协调", "General Kitchen / Cook": "综合厨房与厨师",
    "Japanese & Sushi": "日料与寿司", "Hibachi / Teppanyaki": "日式铁板烧", "Specialty Kitchen": "特色厨房",
    "Takeout, Delivery & Catering": "外带、外送与餐饮承办", "Utility, Cleaning & Support": "清洁与运营支持", "Not recorded": "未记录",
    "Restaurant type: {restaurant}": "餐厅类型：{restaurant}",
    "Random work judgment": "随机工作判断题", "Tailored technical": "岗位定制技术题",
    "Work psychology": "工作心理测评", "{count} positions": "{count} 个职位", "{family} selected": "已选择：{family}",
    "all {count} positions in this job family are shown above in alphabetical order.": "该岗位类别的全部 {count} 个职位已按字母顺序显示在上方。",
    "The assessment combines 30 non-clinical work-psychology questions with 45 technical questions tailored to the position you choose.": "本测评包含30道非临床工作心理题和45道根据所选职位定制的技术题。",
    "Work-psychology statement.": "工作心理陈述题。", "Answer based on how you usually behave at work—not the answer that merely sounds ideal.": "请按照你平时在工作中的实际表现作答，不要只选择听起来最理想的答案。",
    "Technical section starts here.": "技术部分从这里开始。", "The next 45 questions are tailored to the restaurant concept, position, and experience level you selected.": "接下来的45道题将根据你选择的餐厅类型、职位和经验水平生成。",
    "Work Psychology · Integrity & Reliability": "工作心理 · 诚信与可靠性", "Work Psychology · Teamwork & Service": "工作心理 · 团队合作与服务", "Work Psychology · Emotional Control & Adaptability": "工作心理 · 情绪调节与适应力",
    "Integrity & reliability": "诚信与可靠性", "Teamwork & service": "团队合作与服务", "Emotional control & adaptability": "情绪调节与适应力", "Technical knowledge": "岗位技术知识",
    "Work psychology profile": "工作心理画像", "Confidential report": "机密报告", "Six non-clinical work traits based on the first 30 responses.": "根据前30道回答分析六项非临床工作特质。", "30 psychology questions": "30道心理题", "Manager follow-up:": "经理复核问题：",
    "This profile describes job-related response patterns. It is not a clinical test, personality diagnosis, or substitute for a structured interview.": "本画像仅描述与工作相关的回答模式，不是临床测试、人格诊断，也不能替代结构化面试。",
    "Weighted score: Role Technical Knowledge 60% and Work Psychology 40% (Integrity & Reliability 15%, Teamwork & Service 12.5%, Emotional Control & Adaptability 12.5%). The work-psychology inventory contains 30 questions across six traits; the role section contains 45 technical questions. Passing requires 75% overall, every section minimum, and no zero-point answer on a designated critical item.": "加权分数：岗位技术知识60%，工作心理40%（诚信与可靠性15%、团队合作与服务12.5%、情绪调节与适应力12.5%）。工作心理部分包含六项特质共30题；岗位技术部分包含45题。通过要求：总分达到75%、每个部分达到最低标准，且指定关键题不得为零分。",
    "Show password": "显示密码", "Hide password": "隐藏密码", "Manager follow-up": "经理跟进",
    "Potential adjacent role based on the candidate's strongest work-psychology signal ({trait}) and the requested role family. Verify it with a separate role-specific interview or skills check.": "该岗位与应聘岗位类别相近，也能发挥候选人目前最强的工作心理信号（{trait}）。仍须通过该岗位专门的面试或技能测试确认是否适合。",
    "job-related work patterns": "与岗位相关的工作模式", "Alternative positions to explore": "可进一步评估的其他岗位", "Alternative roles are exploratory, not automatic placement decisions.": "其他岗位仅供进一步评估，不代表自动调岗或录用。",
    "PAGE 1 · PERSONALITY": "第1页 · 个性特征", "Candidate personality profile": "候选人个性特征", "Job-related, non-clinical work traits": "与岗位相关的非临床工作特质",
    "PAGE 2 · JOB FIT": "第2页 · 岗位匹配", "Fit with the requested position": "与应聘岗位的匹配度", "Minimum met": "达到最低标准", "Below minimum": "低于最低标准", "Requested position": "应聘岗位",
    "Evidence supporting fit": "支持岗位匹配的证据", "Evidence requiring verification": "需要进一步核实的证据", "No section reached the strength marker; confirm capability in a structured interview.": "暂无任何部分达到优势标准，请通过结构化面试确认能力。", "No major section priority was identified; verify technical knowledge in the interview.": "未发现主要优先改进项，但仍应在面试中核实技术知识。",
    "Recommended path": "建议方向", "The requested position remains the recommended path. Continue with the standard structured interview and reference process.": "应聘岗位仍是建议方向，请继续进行标准的结构化面试和背景核实。",
    "PAGE 3 · DECISION SUPPORT": "第3页 · 决策支持", "SWOT, development & next-best roles": "SWOT、发展重点与其他岗位", "Practical guidance for a consistent, job-related manager review": "用于一致、与岗位相关的经理复核的实用建议",
    "No verified strength signal.": "暂无已确认的优势信号。", "No major weakness identified.": "未发现主要弱项。", "Continue structured development.": "继续开展结构化培养。", "Verify performance under live restaurant conditions.": "请在真实餐厅工作环境中核实表现。", "What to develop": "需要发展的方面", "Position recommendation": "岗位建议",
    "Alternative positions to explore: {positions}": "可进一步评估的岗位：{positions}", "The confidential PDF contains a three-page personality, job-fit, and SWOT/development report.": "机密PDF共三页，分别包含个性特征、岗位匹配以及SWOT与发展建议。",
    "These adjacent roles may better match the current evidence. Each requires a separate role-specific interview or skills check.": "这些相关岗位可能更符合目前的证据，但每个岗位仍需单独进行岗位面试或技能测试。", "Separate role-specific verification required.": "需要针对该岗位另行核实。",
  },
  "zh-TW": {
    "Restaurant type": "餐廳類型", "Job family": "職位類別", "Experience level": "經驗程度", "Assessment path:": "測評路徑：",
    "Choose a restaurant type, job family, position, and experience level.": "請選擇餐廳類型、職位類別、應徵職位和經驗程度。",
    "Choose a position from the selected job family.": "請選擇該職位類別下的職位。",
    "Service model & price point": "服務模式與價格定位", "American restaurant concepts": "美式餐廳類型", "Steak, barbecue & meat": "牛排、燒烤與肉類餐廳",
    "Seafood concepts": "海鮮餐廳類型", "Japanese concepts": "日式餐廳類型", "Chinese & Taiwanese concepts": "中式與台式餐廳類型",
    "Korean concepts": "韓式餐廳類型", "Southeast Asian concepts": "東南亞餐廳類型", "Management": "餐廳管理",
    "Kitchen Management": "廚房管理", "Server & Guest Service": "餐廳服務與顧客接待", "Host, Cashier & Front Desk": "迎賓、收銀與前台",
    "Bar & Beverage": "酒吧與飲品", "Food Runner, Busser & Expo": "傳菜、清台與出餐協調", "General Kitchen / Cook": "綜合廚房與廚師",
    "Japanese & Sushi": "日料與壽司", "Hibachi / Teppanyaki": "日式鐵板燒", "Specialty Kitchen": "特色廚房",
    "Takeout, Delivery & Catering": "外帶、外送與餐飲承辦", "Utility, Cleaning & Support": "清潔與營運支援", "Not recorded": "未記錄",
    "Restaurant type: {restaurant}": "餐廳類型：{restaurant}",
    "Random work judgment": "隨機工作判斷題", "Tailored technical": "職位客製技術題",
    "Work psychology": "工作心理測評", "{count} positions": "{count} 個職位", "{family} selected": "已選擇：{family}",
    "all {count} positions in this job family are shown above in alphabetical order.": "該職位類別的全部 {count} 個職位已按字母順序顯示在上方。",
    "The assessment combines 30 non-clinical work-psychology questions with 45 technical questions tailored to the position you choose.": "本測評包含30道非臨床工作心理題和45道依所選職位設計的技術題。",
    "Work-psychology statement.": "工作心理陳述題。", "Answer based on how you usually behave at work—not the answer that merely sounds ideal.": "請按照你平時在工作中的實際表現作答，不要只選擇聽起來最理想的答案。",
    "Technical section starts here.": "技術部分從這裡開始。", "The next 45 questions are tailored to the restaurant concept, position, and experience level you selected.": "接下來的45道題將依你選擇的餐廳類型、職位和經驗程度產生。",
    "Work Psychology · Integrity & Reliability": "工作心理 · 誠信與可靠性", "Work Psychology · Teamwork & Service": "工作心理 · 團隊合作與服務", "Work Psychology · Emotional Control & Adaptability": "工作心理 · 情緒調節與適應力",
    "Integrity & reliability": "誠信與可靠性", "Teamwork & service": "團隊合作與服務", "Emotional control & adaptability": "情緒調節與適應力", "Technical knowledge": "職位技術知識",
    "Work psychology profile": "工作心理分析", "Confidential report": "機密報告", "Six non-clinical work traits based on the first 30 responses.": "依前30道回答分析六項非臨床工作特質。", "30 psychology questions": "30道心理題", "Manager follow-up:": "經理複核問題：",
    "This profile describes job-related response patterns. It is not a clinical test, personality diagnosis, or substitute for a structured interview.": "本分析僅描述與工作相關的回答模式，不是臨床測試、人格診斷，也不能取代結構化面試。",
    "Weighted score: Role Technical Knowledge 60% and Work Psychology 40% (Integrity & Reliability 15%, Teamwork & Service 12.5%, Emotional Control & Adaptability 12.5%). The work-psychology inventory contains 30 questions across six traits; the role section contains 45 technical questions. Passing requires 75% overall, every section minimum, and no zero-point answer on a designated critical item.": "加權分數：職位技術知識60%，工作心理40%（誠信與可靠性15%、團隊合作與服務12.5%、情緒調節與適應力12.5%）。工作心理部分包含六項特質共30題；職位技術部分包含45題。通過要求：總分達到75%、每個部分達到最低標準，且指定關鍵題不得為零分。",
    "Show password": "顯示密碼", "Hide password": "隱藏密碼", "Manager follow-up": "經理跟進",
    "Potential adjacent role based on the candidate's strongest work-psychology signal ({trait}) and the requested role family. Verify it with a separate role-specific interview or skills check.": "該職位與應徵職位類別相近，也能發揮候選人目前最強的工作心理信號（{trait}）。仍須透過該職位專門的面試或技能測試確認是否適合。",
    "job-related work patterns": "與職位相關的工作模式", "Alternative positions to explore": "可進一步評估的其他職位", "Alternative roles are exploratory, not automatic placement decisions.": "其他職位僅供進一步評估，不代表自動調職或錄用。",
    "PAGE 1 · PERSONALITY": "第1頁 · 個性特徵", "Candidate personality profile": "候選人個性特徵", "Job-related, non-clinical work traits": "與職位相關的非臨床工作特質",
    "PAGE 2 · JOB FIT": "第2頁 · 職位匹配", "Fit with the requested position": "與應徵職位的匹配度", "Minimum met": "達到最低標準", "Below minimum": "低於最低標準", "Requested position": "應徵職位",
    "Evidence supporting fit": "支持職位匹配的證據", "Evidence requiring verification": "需要進一步核實的證據", "No section reached the strength marker; confirm capability in a structured interview.": "暫無任何部分達到優勢標準，請透過結構化面試確認能力。", "No major section priority was identified; verify technical knowledge in the interview.": "未發現主要優先改進項，但仍應在面試中核實技術知識。",
    "Recommended path": "建議方向", "The requested position remains the recommended path. Continue with the standard structured interview and reference process.": "應徵職位仍是建議方向，請繼續進行標準的結構化面試和背景核實。",
    "PAGE 3 · DECISION SUPPORT": "第3頁 · 決策支援", "SWOT, development & next-best roles": "SWOT、發展重點與其他職位", "Practical guidance for a consistent, job-related manager review": "用於一致、與職位相關的經理複核的實用建議",
    "No verified strength signal.": "暫無已確認的優勢信號。", "No major weakness identified.": "未發現主要弱項。", "Continue structured development.": "繼續進行結構化培訓。", "Verify performance under live restaurant conditions.": "請在真實餐廳工作環境中核實表現。", "What to develop": "需要發展的方面", "Position recommendation": "職位建議",
    "Alternative positions to explore: {positions}": "可進一步評估的職位：{positions}", "The confidential PDF contains a three-page personality, job-fit, and SWOT/development report.": "機密PDF共三頁，分別包含個性特徵、職位匹配以及SWOT與發展建議。",
    "These adjacent roles may better match the current evidence. Each requires a separate role-specific interview or skills check.": "這些相關職位可能更符合目前的證據，但每個職位仍需另行進行職位面試或技能測試。", "Separate role-specific verification required.": "需要針對該職位另行核實。",
  },
};
const localeStorageKey = "fred-hiring-language";

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && appLocales.includes(value as AppLocale);
}

export function intlLocale(locale: AppLocale) {
  return locale === "id"
    ? "id-ID"
    : locale === "es"
      ? "es-US"
      : locale;
}

export function translate(locale: AppLocale, source: string, values: TranslationValues = {}) {
  const template = locale === "en" ? source : translations[locale]?.[source] || supplementalTranslations[locale]?.[source] || source;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match
  ));
}

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (source: string, values?: TranslationValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function initialLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(localeStorageKey);
  if (isAppLocale(saved)) return saved;
  const browser = window.navigator.language.toLowerCase();
  if (browser.startsWith("id")) return "id";
  if (browser.startsWith("es")) return "es";
  if (browser.startsWith("zh-tw") || browser.startsWith("zh-hk") || browser.startsWith("zh-mo")) return "zh-TW";
  if (browser.startsWith("zh")) return "zh-CN";
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(localeStorageKey, nextLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (source: string, values?: TranslationValues) => translate(locale, source, values),
    [locale],
  );
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider.");
  return context;
}
