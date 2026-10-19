# Mini game 20/10 — Ngày Phụ nữ Việt Nam

Ứng dụng web cho buổi party / đổi quà văn phòng: **Đoán người** và **Quà bí mật** (15 hộp số xáo trộn khớp thẻ vật lý của anh Hiếu), kèm **bảng admin** mật khẩu chung.

## Chạy local

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD=demo2010
npm run dev                  # http://127.0.0.1:43127
```

| Trang | URL |
|------|-----|
| Trang chủ | `/` |
| Đoán người | `/guess` |
| Quà bí mật | `/gifts` |
| Admin | `/admin` (mật khẩu mặc định `demo2010`) |

## Admin

1. Mở `/admin`, nhập `ADMIN_PASSWORD` (mặc định demo: `demo2010`).
2. Sửa tiêu đề / lời chào, người chơi (ảnh URL, manh mối, alias đáp án), và 15 quà (nhãn + **số hiển thị** xáo trộn).
3. **Reset nhận quà** trước giờ party; **Seed lại mẫu** để khôi phục data demo.

Cấu hình lưu vào `data/event-store.json` (local). Trên Vercel serverless, state giữ trong bộ nhớ + `/tmp` (có thể mất khi cold start) — với event một buổi thì ổn; muốn bền vững hơn hãy chạy một Node process dài (`npm start`) hoặc gắn store ngoài.

## Live / Deploy (Vercel)

Demo anonymous deploy (hết hạn ~60 phút nếu chưa claim — claim sớm):

- App: https://temporary-racing-ruby-w7fofsp.vercel.app
- Claim để giữ lâu dài: https://vercel.com/claim-deployment?code=ee9e8433-b055-46af-8fa6-9f666a5a0932

Deploy bền vững bằng tài khoản Vercel của team:

```bash
npx vercel login
npx vercel --yes
npx vercel --prod --yes
```

Trên dashboard Vercel, đặt env `ADMIN_PASSWORD` (đừng dùng `demo2010` cho sự kiện thật).

Branch làm việc: `cursor/womens-day-minigame-976a`. PR draft cần repo Origin/GitHub chuẩn (session New Project dạng `agent_temp` chưa mở được PR).

## Demo seed

- 3 người mẫu (silhouette / ảnh placeholder).
- 15 quà với số hiển thị (đáp án thiệp 1→15): `7, 12, 18, 21, 24, 27, 33, 38, 42, 47, 52, 58, 63, 72, 88`. Câu hỏi chỉ trên thẻ vật lý; player UI không hiện tên quà.

## Cần từ ban tổ chức

- Ảnh thật + tên / alias cho vòng Đoán người.
- Đáp án đúng 15 thẻ (map sang `displayNumber` từng hộp).
- Đổi `ADMIN_PASSWORD` trên môi trường production.
