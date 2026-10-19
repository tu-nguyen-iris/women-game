import type { EventConfig, Gift, Person } from "./types";

/**
 * Gift slot 1→15 display numbers = physical thiệp answers (not 1–15 sequential).
 * Questions stay on cards only — see docs/thiep-questions-answers.md in agent store.
 * Thiệp 1→15: 7, 12, 18, 21, 24, 27, 33, 38, 42, 47, 52, 58, 63, 72, 88
 */
const SCRAMBLED_NUMBERS = [
  7, 12, 18, 21, 24, 27, 33, 38, 42, 47, 52, 58, 63, 72, 88,
];

const GIFT_LABELS = [
  { label: "Hộp soft", description: "Một món nhỏ xinh để bàn làm việc." },
  { label: "Bó hoa mini", description: "Hoa tươi (hoặc giấy) — mang về nhà nhé." },
  { label: "Thẻ cà phê", description: "Một ly ngon cho buổi chiều." },
  { label: "Sổ tay", description: "Ghi chú đẹp cho năm mới." },
  { label: "Nến thơm", description: "Ánh sáng ấm cho góc riêng." },
  { label: "Son dưỡng", description: "Chăm sóc nhẹ nhàng mỗi ngày." },
  { label: "Túi tote", description: "Đi họp, đi chợ, đi chơi đều được." },
  { label: "Chocolate", description: "Ngọt vừa đủ cho ngày 20/10." },
  { label: "Kẹp tóc", description: "Chi tiết nhỏ, vibe lớn." },
  { label: "Bình giữ nhiệt", description: "Giữ ấm trà / cà phê cả buổi." },
  { label: "Sticker pack", description: "Dán laptop, sổ, bình nước." },
  { label: "Móc khóa", description: "Nhớ mãi buổi party hôm nay." },
  { label: "Kem tay", description: "Mềm mại sau một ngày dài." },
  { label: "Thiệp tay", description: "Lời chúc viết tay từ team." },
  { label: "Surprise!", description: "Quà bí mật — mở mới biết." },
];

function buildGifts(): Gift[] {
  return GIFT_LABELS.map((g, i) => ({
    id: `gift-${i + 1}`,
    slot: i + 1,
    displayNumber: SCRAMBLED_NUMBERS[i]!,
    label: g.label,
    description: g.description,
    claimedBy: null,
    claimedAt: null,
  }));
}

const PEOPLE: Person[] = [
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
    id: "p2",
    name: "Nguyễn Phương Quyên",
    photoUrl: "/placeholders/person-2.svg",
    silhouette: true,
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
    id: "p3",
    name: "Thạch Thị Thu Trang",
    photoUrl: "/placeholders/person-3.svg",
    silhouette: true,
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
    id: "p4",
    name: "Trình Thị Thùy Trinh",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
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
    id: "p5",
    name: "Nguyễn Dương Anh Phương",
    photoUrl: "/placeholders/person-2.svg",
    silhouette: true,
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
    id: "p6",
    name: "Lý Thanh Thảo",
    photoUrl: "/placeholders/person-3.svg",
    silhouette: true,
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
    id: "p8",
    name: "Thái Yến Phụng",
    photoUrl: "/placeholders/person-2.svg",
    silhouette: true,
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
    id: "p9",
    name: "Trần Thị Minh Thư",
    photoUrl: "/placeholders/person-3.svg",
    silhouette: true,
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
    id: "p12",
    name: "Trần Thị Thanh Hân",
    photoUrl: "/placeholders/person-3.svg",
    silhouette: true,
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
    id: "p13",
    name: "Lê Phương Thảo",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
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
];

export function createSeedConfig(): EventConfig {
  return {
    title: "Ngày Phụ nữ Việt Nam 20/10",
    welcomeText:
      "Chào mừng cả nhà đến buổi giao lưu ấm áp của team! Đoán đồng nghiệp qua vài manh mối, rồi mở quà bí mật bằng đáp án trên thẻ của anh Hiếu nhé.",
    people: PEOPLE,
    gifts: buildGifts(),
    updatedAt: new Date().toISOString(),
  };
}
