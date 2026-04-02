import type { SoulInteraction } from "@/lib/contracts/SoulPets";

interface InteractionLogProps {
  history: SoulInteraction[];
}

export function InteractionLog({ history }: InteractionLogProps) {
  if (history.length === 0) {
    return (
      <div className="soul-card p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          📜 Life Moments
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No interactions yet. Start chatting!
        </p>
      </div>
    );
  }

  return (
    <div className="soul-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        📜 Life Moments
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {[...history].reverse().map((interaction, i) => {
          let traitUpdates: Record<string, number> = {};
          try {
            traitUpdates = JSON.parse(interaction.trait_updates);
          } catch {}

          return (
            <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Turn #{interaction.turn}</span>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(traitUpdates).map(([trait, val]) =>
                    val > 0 ? (
                      <span key={trait} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        +{val} {trait.slice(0, 3)}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground truncate">{interaction.message}</p>
              <p className="text-xs text-muted-foreground truncate">{interaction.response}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
