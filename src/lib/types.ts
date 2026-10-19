export type Person = {
  id: string;
  name: string;
  /** Full photo — admin only on public surfaces; players get it after a correct guess */
  photoUrl: string;
  /** Admin preference flag; public UI always silhouettes until a correct guess */
  silhouette: boolean;
  clues: string[];
  /** Accepted answers (case-insensitive, trimmed) */
  aliases: string[];
};

export type Gift = {
  id: string;
  /** Internal board order (admin-editable) */
  slot: number;
  /**
   * Correct numeric answer for this gift's question.
   * Also the “quà số N” revealed only after a correct claim.
   * Never expose on public player payloads.
   */
  displayNumber: number;
  /** Player-facing question (safe to publish) */
  question: string;
  /** Internal prize name — never exposed on public /api/event */
  label: string;
  /** Internal note — never exposed on public /api/event */
  description: string;
  claimedBy: string | null;
  claimedAt: string | null;
};

export type EventConfig = {
  title: string;
  welcomeText: string;
  people: Person[];
  gifts: Gift[];
  updatedAt: string;
};

/** Public Guess Who card — no name, aliases, or photo until a correct guess */
export type PublicPerson = {
  id: string;
  clues: string[];
};

/** Public claimer option — id + display name only (no photoUrl) */
export type PublicClaimer = {
  id: string;
  name: string;
};

export type PublicEvent = {
  title: string;
  welcomeText: string;
  people: PublicPerson[];
  /**
   * Guess Who people available as gift claimers (id + name).
   * Safe for the claim dropdown — does not include photoUrl.
   */
  claimers: PublicClaimer[];
  gifts: Array<{
    id: string;
    slot: number;
    question: string;
    claimed: boolean;
    claimedBy: string | null;
  }>;
};
