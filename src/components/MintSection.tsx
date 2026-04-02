import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MintSectionProps {
  onMint: () => void;
  isMinting: boolean;
  isConnected: boolean;
}

export function MintSection({ onMint, isMinting, isConnected }: MintSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Floating egg */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
        <div className="relative animate-egg-float animate-egg-glow rounded-full w-32 h-32 bg-gradient-to-br from-soul-egg to-primary flex items-center justify-center">
          <span className="text-6xl select-none">🥚</span>
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-3">
        Adopt a <span className="gradient-text-soul">SoulPet</span>
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 text-sm md:text-base">
        Every SoulPet starts as a mysterious Soul Egg. Chat with your pet to shape its personality,
        watch it evolve, and discover what creature lies within.
      </p>

      {!isConnected ? (
        <p className="text-sm text-muted-foreground">
          Connect your wallet to adopt a pet
        </p>
      ) : (
        <Button
          onClick={onMint}
          disabled={isMinting}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
        >
          {isMinting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Minting...
            </>
          ) : (
            "🥚 Adopt New Pet"
          )}
        </Button>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl w-full">
        {[
          { icon: "💬", title: "Chat & Bond", desc: "Talk to your pet to build a soul connection" },
          { icon: "🧬", title: "Evolve", desc: "Watch your pet grow through 4 stages" },
          { icon: "✨", title: "Unique Forms", desc: "AI determines form based on your interactions" },
        ].map((f) => (
          <div key={f.title} className="soul-card p-4 text-center">
            <span className="text-2xl">{f.icon}</span>
            <h3 className="font-semibold mt-2 text-sm text-foreground">{f.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
