export type Person = {
  id: string;
  name: string;
  photoUrl: string;
  /** When true, show silhouette instead of photo until guessed */
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

export type PublicPerson = Omit<Person, "aliases" | "name"> & {
  /** Revealed only after correct guess in that session response */
  name?: string;
};

export type PublicEvent = {
  title: string;
  welcomeText: string;
  people: PublicPerson[];
  gifts: Array<{
    id: string;
    slot: number;
    question: string;
    claimed: boolean;
    claimedBy: string | null;
  }>;
};
