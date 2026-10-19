"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PublicEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type GiftPublic = PublicEvent["gifts"][number];

export function SecretGifts({ initial }: { initial: PublicEvent }) {
  const [gifts, setGifts] = useState(initial.gifts);
  const [selected, setSelected] = useState<GiftPublic | null>(null);
  const [open, setOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [displayNumber, setDisplayNumber] = useState("");
  const [claimerName, setClaimerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    message: string;
  } | null>(null);

  const claimedCount = useMemo(
    () => gifts.filter((g) => g.claimed).length,
    [gifts],
  );

  function openGift(gift: GiftPublic) {
    setSelected(gift);
    setFeedback(null);
    setOpen(true);
  }

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/gifts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayNumber: Number(displayNumber),
          claimerName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: "err", message: data.error || "Không nhận được quà." });
        if (data.gift?.id) {
          setGifts((prev) =>
            prev.map((g) =>
              g.id === data.gift.id
                ? { ...g, claimed: true, claimedBy: data.gift.claimedBy }
                : g,
            ),
          );
        }
        setLoading(false);
        return;
      }
      setGifts((prev) =>
        prev.map((g) =>
          g.id === data.gift.id
            ? {
                ...g,
                claimed: true,
                claimedBy: data.gift.claimedBy,
              }
            : g,
        ),
      );
      setFeedback({ type: "ok", message: data.message });
      setDisplayNumber("");
      setClaimerName("");
    } catch {
      setFeedback({ type: "err", message: "Lỗi mạng — thử lại sau." });
    } finally {
      setLoading(false);
    }
  }

  if (!gifts.length) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-white/55 px-6 py-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl">Chưa có quà</p>
        <p className="mt-2 text-[var(--ink-soft)]">Admin hãy cấu hình 15 món quà.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8 max-w-2xl animate-rise">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--rose-deep)]">
          Secret gifts
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)] sm:text-5xl">
          Quà bí mật
        </h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          Mỗi hộp chỉ hiện số — khớp với đáp án trên thẻ của anh Hiếu. Nhập đúng số để nhận;
          tên món quà giữ bí mật đến khi mở hộp thật. Đã nhận: {claimedCount}/{gifts.length}.
        </p>
        <Button
          className="mt-5 bg-[var(--rose-deep)] text-white hover:bg-[var(--rose)]"
          onClick={() => {
            setFeedback(null);
            setClaimOpen(true);
          }}
        >
          Nhập số từ thẻ
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
        {gifts.map((gift, i) => (
          <button
            key={gift.id}
            type="button"
            onClick={() => openGift(gift)}
            className={cn(
              "group relative aspect-[3/4] overflow-hidden rounded-2xl border text-left transition duration-300 animate-rise",
              gift.claimed
                ? "border-rose-200/40 bg-white/35 opacity-70"
                : "border-rose-200/70 bg-gradient-to-b from-rose-100/90 to-white/70 shadow-[0_12px_30px_-18px_rgba(190,18,60,0.55)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(190,18,60,0.55)]",
            )}
            style={{ animationDelay: `${0.03 * i}s` }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--rose)]/70" />
            <div className="flex h-full flex-col justify-between p-3 sm:p-4">
              <span className="font-[family-name:var(--font-display)] text-3xl text-[var(--rose-deep)] sm:text-4xl">
                {gift.displayNumber}
              </span>
              <div>
                <p className="text-xs text-[var(--ink-muted)]">Ô {gift.slot}</p>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">
                  {gift.claimed ? "Đã nhận" : "Quà bí mật"}
                </p>
                {gift.claimed && gift.claimedBy && (
                  <p className="mt-1 line-clamp-1 text-xs text-[var(--ink-soft)]">
                    {gift.claimedBy}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-rose-100 bg-[var(--wash)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              Số {selected?.displayNumber}
            </DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              {selected?.claimed
                ? `Đã được ${selected.claimedBy || "ai đó"} nhận.`
                : "Còn trống — nhập đúng số trên thẻ để nhận. Tên món quà chỉ biết khi mở hộp thật."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!selected?.claimed && (
              <Button
                className="bg-[var(--rose-deep)] text-white hover:bg-[var(--rose)]"
                onClick={() => {
                  setDisplayNumber(String(selected?.displayNumber ?? ""));
                  setOpen(false);
                  setClaimOpen(true);
                }}
              >
                Nhận món này
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent className="border-rose-100 bg-[var(--wash)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              Mở quà bằng số thẻ
            </DialogTitle>
            <DialogDescription>
              Nhập đáp án trên thẻ vật lý — số đó phải khớp số in trên hộp quà.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={claim} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="num">Số trên thẻ / trên hộp</Label>
              <input
                id="num"
                name="displayNumber"
                inputMode="numeric"
                value={displayNumber}
                onChange={(e) => setDisplayNumber(e.target.value)}
                placeholder="VD: 7"
                required
                className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên người nhận</Label>
              <input
                id="name"
                name="claimerName"
                value={claimerName}
                onChange={(e) => setClaimerName(e.target.value)}
                placeholder="Tên của bạn"
                required
                className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            {feedback && (
              <p
                className={cn(
                  "text-sm",
                  feedback.type === "ok" ? "text-emerald-700" : "text-red-700",
                )}
                role="status"
              >
                {feedback.message}
              </p>
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[var(--rose-deep)] text-white hover:bg-[var(--rose)]"
              >
                {loading ? "Đang mở…" : "Nhận quà"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
