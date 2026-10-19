import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const OUT = "/cursor/stores/self/media/womens-day-game";
const BASE = "http://127.0.0.1:43127";

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "01-home.png"), fullPage: false });

  await page.goto(`${BASE}/guess`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "02-guess-silhouette.png"), fullPage: false });

  const guessInput = page.getByPlaceholder("Gõ tên hoặc biệt danh…");
  await guessInput.click();
  await guessInput.pressSequentially("Lan Anh", { delay: 40 });
  await page.getByRole("button", { name: "Đoán!" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "03-guess-correct.png"), fullPage: false });

  await page.goto(`${BASE}/gifts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "04-gifts-grid.png"), fullPage: false });

  await page.getByRole("button", { name: "Nhập số từ thẻ" }).click();
  await page.waitForTimeout(500);
  await page.locator("#num").click();
  await page.locator("#num").pressSequentially("14", { delay: 40 });
  await page.locator("#name").click();
  await page.locator("#name").pressSequentially("Ha", { delay: 40 });
  await page.getByRole("button", { name: "Nhận quà" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "05-gift-claimed.png"), fullPage: false });

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.locator("#pw").click();
  await page.locator("#pw").pressSequentially("demo2010", { delay: 30 });
  await page.getByRole("button", { name: "Vào bảng điều khiển" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, "06-admin-board.png"), fullPage: false });

  await browser.close();
  console.log("Wrote screenshots to", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
