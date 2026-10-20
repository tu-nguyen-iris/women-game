import type { EventConfig, Gift, Person } from "./types";

/**
 * Gift slot 1→15: question + numeric answer (= displayNumber / claim key).
 * Thiệp answers: 7, 12, 18, 21, 24, 27, 33, 38, 42, 47, 52, 58, 63, 72, 88
 */
const GIFT_DEFS = [
  {
    displayNumber: 7,
    question: "Cầu vồng thường được kể có mấy màu?",
    label: "Hộp soft",
    description: "Một món nhỏ xinh để bàn làm việc.",
  },
  {
    displayNumber: 12,
    question: "Một tá hoa hồng có bao nhiêu bông?",
    label: "Bó hoa mini",
    description: "Hoa tươi (hoặc giấy) — mang về nhà nhé.",
  },
  {
    displayNumber: 18,
    question: "Bạn mua 3 bó hoa, mỗi bó có 6 bông. Tổng cộng có bao nhiêu bông hoa?",
    label: "Thẻ cà phê",
    description: "Một ly ngon cho buổi chiều.",
  },
  {
    displayNumber: 21,
    question:
      "Ngày 20/10 là Ngày Phụ nữ Việt Nam. Ngày hôm sau là ngày bao nhiêu của tháng 10?",
    label: "Sổ tay",
    description: "Ghi chú đẹp cho năm mới.",
  },
  {
    displayNumber: 24,
    question: "Một ngày có bao nhiêu giờ?",
    label: "Nến thơm",
    description: "Ánh sáng ấm cho góc riêng.",
  },
  {
    displayNumber: 27,
    question:
      "Một ly trà sữa giá 30.000đ, được giảm 3.000đ. Bạn phải trả bao nhiêu nghìn đồng?",
    label: "Son dưỡng",
    description: "Chăm sóc nhẹ nhàng mỗi ngày.",
  },
  {
    displayNumber: 33,
    question: "Một hộp bánh có 11 chiếc. Bạn mua 3 hộp. Có tất cả bao nhiêu chiếc bánh?",
    label: "Túi tote",
    description: "Đi họp, đi chợ, đi chơi đều được.",
  },
  {
    displayNumber: 38,
    question:
      "Tháng 10 có 31 ngày. Hãy cộng 31 với số ngày trong một tuần. Kết quả là bao nhiêu?",
    label: "Chocolate",
    description: "Ngọt vừa đủ cho ngày 20/10.",
  },
  {
    displayNumber: 42,
    question: "Một tuần có 7 ngày. Hỏi 6 tuần có bao nhiêu ngày?",
    label: "Kẹp tóc",
    description: "Chi tiết nhỏ, vibe lớn.",
  },
  {
    displayNumber: 47,
    question: "Bạn có 50 bông hoa và tặng đi 3 bông. Còn lại bao nhiêu bông?",
    label: "Bình giữ nhiệt",
    description: "Giữ ấm trà / cà phê cả buổi.",
  },
  {
    displayNumber: 52,
    question: "Một năm có khoảng bao nhiêu tuần (tính tròn)?",
    label: "Sticker pack",
    description: "Dán laptop, sổ, bình nước.",
  },
  {
    displayNumber: 58,
    question:
      "Một bó hoa giá 50.000đ, thêm một tấm thiệp 8.000đ. Tổng cộng bao nhiêu nghìn đồng?",
    label: "Móc khóa",
    description: "Nhớ mãi buổi party hôm nay.",
  },
  {
    displayNumber: 63,
    question: "Có 9 bạn, mỗi bạn nhận 7 viên kẹo. Tổng cộng bao nhiêu viên kẹo?",
    label: "Kem tay",
    description: "Mềm mại sau một ngày dài.",
  },
  {
    displayNumber: 72,
    question: "Một hộp socola có 8 viên. Bạn mua 9 hộp. Có tất cả bao nhiêu viên?",
    label: "Thiệp tay",
    description: "Lời chúc viết tay từ team.",
  },
  {
    displayNumber: 88,
    question: "Có 8 bàn, mỗi bàn ngồi 11 người. Tổng cộng có bao nhiêu người?",
    label: "Surprise!",
    description: "Quà bí mật — mở mới biết.",
  },
] as const;

