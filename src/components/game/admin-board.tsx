"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { EventConfig, Gift, Person } from "@/lib/types";

function newPerson(): Person {
  const id = `p-${Date.now()}`;
  return {
    id,
    name: "Người mới",
    photoUrl: "/placeholders/person-1.svg",
    silhouette: true,
    clues: ["Manh mối 1", "Manh mối 2"],
    aliases: ["người mới"],
  };
}

function nextGiftSlot(gifts: Gift[]): number {
  const used = new Set(gifts.map((g) => g.slot));
  let slot = 1;
  while (used.has(slot)) slot += 1;
  return slot;
}

function nextDisplayNumber(gifts: Gift[]): number {
  const used = new Set(gifts.map((g) => g.displayNumber));
  let n = 1;
  while (used.has(n)) n += 1;
  return n;
}

function newGift(gifts: Gift[]): Gift {
  const slot = nextGiftSlot(gifts);
  return {
    id: `gift-${Date.now()}-${slot}`,
    slot,
    displayNumber: nextDisplayNumber(gifts),
    question: "Câu hỏi mới?",
    label: `Quà ô ${slot}`,
    description: "",
    claimedBy: null,
    claimedAt: null,
  };
}

export function AdminBoard() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Đăng nhập thất bại");
        setBusy(false);
        return;
      }
      setToken(data.token);
      await loadConfig(data.token);
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setBusy(false);
    }
  }

  async function loadConfig(tok: string) {
    const res = await fetch("/api/admin/config", {
      headers: { "x-admin-password": tok },
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Không tải được cấu hình");
      return;
    }
    setConfig(data.config);
  }

  async function save() {
    if (!token || !config) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token,
        },
        body: JSON.stringify({
          title: config.title,
          welcomeText: config.welcomeText,
          people: config.people,
          gifts: config.gifts,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Lưu thất bại");
        setBusy(false);
        return;
      }
      setConfig(data.config);
      setMessage("Đã lưu cấu hình.");
    } catch {
      setError("Lỗi mạng khi lưu.");
    } finally {
      setBusy(false);
    }
  }

  async function adminAction(action: "reset-claims" | "reseed") {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Thao tác thất bại");
        setBusy(false);
        return;
      }
      setConfig(data.config);
      setMessage(
        action === "reseed"
          ? "Đã khôi phục dữ liệu mẫu."
          : "Đã reset trạng thái nhận quà.",
      );
    } catch {
      setError("Lỗi mạng.");
    } finally {
      setBusy(false);
    }
  }

  function updatePerson(id: string, patch: Partial<Person>) {
    setConfig((c) =>
      c
        ? {
            ...c,
            people: c.people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          }
        : c,
    );
  }

  function updateGift(id: string, patch: Partial<Gift>) {
    setConfig((c) =>
      c
        ? {
            ...c,
            gifts: c.gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)),
          }
        : c,
    );
  }

  if (!token || !config) {
    return (
      <div className="mx-auto w-full max-w-md animate-rise rounded-3xl bg-white/60 p-8 shadow-sm backdrop-blur">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Admin 20/10
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Nhập mật khẩu chung (mặc định local: <code>demo2010</code>).
        </p>
        <form onSubmit={login} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pw">Mật khẩu</Label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-10 w-full rounded-lg border border-input bg-white/80 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button
            type="submit"
            disabled={busy}
            className="w-full bg-[var(--rose-deep)] text-white hover:bg-[var(--rose)]"
          >
            {busy ? "Đang vào…" : "Vào bảng điều khiển"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl animate-rise space-y-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
            Bảng admin
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Cập nhật lần cuối: {new Date(config.updatedAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={() => adminAction("reset-claims")}>
            Reset nhận quà
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => adminAction("reseed")}>
            Seed lại mẫu
          </Button>
          <Button
            disabled={busy}
            onClick={save}
            className="bg-[var(--rose-deep)] text-white hover:bg-[var(--rose)]"
          >
            {busy ? "Đang lưu…" : "Lưu cấu hình"}
          </Button>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      <Tabs defaultValue="event" className="w-full">
        <TabsList className="bg-white/60">
          <TabsTrigger value="event">Sự kiện</TabsTrigger>
          <TabsTrigger value="people">Đoán người</TabsTrigger>
          <TabsTrigger value="gifts">Quà ({config.gifts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="event" className="mt-4 space-y-4 rounded-2xl bg-white/55 p-5">
          <div className="space-y-2">
            <Label>Tiêu đề sự kiện</Label>
            <Input
              value={config.title}
              onValueChange={(value) => setConfig({ ...config, title: value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Lời chào</Label>
            <Textarea
              rows={4}
              value={config.welcomeText}
              onChange={(e) => setConfig({ ...config, welcomeText: e.target.value })}
            />
          </div>
        </TabsContent>

        <TabsContent value="people" className="mt-4 space-y-4">
          {config.people.map((person, idx) => (
            <div key={person.id} className="space-y-3 rounded-2xl bg-white/55 p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[var(--ink)]">Người #{idx + 1}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfig({
                      ...config,
                      people: config.people.filter((p) => p.id !== person.id),
                    })
                  }
                >
                  Xóa
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tên</Label>
                  <Input
                    value={person.name}
                    onValueChange={(value) => updatePerson(person.id, { name: value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL ảnh</Label>
                  <Input
                    value={person.photoUrl}
                    onValueChange={(value) => updatePerson(person.id, { photoUrl: value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                <input
                  type="checkbox"
                  checked={person.silhouette}
                  onChange={(e) =>
                    updatePerson(person.id, { silhouette: e.target.checked })
                  }
                />
                Hiện silhouette (che ảnh) cho đến khi đoán đúng
              </label>
              <div className="space-y-2">
                <Label>Manh mối (mỗi dòng một manh mối)</Label>
                <Textarea
                  rows={3}
                  value={person.clues.join("\n")}
                  onChange={(e) =>
                    updatePerson(person.id, {
                      clues: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Đáp án chấp nhận (phẩy hoặc xuống dòng)</Label>
                <Textarea
                  rows={2}
                  value={person.aliases.join(", ")}
                  onChange={(e) =>
                    updatePerson(person.id, {
                      aliases: e.target.value
                        .split(/[,\n]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setConfig({ ...config, people: [...config.people, newPerson()] })
            }
          >
            Thêm người / vòng
          </Button>
        </TabsContent>

        <TabsContent value="gifts" className="mt-4 space-y-3">
          <div className="rounded-2xl bg-white/55 p-4 text-sm text-[var(--ink-soft)]">
            <p>
              Player thấy <strong className="font-medium text-[var(--ink)]">câu hỏi</strong> trên
              mỗi hộp và gõ đáp án số.{" "}
              <strong className="font-medium text-[var(--ink)]">Đáp án số</strong> (={" "}
              <code>displayNumber</code>) không hiện trên UI player — chỉ lộ sau khi trả lời đúng.
              Tên / mô tả quà chỉ nội bộ.
            </p>
            <p className="mt-2 text-xs text-[var(--ink-muted)]">
              Hiện {config.gifts.length} món · đã nhận{" "}
              {config.gifts.filter((g) => g.claimedBy).length}. Seed: 15 câu thiệp (đáp án 7…88).
            </p>
          </div>
          {config.gifts
            .slice()
            .sort((a, b) => a.slot - b.slot)
            .map((gift) => (
              <div key={gift.id} className="rounded-2xl bg-white/55 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">Ô {gift.slot}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-[var(--ink-muted)]">
                      {gift.claimedBy
                        ? `Đã nhận: ${gift.claimedBy}${
                            gift.claimedAt
                              ? ` · ${new Date(gift.claimedAt).toLocaleString("vi-VN")}`
                              : ""
                          }`
                        : "Còn trống"}
                    </p>
                    {gift.claimedBy && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateGift(gift.id, { claimedBy: null, claimedAt: null })
                        }
                      >
                        Reset claim
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setConfig({
                          ...config,
                          gifts: config.gifts.filter((g) => g.id !== gift.id),
                        })
                      }
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Ô (slot)</Label>
                    <Input
                      type="number"
                      value={String(gift.slot)}
                      onValueChange={(value) =>
                        updateGift(gift.id, { slot: Number(value) || 1 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Đáp án số</Label>
                    <Input
                      type="number"
                      value={String(gift.displayNumber)}
                      onValueChange={(value) =>
                        updateGift(gift.id, {
                          displayNumber: Number(value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Tên quà (nội bộ)</Label>
                    <Input
                      value={gift.label}
                      onValueChange={(value) => updateGift(gift.id, { label: value })}
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Câu hỏi (player thấy)</Label>
                  <Textarea
                    rows={2}
                    value={gift.question ?? ""}
                    onChange={(e) => updateGift(gift.id, { question: e.target.value })}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <Label>Mô tả / ghi chú nội bộ</Label>
                  <Input
                    value={gift.description}
                    onValueChange={(value) =>
                      updateGift(gift.id, { description: value })
                    }
                  />
                </div>
              </div>
            ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setConfig({ ...config, gifts: [...config.gifts, newGift(config.gifts)] })
              }
            >
              Thêm quà
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || !config.gifts.some((g) => g.claimedBy)}
              onClick={() => adminAction("reset-claims")}
            >
              Reset mọi claim
            </Button>
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-[var(--ink-muted)]">
            Mẹo: đáp án số = số quà sau khi đoán đúng. «Seed lại mẫu» khôi phục 15 câu + 14 người.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
