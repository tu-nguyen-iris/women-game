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
import type { PublicClaimer, PublicEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type GiftPublic = PublicEvent["gifts"][number];

function normalizeName(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function personAlreadyClaimed(
  person: PublicClaimer,
  gifts: GiftPublic[],
): boolean {
  return gifts.some((g) => {
    if (!g.claimed || !g.claimedBy) return false;
    const by = g.claimedBy.trim();
    if (by === person.id) return true;
    return normalizeName(by) === normalizeName(person.name);
  });
}

export function SecretGifts({ initial }: { initial: PublicEvent }) {
  const [gifts, setGifts] = useState(initial.gifts);
  const [claimers] = useState(initial.claimers ?? []);
  const [selected, setSelected] = useState<GiftPublic | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [claimerId, setClaimerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [unlockedNumber, setUnlockedNumber] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    message: string;
  } | null>(null);

  const claimedCount = useMemo(
    () => gifts.filter((g) => g.claimed).length,
    [gifts],
  );

  const availableClaimers = useMemo(
    () => claimers.filter((c) => !personAlreadyClaimed(c, gifts)),
    [claimers, gifts],
  );

  function openGift(gift: GiftPublic) {
    setSelected(gift);
    setAnswer("");
    setClaimerId("");
    setFeedback(null);
    setUnlockedNumber(null);
    setClaimOpen(true);
  }

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !claimerId) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/gifts/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: selected.id,
          answer: Number(answer),
          claimerId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({ type: "err", message: data.error || "Chưa nhận được quà." });
        if (data.gift?.id) {
          setGifts((prev) =>
            prev.map((g) =>
              g.id === data.gift.id
                ? {
                    ...g,
                    claimed: true,
                    claimedBy: data.gift.claimedBy,
                    ...(typeof data.gift.displayNumber === "number"
                      ? { displayNumber: data.gift.displayNumber }
                      : {}),
                  }
                : g,
            ),
          );
        }
        // Sync claim state so the select drops people who already claimed
        try {
          const eventRes = await fetch("/api/event");
          if (eventRes.ok) {
            const event = (await eventRes.json()) as PublicEvent;
            if (Array.isArray(event.gifts)) setGifts(event.gifts);
          }
        } catch {
          // keep local state
        }
        setLoading(false);
        return;
      }
      const unlocked =
        typeof data.gift?.displayNumber === "number" ? data.gift.displayNumber : null;
      setGifts((prev) =>
        prev.map((g) =>
          g.id === data.gift.id
            ? {
                ...g,
                claimed: true,
                claimedBy: data.gift.claimedBy,
                ...(unlocked != null ? { displayNumber: unlocked } : {}),
              }
            : g,
        ),
      );
      setSelected((prev) =>
        prev && prev.id === data.gift.id
          ? {
              ...prev,
              claimed: true,
              claimedBy: data.gift.claimedBy,
              ...(unlocked != null ? { displayNumber: unlocked } : {}),
            }
          : prev,
      );
      setUnlockedNumber(unlocked);
      setFeedback({ type: "ok", message: data.message });
      setAnswer("");
      setClaimerId("");
      // Refresh so this claimer disappears from the select for this client
      try {
        const eventRes = await fetch("/api/event");
        if (eventRes.ok) {
          const event = (await eventRes.json()) as PublicEvent;
          if (Array.isArray(event.gifts)) setGifts(event.gifts);
        }
      } catch {
        // local gift update already applied
      }
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
          Mỗi hộp có một câu hỏi. Trả lời đúng số để nhận hộp đó — món quà thật mở hộp mới biết.
          Đã nhận: {claimedCount}/{gifts.length}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {gifts.map((gift, i) => (
          <button
            key={gift.id}
            type="button"
            onClick={() => openGift(gift)}
            className={cn(
              "group relative min-h-[160px] overflow-hidden rounded-2xl border text-left transition duration-300 animate-rise",
              gift.claimed
                ? "border-rose-200/40 bg-white/35 opacity-70"
                : "border-rose-200/70 bg-gradient-to-b from-rose-100/90 to-white/70 shadow-[0_12px_30px_-18px_rgba(190,18,60,0.55)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(190,18,60,0.55)]",
            )}
            style={{ animationDelay: `${0.03 * i}s` }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--rose)]/70" />
            <div className="flex h-full flex-col justify-between gap-3 p-4 sm:p-5">
              <div>
                <p className="text-xs text-[var(--ink-muted)]">Ô {gift.slot}</p>
                <p className="mt-2 text-sm leading-snug text-[var(--ink)] sm:text-base">
                  {gift.question}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--rose-deep)]">
                  {gift.claimed
                    ? typeof gift.displayNumber === "number"
                      ? `Đáp án: ${gift.displayNumber}`
                      : "Đã nhận"
                    : "Trả lời để nhận"}
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

      <Dialog
        open={claimOpen}
        onOpenChange={(next) => {
          setClaimOpen(next);
          if (!next) {
            setFeedback(null);
            setUnlockedNumber(null);
          }
        }}
      >
        <DialogContent className="border-rose-100 bg-[var(--wash)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl">
              {selected?.claimed
                ? typeof selected.displayNumber === "number"
                  ? `Bạn nhận quà số ${selected.displayNumber}`
                  : "Đã nhận"
                : `Ô ${selected?.slot ?? ""}`}
            </DialogTitle>
            <DialogDescription className="text-[var(--ink-soft)]">
              {selected?.claimed
                ? `Hộp này đã được ${selected.claimedBy || "ai đó"} nhận.`
                : selected?.question}
            </DialogDescription>
          </DialogHeader>
          {selected?.claimed && typeof selected.displayNumber === "number" && (
            <p className="font-[family-name:var(--font-display)] text-xl text-[var(--rose-deep)]">
              Đáp án: {selected.displayNumber}
            </p>
          )}
          {selected && !selected.claimed ? (
            <form onSubmit={claim} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer">Câu trả lời (số)</Label>
                <input
                  id="answer"
                  name="answer"
                  inputMode="numeric"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Nhập số…"
                  required
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claimer">Tên người nhận</Label>
                <select
                  id="claimer"
                  name="claimerId"
                  value={claimerId}
                  onChange={(e) => setClaimerId(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>
                    Chọn người nhận…
                  </option>
                  {availableClaimers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {availableClaimers.length === 0 && (
                  <p className="text-xs text-[var(--ink-soft)]">
                    Tất cả mọi người đã nhận quà.
                  </p>
                )}
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
              {feedback?.type === "ok" && unlockedNumber != null && (
                <p className="font-[family-name:var(--font-display)] text-xl text-[var(--rose-deep)]">
                  Bạn nhận quà số {unlockedNumber}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    feedback?.type === "ok" ||
                    !claimerId ||
                    availableClaimers.length === 0
                  }
                  className="bg-[var(--rose-deep)] text-white hover:bg-[var(--rose)]"
                >
                  {loading ? "Đang kiểm tra…" : "Gửi câu trả lời"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setClaimOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