function buildGifts(): Gift[] {
  return GIFT_DEFS.map((g, i) => ({
    id: `gift-${i + 1}`,
    slot: i + 1,
    displayNumber: g.displayNumber,
    question: g.question,
    label: g.label,
    description: g.description,
    claimedBy: null,
    claimedAt: null,
  }));
}

/** Backfill question (and other seed fields) onto older stored gifts. */
export function ensureGiftQuestions(gifts: Gift[]): Gift[] {
  const byNumber = new Map<number, (typeof GIFT_DEFS)[number]>(
    GIFT_DEFS.map((g) => [g.displayNumber, g]),
  );
  const bySlot = new Map<number, (typeof GIFT_DEFS)[number]>(
    GIFT_DEFS.map((g, i) => [i + 1, g]),
  );
  return gifts.map((gift) => {
    if (gift.question?.trim()) return gift;
    const def =
      byNumber.get(gift.displayNumber) ?? bySlot.get(gift.slot) ?? null;
    if (!def) {
      return { ...gift, question: gift.question || "Câu hỏi chưa cấu hình." };
    }
    return {
      ...gift,
      question: def.question,
      label: gift.label || def.label,
      description: gift.description ?? def.description,
    };
  });
}

const PEOPLE: Person[] = [
  // Fixed shuffled round order (not original table order).
  // Order: Yến Phụng → Thanh Hân → Trang → Phan Ngọc Thi → Lý Thanh Thảo →
  // Tuyết Trinh → Thu Thảo → Anh Phương → Phương Thảo → Quyên → Đan Tâm →
  // Thuỳ Dương → Thùy Trinh → Minh Thư
  {
    id: "p8",
    name: "Thái Yến Phụng",
    photoUrl: "/people/yen-phung.jpg",
    silhouette: false,
    clues: [
      "Cô gái quê Ninh Thuận của team AIME",
      "Có nụ cười đẹp",
    ],
    aliases: [
      "thái yến phụng",
      "thai yen phung",
      "yến phụng",
      "yen phung",
      "phụng",
      "phung",
    ],
  },
  {
    id: "p12",
    name: "Trần Thị Thanh Hân",
    photoUrl: "/people/thanh-han.jpg",
    silhouette: false,
    clues: ["Cô gái sinh năm 2003", "Vừa vào công ty"],
    aliases: [
      "trần thị thanh hân",
      "tran thi thanh han",
      "thanh hân",
      "thanh han",
      "hân",
      "han",
    ],
  },
  {
    id: "p3",
    name: "Thạch Thị Thu Trang",
    photoUrl: "/people/trang.jpg",
    silhouette: false,
    clues: [
      "Biệt danh Rapuka",
      "Nhẹ nhàng",
      "Làm việc nhiều với Excel",
    ],
    aliases: [
      "thạch thị thu trang",
      "thach thi thu trang",
      "thu trang",
      "trang",
      "rapuka",
    ],
  },
  {
    id: "p14",
    name: "Phan Ngọc Thi",
    photoUrl: "/placeholders/person-2.svg",
    silhouette: true,
    clues: ["Mục tiêu đi làm để nuôi mèo", "Thích dance"],
    aliases: [
      "phan ngọc thi",
      "phan ngoc thi",
      "ngọc thi",
      "ngoc thi",
      "thi",
    ],
  },
  {
    id: "p6",
    name: "Lý Thanh Thảo",
    photoUrl: "/people/ly-thanh-thao.jpg",
    silhouette: false,
    clues: [
      "Cô gái người Hoa",
      "Thích ăn gà rán",
      'Vừa cắt tóc mái "chó gặm"',
    ],
    aliases: [
      "lý thanh thảo",
      "ly thanh thao",
      "thanh thảo",
      "thanh thao",
      "thảo",
      "thao",
    ],
  },
  {
    id: "p1",
    name: "Lê Thị Tuyết Trinh",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
    clues: [
      "Rất khéo tay, cắt trái cây như trong tiệc cưới",
      "Hiểu rõ về luật",
    ],
    aliases: [
      "lê thị tuyết trinh",
      "le thi tuyet trinh",
      "tuyết trinh",
      "tuyet trinh",
      "trinh",
    ],
  },
  {
    id: "p10",
    name: "Nguyễn Thu Thảo",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
    clues: [
      "Câu cửa miệng là đang giảm cân",
      "Hay nhịn ăn để uống trà sữa",
    ],
    aliases: [
      "nguyễn thu thảo",
      "nguyen thu thao",
      "thu thảo",
      "thu thao",
    ],
  },
  {
    id: "p5",
    name: "Nguyễn Dương Anh Phương",
    photoUrl: "/people/anh-phuong.jpg",
    silhouette: false,
    clues: [
      'Mỗi ngày sẽ có ít nhất 1 ly "hóa chất"',
      "Sinh viên RMIT",
    ],
    aliases: [
      "nguyễn dương anh phương",
      "nguyen duong anh phuong",
      "dương anh phương",
      "duong anh phuong",
      "anh phương",
      "anh phuong",
      "phương",
      "phuong",
    ],
  },
  {
    id: "p13",
    name: "Lê Phương Thảo",
    photoUrl: "/people/phuong-thao.jpg",
    silhouette: false,
    clues: [
      "Cô gái sinh năm 2003",
      "Ghiền cà phê kem dẻo Buôn Mê",
    ],
    aliases: [
      "lê phương thảo",
      "le phuong thao",
      "phương thảo",
      "phuong thao",
    ],
  },
  {
    id: "p2",
    name: "Nguyễn Phương Quyên",
    photoUrl: "/people/quyen.jpg",
    silhouette: false,
    clues: [
      "Thích nuôi mèo",
      "Đang có một em bé rất trộm vía trong bụng",
    ],
    aliases: [
      "nguyễn phương quyên",
      "nguyen phuong quyen",
      "phương quyên",
      "phuong quyen",
      "quyên",
      "quyen",
    ],
  },
  {
    id: "p11",
    name: "Nguyễn Lê Đan Tâm",
    photoUrl: "/placeholders/person-2.svg",
    silhouette: true,
    clues: ["Cô gái Huế", "BD của công ty"],
    aliases: [
      "nguyễn lê đan tâm",
      "nguyen le dan tam",
      "đan tâm",
      "dan tam",
      "tâm",
      "tam",
    ],
  },
  {
    id: "p7",
    name: "Lê Nguyễn Thuỳ Dương",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
    clues: ["Cao", "Hay mặc áo polo nhất"],
    aliases: [
      "lê nguyễn thuỳ dương",
      "lê nguyễn thùy dương",
      "le nguyen thuy duong",
      "thuỳ dương",
      "thùy dương",
      "thuy duong",
      "dương",
      "duong",
    ],
  },
  {
    id: "p4",
    name: "Trình Thị Thùy Trinh",
    photoUrl: "/people/thuy-trinh.jpg",
    silhouette: false,
    clues: ["Thích nuôi hamster"],
    aliases: [
      "trình thị thùy trinh",
      "trinh thi thuy trinh",
      "thùy trinh",
      "thuy trinh",
      "trình",
    ],
  },
  {
    id: "p9",
    name: "Trần Thị Minh Thư",
    photoUrl: "/people/minh-thu.jpg",
    silhouette: false,
    clues: [
      "Hay nói tiếng Anh lung tung",
      "Tóc dài",
      "Hay làm mấy bộ móng yêu quái",
    ],
    aliases: [
      "trần thị minh thư",
      "tran thi minh thu",
      "minh thư",
      "minh thu",
      "thư",
      "thu",
    ],
  }
];

export function createSeedConfig(): EventConfig {
  return {
    title: "Ngày Phụ nữ Việt Nam 20/10",
    welcomeText:
      "Chào mừng cả nhà đến buổi giao lưu ấm áp của team! Đoán đồng nghiệp qua vài manh mối, rồi trả lời câu hỏi trên từng hộp quà bí mật nhé.",
    people: PEOPLE,
    gifts: buildGifts(),
    updatedAt: new Date().toISOString(),
  };
}
