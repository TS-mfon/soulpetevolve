import type { PetState } from "@/lib/contracts/SoulPets";
import { Link } from "react-router-dom";

interface PetSummaryCardProps {
  pet: PetState;
}

const stageEmoji: Record<string, string> = {
  egg: "🥚",
  hatchling: "🐣",
  adult: "🐉",
  ancient: "🌟",
};

export function PetSummaryCard({ pet }: PetSummaryCardProps) {
  const dominantTrait = Object.entries(pet.traits).sort(([, left], [, right]) => right - left)[0]?.[0] ?? "kindness";

  return (
    <Link to={`/pets/${pet.token_id}`} className="group soul-card block overflow-hidden p-5 transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{pet.stage}</p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">{pet.token_id}</h3>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-3xl transition-transform group-hover:scale-110">
          {stageEmoji[pet.stage] ?? "🥚"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Mood</p>
          <p className="mt-1 capitalize text-foreground">{pet.mood}</p>
        </div>
        <div className="rounded-xl bg-secondary/60 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Form</p>
          <p className="mt-1 capitalize text-foreground">{pet.visual_dna.form}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
          <span>Dominant trait</span>
          <span>{pet.traits[dominantTrait as keyof PetState["traits"]]}</span>
        </div>
        <p className="mt-2 capitalize text-foreground">{dominantTrait}</p>
      </div>
    </Link>
  );
}