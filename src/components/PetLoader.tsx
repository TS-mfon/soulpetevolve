import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface PetLoaderProps {
  onLoadPet: (tokenId: string) => Promise<any>;
  isLoading: boolean;
}

export function PetLoader({ onLoadPet, isLoading }: PetLoaderProps) {
  const [tokenId, setTokenId] = useState("");

  const handleLoad = () => {
    if (tokenId.trim()) onLoadPet(tokenId.trim());
  };

  return (
    <div className="soul-card p-4">
      <p className="text-xs text-muted-foreground mb-2">Load existing pet by ID</p>
      <div className="flex gap-2">
        <Input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          placeholder="e.g. pet_0"
          className="bg-muted border-border text-foreground"
        />
        <Button
          onClick={handleLoad}
          disabled={!tokenId.trim() || isLoading}
          variant="outline"
          size="icon"
          className="border-border"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
