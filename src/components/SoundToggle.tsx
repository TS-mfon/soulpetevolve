import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { useSoulPetAudio } from "@/lib/audio/SoulPetAudioProvider";

export function SoundToggle() {
  const { enabled, toggleEnabled } = useSoulPetAudio();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleEnabled}
      className="border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
      aria-label={enabled ? "Mute SoulPets sounds" : "Enable SoulPets sounds"}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}