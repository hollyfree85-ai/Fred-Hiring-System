import type { AppLocale } from "@/lib/i18n";
import type { PsychologyTrait } from "@/lib/question-bank";

export type PsychologyLocalizedQuestion = {
  prompt: string;
  reviewNote: string;
  options: Record<string, string>;
};

const traits: PsychologyTrait[] = [
  ...Array<PsychologyTrait>(5).fill("integrity"),
  ...Array<PsychologyTrait>(5).fill("conscientiousness"),
  ...Array<PsychologyTrait>(5).fill("teamwork"),
  ...Array<PsychologyTrait>(5).fill("service_orientation"),
  ...Array<PsychologyTrait>(5).fill("emotional_regulation"),
  ...Array<PsychologyTrait>(5).fill("adaptability"),
];

const prompts: Record<Exclude<AppLocale, "en">, string[]> = {
  id: [
    "Saya segera melaporkan kesalahan saya sendiri, meskipun belum ada orang lain yang mengetahuinya.",
    "Saya kadang menyembunyikan kesalahan kecil jika mengakuinya akan memperlambat pekerjaan.",
    "Saya menceritakan kejadian dengan jujur, meskipun hasilnya bisa membuat saya terlihat kurang baik.",
    "Saya bersedia melanggar aturan yang merepotkan tanpa meminta izin terlebih dahulu.",
    "Saya menjaga informasi pribadi tetap rahasia, meskipun membagikannya bisa membuat saya merasa diterima dalam kelompok.",
    "Saya memeriksa detail penting sebelum menyatakan sebuah tugas sudah selesai.",
    "Saat pekerjaan terasa berulang, saya cenderung berhenti memeriksa ketepatannya.",
    "Saya mengatur prioritas agar pekerjaan penting selesai tepat waktu.",
    "Saya menepati komitmen tanpa perlu diingatkan berulang kali.",
    "Jika mungkin terlambat atau melewati tenggat, saya memberi tahu lebih awal.",
    "Setelah tanggung jawab saya aman, saya menawarkan bantuan saat rekan kerja kewalahan.",
    "Saya mendengarkan pendapat orang lain sampai selesai sebelum membela pendapat saya.",
    "Saat berbeda pendapat, saya lebih fokus menyelesaikan masalah daripada memenangkan perdebatan.",
    "Saya menyampaikan informasi yang dibutuhkan orang lain agar serah terima berjalan lancar.",
    "Saya menghindari membantu pekerjaan yang tidak secara khusus diberikan kepada saya.",
    "Saya segera menyapa atau mengakui kehadiran seseorang, walaupun belum bisa langsung membantu.",
    "Saya tetap menghormati orang lain saat mereka tidak sabar atau banyak menuntut.",
    "Saya memastikan kebutuhan seseorang dengan bertanya, bukan langsung berasumsi.",
    "Bila perlu, saya menindaklanjuti untuk memastikan permintaan benar-benar sudah diselesaikan.",
    "Jika bukan saya yang menyebabkan masalah, saya merasa tidak bertanggung jawab untuk membantu menyelesaikannya.",
    "Di bawah tekanan, saya tetap melambat secukupnya agar pekerjaan akurat dan aman.",
    "Kritik atau koreksi dapat memengaruhi nada bicara saya sampai pekerjaan berakhir.",
    "Saya bisa menenangkan diri dan kembali fokus setelah interaksi yang sulit.",
    "Saat beberapa orang membutuhkan bantuan bersamaan, saya tetap tenang dan menentukan mana yang harus didahulukan.",
    "Walaupun sedang kesal, kata-kata dan bahasa tubuh saya tetap profesional.",
    "Saya cepat menyesuaikan diri ketika prioritas berubah secara mendadak.",
    "Saat tugas belum saya kenal, saya mengajukan pertanyaan yang jelas dan mempelajari cara yang disetujui.",
    "Setelah proses baru dijelaskan, saya biasanya tetap menggunakan cara lama.",
    "Saya dapat bekerja produktif dengan orang yang gaya kerjanya berbeda dari saya.",
    "Ketika rencana awal gagal, saya mencari langkah berikutnya yang bisa dilakukan daripada terhenti.",
  ],
  es: [
    "Informo de inmediato un error propio, aunque nadie más lo haya notado.",
    "A veces oculto un error pequeño si admitirlo retrasaría el trabajo.",
    "Explico con exactitud lo que ocurrió, aunque pueda dejarme en una posición desfavorable.",
    "Estoy dispuesto a saltarme una regla incómoda sin pedir autorización primero.",
    "Protejo la información privada, aunque compartirla pudiera hacerme sentir parte del grupo.",
    "Reviso los detalles importantes antes de decir que una tarea está terminada.",
    "Cuando el trabajo se vuelve repetitivo, tiendo a dejar de revisar mi precisión.",
    "Organizo mis prioridades para terminar a tiempo el trabajo importante.",
    "Cumplo mis compromisos sin necesitar recordatorios constantes.",
    "Si podría llegar tarde o incumplir un plazo, aviso con anticipación.",
    "Después de asegurar mis propias responsabilidades, ofrezco ayuda cuando un compañero está sobrecargado.",
    "Escucho por completo el punto de vista de otra persona antes de defender el mío.",
    "Durante un desacuerdo, me concentro más en resolver el problema que en ganar la discusión.",
    "Comparto la información que otra persona necesita para recibir bien una tarea.",
    "Evito ayudar con tareas que no me asignaron específicamente.",
    "Reconozco pronto a una persona, aunque todavía no pueda atenderla.",
    "Mantengo el respeto cuando la otra persona está impaciente o es exigente.",
    "Aclaro lo que alguien necesita en vez de suponer que ya lo entiendo.",
    "Cuando hace falta, doy seguimiento para confirmar que una solicitud sí quedó resuelta.",
    "Si yo no causé un problema, no siento que sea mi responsabilidad ayudar a resolverlo.",
    "Bajo presión, reduzco el ritmo lo suficiente para mantener la precisión y la seguridad.",
    "Una corrección puede afectar mi tono durante el resto de la jornada.",
    "Puedo recuperarme y volver a concentrarme después de una interacción difícil.",
    "Cuando varias personas necesitan algo a la vez, mantengo la calma y decido qué atender primero.",
    "Incluso cuando estoy frustrado, mantengo profesionales mis palabras y mi lenguaje corporal.",
    "Me adapto rápidamente cuando las prioridades cambian sin aviso.",
    "Cuando una tarea es nueva para mí, hago preguntas concretas y aprendo el método aprobado.",
    "Después de que me explican un proceso nuevo, normalmente sigo usando mi método anterior.",
    "Puedo trabajar de manera productiva con personas cuyo estilo de trabajo es diferente al mío.",
    "Cuando el plan original falla, busco el siguiente paso posible en vez de quedarme paralizado.",
  ],
  "zh-CN": [
    "即使别人还没有发现，我也会及时报告自己的错误。",
    "如果承认一个小错误会拖慢工作，我有时会把它隐瞒起来。",
    "即使事实可能对我不利，我也会准确说明事情经过。",
    "遇到不方便的规定时，我愿意不先请示就变通。",
    "即使分享私密信息能让我更有参与感，我也会保护这些信息。",
    "在说任务已经完成之前，我会检查重要细节。",
    "工作变得重复时，我往往会不再检查准确性。",
    "我会安排好优先顺序，确保重要工作按时完成。",
    "不需要别人反复提醒，我也会履行自己的承诺。",
    "如果我可能迟到或无法按时完成，我会提前说明。",
    "在确保自己的职责不受影响后，我会主动帮助忙不过来的同事。",
    "在为自己辩解前，我会先听完对方的观点。",
    "发生分歧时，我更注重解决问题，而不是争个输赢。",
    "交接工作时，我会把对方需要的信息说明清楚。",
    "如果一项工作没有明确分配给我，我会避免帮忙。",
    "即使不能马上提供帮助，我也会及时回应对方。",
    "即使对方不耐烦或要求很多，我也会保持尊重。",
    "我会先确认对方真正需要什么，而不是想当然。",
    "必要时，我会跟进确认对方的请求确实已经解决。",
    "如果问题不是我造成的，我就不觉得自己有责任帮忙解决。",
    "在压力下，我会适当放慢速度，以保证准确和安全。",
    "受到纠正后，我的说话语气可能会受影响直到工作结束。",
    "经历不愉快的互动后，我能够调整好状态并重新专注。",
    "多人同时提出需求时，我能保持冷静并判断先处理什么。",
    "即使感到不满，我也能让言语和肢体表现保持专业。",
    "工作重点突然改变时，我能很快调整。",
    "遇到不熟悉的任务时，我会提出具体问题并学习获准的方法。",
    "即使别人已经说明新流程，我通常还是继续使用旧方法。",
    "我能与工作方式和我不同的人高效合作。",
    "原计划行不通时，我会寻找下一步可行办法，而不是停在那里。",
  ],
  "zh-TW": [
    "即使別人還沒有發現，我也會及時報告自己的錯誤。",
    "如果承認一個小錯誤會拖慢工作，我有時會把它隱瞞起來。",
    "即使事實可能對我不利，我也會準確說明事情經過。",
    "遇到不方便的規定時，我願意不先請示就變通。",
    "即使分享私密資訊能讓我更有參與感，我也會保護這些資訊。",
    "在說任務已經完成之前，我會檢查重要細節。",
    "工作變得重複時，我往往會不再檢查準確性。",
    "我會安排好優先順序，確保重要工作按時完成。",
    "不需要別人反覆提醒，我也會履行自己的承諾。",
    "如果我可能遲到或無法按時完成，我會提前說明。",
    "在確保自己的職責不受影響後，我會主動幫助忙不過來的同事。",
    "在為自己辯解前，我會先聽完對方的觀點。",
    "發生分歧時，我更注重解決問題，而不是爭個輸贏。",
    "交接工作時，我會把對方需要的資訊說明清楚。",
    "如果一項工作沒有明確分配給我，我會避免幫忙。",
    "即使不能馬上提供幫助，我也會及時回應對方。",
    "即使對方不耐煩或要求很多，我也會保持尊重。",
    "我會先確認對方真正需要什麼，而不是想當然。",
    "必要時，我會跟進確認對方的要求確實已經解決。",
    "如果問題不是我造成的，我就不覺得自己有責任幫忙解決。",
    "在壓力下，我會適當放慢速度，以確保準確和安全。",
    "受到糾正後，我的說話語氣可能會受影響直到工作結束。",
    "經歷不愉快的互動後，我能夠調整好狀態並重新專注。",
    "多人同時提出需求時，我能保持冷靜並判斷先處理什麼。",
    "即使感到不滿，我也能讓言語和肢體表現保持專業。",
    "工作重點突然改變時，我能很快調整。",
    "遇到不熟悉的任務時，我會提出具體問題並學習核准的方法。",
    "即使別人已經說明新流程，我通常還是繼續使用舊方法。",
    "我能與工作方式和我不同的人有效合作。",
    "原計畫行不通時，我會尋找下一步可行辦法，而不是停在原地。",
  ],
};

