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

- App: https://temporary-quick-sulfur-1ba7o49.vercel.app
- Claim để giữ lâu dài: https://vercel.com/claim-deployment?code=8d97eb37-7370-45c1-b7a4-cdf48a897c22

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
- 15 quà với số hiển thị: `7, 14, 3, 11, 1, 9, 15, 5, 12, 2, 8, 13, 6, 10, 4` (không theo thứ tự 1–15).

## Cần từ ban tổ chức

- Ảnh thật + tên / alias cho vòng Đoán người.
- Đáp án đúng 15 thẻ (map sang `displayNumber` từng hộp).
- Đổi `ADMIN_PASSWORD` trên môi trường production.
