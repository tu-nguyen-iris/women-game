import { SiteHeader } from "@/components/site-header";
import { SecretGifts } from "@/components/game/secret-gifts";
import { getConfig, toPublicEvent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GiftsPage() {
  const event = toPublicEvent(await getConfig());

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <SecretGifts initial={event} />
      </main>
    </>
  );
}
