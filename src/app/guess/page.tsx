import { SiteHeader } from "@/components/site-header";
import { GuessWho } from "@/components/game/guess-who";
import { getConfig, toPublicEvent } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GuessPage() {
  const event = toPublicEvent(await getConfig());

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <GuessWho initial={event} />
      </main>
    </>
  );
}