const frequencyOptions: Record<Exclude<AppLocale, "en">, string[]> = {
  id: ["Hampir selalu sesuai dengan diri saya", "Sering sesuai dengan diri saya", "Kadang-kadang sesuai dengan diri saya", "Jarang sesuai dengan diri saya"],
  es: ["Casi siempre me describe", "Con frecuencia me describe", "A veces me describe", "Casi nunca me describe"],
  "zh-CN": ["几乎总是符合我", "经常符合我", "有时符合我", "很少符合我"],
  "zh-TW": ["幾乎總是符合我", "經常符合我", "有時符合我", "很少符合我"],
};

const reviewNotes: Record<Exclude<AppLocale, "en">, Record<PsychologyTrait, string>> = {
  id: {
    integrity: "Menilai kejujuran, tanggung jawab, kepatuhan pada batas wewenang, dan kerahasiaan.",
    conscientiousness: "Menilai ketelitian, perencanaan, konsistensi, dan kemampuan menepati komitmen.",
    teamwork: "Menilai cara mendengarkan, bekerja sama, menangani perbedaan, dan melakukan serah terima.",
    service_orientation: "Menilai kepedulian, rasa hormat, klarifikasi kebutuhan, dan tindak lanjut.",
    emotional_regulation: "Menilai ketenangan, pemulihan setelah tekanan, dan perilaku profesional.",
    adaptability: "Menilai keluwesan, kemauan belajar, dan kemampuan mencari langkah berikutnya.",
  },
  es: {
    integrity: "Evalúa honestidad, responsabilidad, respeto de los límites de autoridad y confidencialidad.",
    conscientiousness: "Evalúa atención al detalle, planificación, constancia y cumplimiento de compromisos.",
    teamwork: "Evalúa escucha, colaboración, manejo de desacuerdos y calidad de los relevos.",
    service_orientation: "Evalúa atención, respeto, aclaración de necesidades y seguimiento.",
    emotional_regulation: "Evalúa calma, recuperación bajo presión y conducta profesional.",
    adaptability: "Evalúa flexibilidad, disposición para aprender y búsqueda de soluciones.",
  },
  "zh-CN": {
    integrity: "评估诚实、担当、遵守授权范围和保护隐私的倾向。",
    conscientiousness: "评估细节意识、计划性、稳定性和履行承诺的倾向。",
    teamwork: "评估倾听、协作、处理分歧和工作交接的倾向。",
    service_orientation: "评估关心他人、尊重、澄清需求和跟进的倾向。",
    emotional_regulation: "评估冷静应对压力、恢复专注和保持专业的倾向。",
    adaptability: "评估灵活调整、主动学习和寻找可行办法的倾向。",
  },
  "zh-TW": {
    integrity: "評估誠實、擔當、遵守授權範圍和保護隱私的傾向。",
    conscientiousness: "評估細節意識、計畫性、穩定性和履行承諾的傾向。",
    teamwork: "評估傾聽、協作、處理分歧和工作交接的傾向。",
    service_orientation: "評估關心他人、尊重、釐清需求和跟進的傾向。",
    emotional_regulation: "評估冷靜面對壓力、恢復專注和保持專業的傾向。",
    adaptability: "評估彈性調整、主動學習和尋找可行辦法的傾向。",
  },
};

