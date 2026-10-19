import { SiteHeader } from "@/components/site-header";
import { AdminBoard } from "@/components/game/admin-board";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <SiteHeader compact />
      <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <AdminBoard />
      </main>
    </>
  );
}
