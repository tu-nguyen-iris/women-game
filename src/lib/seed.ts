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
    name: "Lan Anh",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
    clues: [
      "Hay mang trà đào vào họp sáng.",
      "Chịu trách nhiệm trang trí bàn tiệc năm ngoái.",
      "Nickname nội bộ: 'Lan hoa'.",
    ],
    aliases: ["lan anh", "lananh", "chị lan anh", "chi lan anh"],
  },
  {
    id: "p2",
    name: "Minh Châu",
    photoUrl: "/placeholders/person-2.svg",
    silhouette: false,
    clues: [
      "Luôn ngồi gần cửa sổ.",
      "Fan cứng của nhạc ballad.",
      "Từng thắng 'đoán người' năm rồi.",
    ],
    aliases: ["minh châu", "minh chau", "châu", "chau"],
  },
  {
    id: "p3",
    name: "Hồng Nhung",
    photoUrl: "/placeholders/person-3.svg",
    silhouette: true,
    clues: [
      "Thường đeo khăn lụa màu đỏ.",
      "Hay tổ chức secret gift cho team.",
      "Sinh nhật tháng 3.",
    ],
    aliases: ["hồng nhung", "hong nhung", "nhung", "chị nhung", "chi nhung"],
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