export function psychologyLocalizedQuestion(
  sourceQuestionId: string,
  locale: AppLocale,
): PsychologyLocalizedQuestion | null {
  if (locale === "en") return null;
  const match = /^WP(\d{2})$/.exec(sourceQuestionId);
  if (!match) return null;
  const index = Number(match[1]) - 1;
  if (index < 0 || index >= prompts[locale].length) return null;
  const optionTexts = frequencyOptions[locale];
  return {
    prompt: prompts[locale][index],
    reviewNote: reviewNotes[locale][traits[index]],
    options: Object.fromEntries(optionTexts.map((text, optionIndex) => [
      `${sourceQuestionId}-${String.fromCharCode(97 + optionIndex)}`,
      text,
    ])),
  };
}

type PsychologyBand = "strong" | "develop" | "priority";

const analysisCopy: Record<AppLocale, {
  bands: Record<PsychologyBand, string>;
  templates: Record<PsychologyBand, string>;
  traits: Record<PsychologyTrait, { label: string; focus: string; followUp: string }>;
}> = {
  en: {
    bands: { strong: "Strong signal", develop: "Confirm in interview", priority: "Priority review" },
    templates: {
      strong: "Responses consistently support {focus}.",
      develop: "Responses generally support {focus}, but consistency should be confirmed with specific examples.",
      priority: "Responses suggest a meaningful risk around {focus}; use structured follow-up before relying on this area.",
    },
    traits: {
      integrity: { label: "Integrity & Accountability", focus: "honest reporting, ownership, confidentiality, and respect for authorization boundaries", followUp: "Ask for a specific example of a mistake they reported before anyone else noticed and what happened next." },
      conscientiousness: { label: "Conscientiousness & Follow-through", focus: "detail checking, planning, dependable follow-through, and early communication about missed commitments", followUp: "Ask how they organize several deadlines and prevent small details from being missed during repetitive work." },
      teamwork: { label: "Teamwork & Listening", focus: "active listening, constructive disagreement, useful handoffs, and balanced help for teammates", followUp: "Ask about a disagreement with a coworker: what they heard, what they said, and how the team reached a workable result." },
      service_orientation: { label: "Service Orientation", focus: "prompt acknowledgment, respect, clarification of needs, ownership, and follow-up", followUp: "Ask for an example of helping someone with a problem they did not personally cause and how they confirmed it was resolved." },
      emotional_regulation: { label: "Emotional Regulation", focus: "calm prioritization, professional tone, recovery after difficult interactions, and accuracy under pressure", followUp: "Ask what they do in the first minute after receiving difficult feedback during a busy work period." },
      adaptability: { label: "Adaptability & Learning Agility", focus: "learning approved methods, adjusting to change, working across different styles, and finding the next workable step", followUp: "Ask for an example of replacing a familiar method with a new process and how they made sure the change worked." },
    },
  },
  id: {
    bands: { strong: "Sinyal kuat", develop: "Konfirmasi saat wawancara", priority: "Prioritas untuk ditinjau" },
    templates: {
      strong: "Jawaban menunjukkan pola yang kuat dan konsisten dalam {focus}.",
      develop: "Jawaban umumnya mendukung {focus}, tetapi konsistensinya perlu dikonfirmasi dengan contoh nyata.",
      priority: "Jawaban menunjukkan risiko yang perlu diperhatikan terkait {focus}; lakukan wawancara terstruktur sebelum mengandalkan area ini.",
    },
    traits: {
      integrity: { label: "Integritas & Tanggung Jawab", focus: "pelaporan yang jujur, sikap bertanggung jawab, kerahasiaan, dan kepatuhan pada batas wewenang", followUp: "Minta contoh spesifik ketika kandidat melaporkan kesalahannya sebelum diketahui orang lain, lalu tanyakan apa yang terjadi setelahnya." },
      conscientiousness: { label: "Ketelitian & Konsistensi", focus: "pemeriksaan detail, perencanaan, ketuntasan kerja, dan komunikasi dini saat komitmen mungkin tidak terpenuhi", followUp: "Tanyakan cara kandidat mengatur beberapa tenggat sekaligus dan mencegah detail kecil terlewat saat pekerjaan berulang." },
      teamwork: { label: "Kerja Sama & Mendengarkan", focus: "mendengarkan aktif, menangani perbedaan secara konstruktif, serah terima yang jelas, dan membantu tim secara seimbang", followUp: "Tanyakan satu konflik dengan rekan kerja: apa yang kandidat dengar, katakan, dan lakukan sampai tim menemukan solusi." },
      service_orientation: { label: "Orientasi Pelayanan", focus: "respons cepat, sikap hormat, klarifikasi kebutuhan, rasa memiliki masalah, dan tindak lanjut", followUp: "Minta contoh saat kandidat membantu menyelesaikan masalah yang bukan disebabkan olehnya dan cara memastikan masalah itu selesai." },
      emotional_regulation: { label: "Pengendalian Emosi", focus: "menentukan prioritas dengan tenang, menjaga nada profesional, pulih setelah interaksi sulit, dan tetap akurat di bawah tekanan", followUp: "Tanyakan apa yang kandidat lakukan pada menit pertama setelah menerima koreksi yang sulit di tengah kesibukan." },
      adaptability: { label: "Adaptasi & Kecepatan Belajar", focus: "mempelajari cara yang disetujui, menyesuaikan diri terhadap perubahan, bekerja dengan gaya yang berbeda, dan mencari langkah berikutnya", followUp: "Minta contoh saat kandidat mengganti cara lama dengan proses baru dan bagaimana ia memastikan perubahan itu berhasil." },
    },
  },
  es: {
    bands: { strong: "Señal sólida", develop: "Confirmar en entrevista", priority: "Revisión prioritaria" },
    templates: {
      strong: "Las respuestas muestran un patrón sólido y constante en {focus}.",
      develop: "Las respuestas generalmente respaldan {focus}, pero conviene confirmar la constancia con ejemplos concretos.",
      priority: "Las respuestas muestran un riesgo importante en {focus}; realiza un seguimiento estructurado antes de confiar en esta área.",
    },
    traits: {
      integrity: { label: "Integridad y responsabilidad", focus: "informar con honestidad, asumir responsabilidad, guardar confidencialidad y respetar los límites de autoridad", followUp: "Pide un ejemplo concreto de un error que informó antes de que alguien más lo notara y pregunta qué ocurrió después." },
      conscientiousness: { label: "Responsabilidad y seguimiento", focus: "revisar detalles, planificar, cumplir compromisos y avisar con tiempo cuando algo podría retrasarse", followUp: "Pregunta cómo organiza varios plazos y evita pasar por alto detalles pequeños durante un trabajo repetitivo." },
      teamwork: { label: "Trabajo en equipo y escucha", focus: "escuchar activamente, manejar desacuerdos, entregar información útil y ayudar al equipo sin descuidar responsabilidades", followUp: "Pregunta por un desacuerdo con un compañero: qué escuchó, qué dijo y cómo llegaron a una solución práctica." },
      service_orientation: { label: "Orientación al servicio", focus: "responder pronto, mantener el respeto, aclarar necesidades, asumir el problema y dar seguimiento", followUp: "Pide un ejemplo de cómo ayudó con un problema que no causó y cómo confirmó que quedó resuelto." },
      emotional_regulation: { label: "Regulación emocional", focus: "priorizar con calma, mantener un tono profesional, recuperarse de interacciones difíciles y conservar la precisión bajo presión", followUp: "Pregunta qué hace durante el primer minuto después de recibir una corrección difícil en un momento de alta demanda." },
      adaptability: { label: "Adaptabilidad y agilidad para aprender", focus: "aprender métodos aprobados, adaptarse a cambios, colaborar con estilos distintos y encontrar el siguiente paso posible", followUp: "Pide un ejemplo de cómo reemplazó un método conocido por un proceso nuevo y cómo comprobó que funcionaba." },
    },
  },
  "zh-CN": {
    bands: { strong: "表现突出", develop: "面试中确认", priority: "重点复核" },
    templates: { strong: "回答持续体现出良好的{focus}。", develop: "回答总体体现出{focus}，但仍需通过具体事例确认其稳定性。", priority: "回答显示在{focus}方面存在明显风险；在依赖这一能力前应进行结构化复核。" },
    traits: {
      integrity: { label: "诚信与担当", focus: "诚实报告、主动承担责任、保护隐私以及遵守授权范围", followUp: "请候选人举例说明一次在别人发现前主动报告错误的经历，并追问后来如何处理。" },
      conscientiousness: { label: "严谨与执行力", focus: "检查细节、合理计划、可靠完成承诺以及在可能延误时提前沟通", followUp: "询问候选人如何安排多个期限，以及如何在重复工作中避免遗漏小细节。" },
      teamwork: { label: "团队合作与倾听", focus: "积极倾听、建设性处理分歧、清晰交接以及在不影响本职工作的前提下帮助同事", followUp: "询问一次与同事意见不合的经历：听到了什么、说了什么，团队最后如何达成可行结果。" },
      service_orientation: { label: "服务意识", focus: "及时回应、保持尊重、确认需求、主动承担问题并跟进结果", followUp: "请候选人举例说明如何帮助解决一个并非由自己造成的问题，以及如何确认问题已经解决。" },
      emotional_regulation: { label: "情绪调节", focus: "冷静确定优先级、保持专业语气、从困难互动中恢复以及在压力下保持准确", followUp: "询问候选人在忙碌时收到难以接受的纠正后，第一分钟会做什么。" },
      adaptability: { label: "适应力与学习敏捷度", focus: "学习获准方法、适应变化、与不同工作风格合作以及寻找下一步可行办法", followUp: "请候选人举例说明如何用新流程替代熟悉的方法，以及如何确认新流程有效。" },
    },
  },
  "zh-TW": {
    bands: { strong: "表現突出", develop: "面試中確認", priority: "重點複核" },
    templates: { strong: "回答持續展現良好的{focus}。", develop: "回答整體展現出{focus}，但仍需透過具體事例確認其穩定性。", priority: "回答顯示在{focus}方面存在明顯風險；在依賴這項能力前應進行結構化複核。" },
    traits: {
      integrity: { label: "誠信與擔當", focus: "誠實報告、主動承擔責任、保護隱私以及遵守授權範圍", followUp: "請候選人舉例說明一次在別人發現前主動報告錯誤的經歷，並追問後來如何處理。" },
      conscientiousness: { label: "嚴謹與執行力", focus: "檢查細節、合理規劃、可靠履行承諾以及在可能延誤時提前溝通", followUp: "詢問候選人如何安排多個期限，以及如何在重複工作中避免遺漏小細節。" },
      teamwork: { label: "團隊合作與傾聽", focus: "積極傾聽、建設性處理分歧、清楚交接以及在不影響本職工作的前提下幫助同事", followUp: "詢問一次與同事意見不合的經歷：聽到了什麼、說了什麼，團隊最後如何達成可行結果。" },
      service_orientation: { label: "服務意識", focus: "及時回應、保持尊重、確認需求、主動承擔問題並追蹤結果", followUp: "請候選人舉例說明如何協助解決一個並非由自己造成的問題，以及如何確認問題已經解決。" },
      emotional_regulation: { label: "情緒調節", focus: "冷靜決定優先順序、保持專業語氣、從困難互動中恢復以及在壓力下保持準確", followUp: "詢問候選人在忙碌時收到難以接受的糾正後，第一分鐘會做什麼。" },
      adaptability: { label: "適應力與學習敏捷度", focus: "學習核准方法、適應變化、與不同工作風格合作以及尋找下一步可行辦法", followUp: "請候選人舉例說明如何用新流程取代熟悉的方法，以及如何確認新流程有效。" },
    },
  },
};

export function localizedPsychologyAnalysis(locale: AppLocale, trait: PsychologyTrait, band: PsychologyBand) {
  const copy = analysisCopy[locale];
  const traitCopy = copy.traits[trait];
  return {
    label: traitCopy.label,
    bandLabel: copy.bands[band],
    interpretation: copy.templates[band].replace("{focus}", traitCopy.focus),
    managerFollowUp: traitCopy.followUp,
  };
}

export const psychologyQuestionIds = Array.from(
  { length: 30 },
  (_, index) => `WP${String(index + 1).padStart(2, "0")}`,
);
