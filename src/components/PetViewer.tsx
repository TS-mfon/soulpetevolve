import { type PetState } from "@/lib/contracts/SoulPets";

interface PetViewerProps {
  petState: PetState | null;
  isChatting?: boolean;
  isEvolving?: boolean;
}

const stageEmojis: Record<string, string> = {
  egg: "🥚",
  hatchling: "🐣",
  adult: "🐉",
  ancient: "🌟",
};

const formColors: Record<string, string> = {
  celestial: "from-soul-celestial to-accent",
  feral: "from-soul-feral to-destructive",
  ethereal: "from-soul-ethereal to-primary",
  guardian: "from-soul-guardian to-soul-intelligence",
  harmonious: "from-soul-kindness via-soul-intelligence to-soul-loyalty",
  egg: "from-soul-egg to-primary",
};

export function PetViewer({ petState, isChatting, isEvolving }: PetViewerProps) {
  const stage = petState?.stage || "egg";
  const form = petState?.visual_dna?.form || "egg";
  const emoji = stageEmojis[stage] || "🥚";
  const gradientClass = formColors[form] || formColors.egg;

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Glow background */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradientClass} opacity-5 blur-3xl`} />

      {/* Pet container */}
      <div
        className={`relative flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br ${gradientClass} 
          ${stage === "egg" ? "animate-egg-float animate-egg-glow" : ""}
          ${isChatting ? "animate-pulse-soft" : ""}
          ${isEvolving ? "animate-evolution-burst" : ""}
        `}
        style={{ opacity: isEvolving ? undefined : 0.9 }}
      >
        <span className="text-7xl drop-shadow-lg select-none">{emoji}</span>
      </div>

      {/* Stage label */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {stage}
        </p>
        {form !== "egg" && (
          <p className={`text-xs mt-1 font-medium bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
            {form} Form
          </p>
        )}
      </div>

      {/* Mood indicator */}
      {petState?.mood && petState.mood !== "dormant" && (
        <div className="mt-2 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground">
          Mood: {petState.mood}
        </div>
      )}

      {/* Visual DNA */}
      {petState?.visual_dna && form !== "egg" && (
        <div className="mt-3 flex gap-2 flex-wrap justify-center">
          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
            🎨 {petState.visual_dna.color}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
            ✨ {petState.visual_dna.aura}
          </span>
        </div>
      )}
    </div>
  );
}
