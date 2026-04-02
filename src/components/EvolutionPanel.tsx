import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2 } from "lucide-react";

interface EvolutionPanelProps {
  stage: string;
  evolutionPoints: number;
  interactionCount: number;
  canEvolve: boolean;
  isEvolving: boolean;
  onEvolve: () => void;
  progress: { current: number; needed: number; type: string };
}

const stageLabels: Record<string, string> = {
  egg: "Egg → Hatchling",
  hatchling: "Hatchling → Adult",
  adult: "Adult → Ancient",
  ancient: "Max Evolution",
};

export function EvolutionPanel({
  stage, evolutionPoints, interactionCount,
  canEvolve, isEvolving, onEvolve, progress,
}: EvolutionPanelProps) {
  const pct = Math.min((progress.current / progress.needed) * 100, 100);

  return (
    <div className="soul-card p-5 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        🌟 Evolution
      </h3>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{stageLabels[stage] || stage}</span>
          <span className="font-mono text-foreground">
            {progress.current}/{progress.needed}
          </span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {progress.type === "interactions"
            ? `${progress.current} of ${progress.needed} interactions`
            : `${progress.current} of ${progress.needed} EP`}
        </p>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>EP: {evolutionPoints}</span>
        <span>Interactions: {interactionCount}</span>
      </div>

      {stage !== "ancient" && (
        <Button
          onClick={onEvolve}
          disabled={!canEvolve || isEvolving}
          className={`w-full ${canEvolve ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-muted text-muted-foreground"}`}
        >
          {isEvolving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Evolving...
            </>
          ) : canEvolve ? (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Evolve Pet!
            </>
          ) : (
            "Not ready yet"
          )}
        </Button>
      )}

      {stage === "ancient" && (
        <p className="text-center text-sm text-accent font-medium">
          ✨ Maximum evolution reached!
        </p>
      )}
    </div>
  );
}
