"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublicEvent, PublicPerson } from "@/lib/types";

type GuessResult = {
  correct: boolean;
  message: string;
  name?: string;
  photoUrl?: string;
};

type RevealedPerson = {
  name: string;
  photoUrl: string;
};

export function GuessWho({ initial }: { initial: PublicEvent }) {
  const people = initial.people;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<GuessResult | null>(null);
  const [revealed, setRevealed] = useState<Record<string, RevealedPerson>>({});
  const [error, setError] = useState<string | null>(null);

  const person: PublicPerson | undefined = people[index];
  const revealedPerson = person ? revealed[person.id] : undefined;
  const isRevealed = Boolean(revealedPerson);

  const progress = useMemo(
    () => `${Math.min(index + 1, people.length)} / ${people.length}`,
    [index, people.length],
  );

  useEffect(() => {
    setAnswer("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }, [index]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!person || !answer.trim()) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: person.id, answer }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Có lỗi xảy ra.");
        setStatus("idle");
        return;
      }
      setResult({
        correct: data.correct,
        message: data.message,
        name: data.name,
        photoUrl: data.photoUrl,
      });
      if (data.correct && data.name && data.photoUrl) {
        setRevealed((prev) => ({
          ...prev,
          [person.id]: {
            name: data.name as string,
            photoUrl: data.photoUrl as string,
          },
        }));
      }
      setStatus("done");
    } catch {
      setError("Không kết nối được máy chủ. Thử lại nhé.");
      setStatus("idle");
    }
  }

  if (!people.length) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-white/55 px-6 py-10 text-center shadow-sm backdrop-blur">
        <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Chưa có vòng đoán người
        </p>
        <p className="mt-2 text-[var(--ink-soft)]">
          Admin hãy thêm người chơi trong bảng điều khiển.
        </p>
      </div>
    );
  }

  if (!person) return null;

  // Real photo only after a correct guess — never from the public event payload
  const photoUrl = revealedPerson?.photoUrl || (result?.correct ? result.photoUrl : undefined);
  const displayName = revealedPerson?.name;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-200/80 via-rose-100/60 to-white/40 p-3 shadow-[0_20px_60px_-28px_rgba(190,18,60,0.45)] animate-rise">
        <div className="relative aspect-[5/6] overflow-hidden rounded-[1.6rem] bg-rose-950/10">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={displayName || "Ảnh người bí ẩn"}
              fill
              className="object-cover transition duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(251,113,133,0.35),rgba(76,5,25,0.55))]">
              <div className="h-36 w-36 rounded-full bg-rose-950/40 blur-[1px] animate-pulse-soft" />
              <div className="-mt-28 h-28 w-28 rounded-full bg-rose-950/70" />
              <div className="mt-4 h-40 w-48 rounded-t-[100%] bg-rose-950/65" />
              <p className="absolute bottom-6 font-[family-name:var(--font-display)] text-lg text-rose-50/90">
                Ai đây nhỉ?
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="animate-rise-delay">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-white/70 text-[var(--ink-soft)]">
            Vòng {progress}
          </Badge>
          {isRevealed && (
            <Badge className="bg-[var(--rose-deep)] text-white hover:bg-[var(--rose-deep)]">
              Đã đoán đúng
            </Badge>
          )}
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
          {isRevealed ? displayName : "Đoán xem là ai"}
        </h1>
        <p className="mt-3 max-w-md text-[var(--ink-soft)]">
          Đọc manh mối rồi gõ tên (có thể dùng biệt danh nội bộ). Sai cũng không sao — đoán tiếp!
        </p>

        <ul className="mt-6 space-y-3">
          {person.clues.map((clue, i) => (
            <li
              key={`${person.id}-${i}`}
              className="flex gap-3 text-[var(--ink)]"
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--rose)]" />
              <span>{clue}</span>
            </li>
          ))}
        </ul>

        {!isRevealed ? (
          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              name="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Gõ tên hoặc biệt danh…"
              className="h-12 flex-1 rounded-lg border border-rose-200/80 bg-white/70 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={status === "loading"}
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={status === "loading" || !answer.trim()}
              className="h-12 bg-[var(--rose-deep)] px-6 text-base text-white hover:bg-[var(--rose)]"
            >
              {status === "loading" ? "Đang kiểm…" : "Đoán!"}
            </Button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl bg-white/65 px-5 py-4 text-[var(--ink)] shadow-sm">
            {result?.message || `Đúng rồi — ${displayName}!`}
          </div>
        )}

        {result && !result.correct && (
          <p className="mt-3 text-sm text-[var(--rose-deep)]" role="status">
            {result.message}
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-rose-200 bg-white/50"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
          >
            Vòng trước
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-rose-200 bg-white/50"
            disabled={index >= people.length - 1}
            onClick={() => setIndex((i) => Math.min(people.length - 1, i + 1))}
          >
            Vòng sau
          </Button>
        </div>
      </div>
    </div>
  );
}
