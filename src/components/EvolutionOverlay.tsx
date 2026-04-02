import { Button } from "@/components/ui/button";
import type { EvolutionResult } from "@/lib/contracts/SoulPets";
import { Sparkles, X } from "lucide-react";

interface EvolutionOverlayProps {
  result: EvolutionResult | null;
  open: boolean;
  onClose: () => void;
}

export function EvolutionOverlay({ result, open, onClose }: EvolutionOverlayProps) {
  if (!open || !result) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/90 px-4 backdrop-blur-xl animate-fade-in">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/30 animate-soul-ring" />
        <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 animate-soul-ring-delayed" />
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 block h-2 w-2 rounded-full bg-accent animate-soul-spark"
            style={{
              transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-10rem)`,
              animationDelay: `${index * 0.08}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl soul-card border-primary/30 bg-card/85 p-8 text-center shadow-2xl animate-scale-in">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary soul-glow animate-pulse-soft">
          <Sparkles className="h-10 w-10" />
        </div>

        <p className="text-sm uppercase tracking-[0.35em] text-accent">Ascension complete</p>
        <h2 className="mt-3 text-4xl font-semibold text-foreground md:text-5xl">
          {result.form} <span className="gradient-text-soul">{result.new_stage}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          {result.narrative || "Your SoulPet transformed and unlocked a new form."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          {result.color && <span className="rounded-full bg-secondary px-3 py-1">Color · {result.color}</span>}
          {result.aura && <span className="rounded-full bg-secondary px-3 py-1">Aura · {result.aura}</span>}
        </div>

        <Button onClick={onClose} className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90">
          Continue bonding
        </Button>
      </div>
    </div>
  );
}