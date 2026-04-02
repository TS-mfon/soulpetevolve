import { useEffect, useMemo, useState } from "react";
import { PetSummaryCard } from "@/components/PetSummaryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { soulPetsContract, type PetState } from "@/lib/contracts/SoulPets";
import { getKnownPetIds, rememberPetId } from "@/lib/soulpets/discovery";
import { Compass, Loader2, Search } from "lucide-react";

const FEATURED_IDS = ["pet_0", "pet_1", "pet_2", "pet_3", "pet_4", "pet_5"];

export default function Explorer() {
  const [tokenId, setTokenId] = useState("");
  const [pets, setPets] = useState<PetState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const candidateIds = useMemo(() => {
    const merged = [...getKnownPetIds(), ...FEATURED_IDS];
    return Array.from(new Set(merged)).slice(0, 8);
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialPets = async () => {
      setIsLoading(true);
      const results = await Promise.allSettled(candidateIds.map((id) => soulPetsContract.getPetState(id)));
      if (!active) return;

      const loadedPets = results
        .filter((result): result is PromiseFulfilledResult<PetState> => result.status === "fulfilled")
        .map((result) => result.value);

      setPets(loadedPets);
      setIsLoading(false);
    };

    void loadInitialPets();

    return () => {
      active = false;
    };
  }, [candidateIds]);

  const handleLoadPet = async (nextTokenId?: string) => {
    const targetId = (nextTokenId ?? tokenId).trim();
    if (!targetId) return;

    setIsLoading(true);
    setError("");

    try {
      const pet = await soulPetsContract.getPetState(targetId);
      rememberPetId(targetId);
      setPets((current) => [pet, ...current.filter((entry) => entry.token_id !== pet.token_id)]);
      setTokenId("");
    } catch (err: any) {
      setError(err?.message || "Could not load that pet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 px-4 pb-12 pt-24 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border bg-card/80 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-accent">SoulPets explorer</p>
              <h1 className="mt-3 text-4xl font-semibold text-foreground md:text-5xl">Browse known pets and jump into any bond.</h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                The contract doesn’t expose a global index, so the explorer loads pets you’ve discovered plus featured public IDs.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tokenId}
                  onChange={(event) => setTokenId(event.target.value)}
                  placeholder="Load by token id, e.g. pet_0"
                  className="bg-muted border-border text-foreground"
                />
                <Button onClick={() => void handleLoadPet()} disabled={!tokenId.trim() || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Featured token shortcuts</h2>
              <p className="text-sm text-muted-foreground">Quick-load common demo IDs on studionet.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FEATURED_IDS.slice(0, 4).map((id) => (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  onClick={() => void handleLoadPet(id)}
                  className="border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                >
                  <Compass className="mr-2 h-4 w-4" />
                  {id}
                </Button>
              ))}
            </div>
          </div>

          {pets.length === 0 && !isLoading ? (
            <div className="soul-card p-12 text-center text-muted-foreground">No pets loaded yet. Try a token id like pet_0.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pets.map((pet) => (
                <PetSummaryCard key={pet.token_id} pet={pet} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}