import { useState, useCallback, useRef } from "react";
import { soulPetsContract, type PetState, type ChatResult, type EvolutionResult, type SoulInteraction } from "@/lib/contracts/SoulPets";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useToast } from "@/hooks/use-toast";

export function useSoulPets() {
  const { address } = useWallet();
  const { toast } = useToast();

  const [petState, setPetState] = useState<PetState | null>(null);
  const [history, setHistory] = useState<SoulInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [currentTokenId, setCurrentTokenId] = useState<string | null>(null);
  const [lastChatResult, setLastChatResult] = useState<ChatResult | null>(null);
  const [evolutionResult, setEvolutionResult] = useState<EvolutionResult | null>(null);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadPetState = useCallback(async (tokenId: string) => {
    try {
      setIsLoading(true);
      const state = await soulPetsContract.getPetState(tokenId);
      setPetState(state);
      setCurrentTokenId(tokenId);
      return state;
    } catch (err: any) {
      console.error("Failed to load pet state:", err);
      toast({ title: "Error", description: "Failed to load pet state", variant: "destructive" });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadHistory = useCallback(async (tokenId: string) => {
    try {
      const h = await soulPetsContract.getSoulHistory(tokenId);
      setHistory(h);
      return h;
    } catch (err) {
      console.error("Failed to load history:", err);
      return [];
    }
  }, []);

  const mintPet = useCallback(async () => {
    if (!address) {
      toast({ title: "Connect Wallet", description: "Please connect your wallet first", variant: "destructive" });
      return null;
    }
    try {
      setIsMinting(true);
      const tokenId = await soulPetsContract.mintPet(address);
      toast({ title: "🥚 Pet Adopted!", description: `Your soul egg has been minted: ${tokenId}` });
      await loadPetState(tokenId);
      setCurrentTokenId(tokenId);
      return tokenId;
    } catch (err: any) {
      console.error("Failed to mint:", err);
      toast({ title: "Mint Failed", description: err.message || "Could not mint pet", variant: "destructive" });
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [address, loadPetState, toast]);

  const pollForUpdate = useCallback(async (tokenId: string, prevInteractionCount: number) => {
    let attempts = 0;
    const maxAttempts = 20;

    const check = async () => {
      attempts++;
      try {
        const state = await soulPetsContract.getPetState(tokenId);
        if (state.interaction_count > prevInteractionCount) {
          setPetState(state);
          await loadHistory(tokenId);
          setIsChatting(false);
          return;
        }
      } catch {
        // continue polling
      }
      if (attempts < maxAttempts) {
        pollRef.current = setTimeout(check, 3000);
      } else {
        setIsChatting(false);
        toast({ title: "Timeout", description: "AI consensus is taking longer than expected. Try refreshing.", variant: "destructive" });
      }
    };
    check();
  }, [loadHistory, toast]);

  const chatWithPet = useCallback(async (tokenId: string, message: string) => {
    if (!address) {
      toast({ title: "Connect Wallet", description: "Please connect your wallet first", variant: "destructive" });
      return null;
    }
    try {
      setIsChatting(true);
      const prevCount = petState?.interaction_count || 0;
      const result = await soulPetsContract.chat(address, tokenId, message);
      setLastChatResult(result);

      // Poll for consensus
      pollForUpdate(tokenId, prevCount);
      return result;
    } catch (err: any) {
      console.error("Chat failed:", err);
      setIsChatting(false);
      const msg = err.message?.includes("[EXPECTED]")
        ? err.message.replace("[EXPECTED]", "").trim()
        : "Chat failed. Please try again.";
      toast({ title: "Chat Error", description: msg, variant: "destructive" });
      return null;
    }
  }, [address, petState, pollForUpdate, toast]);

  const evolvePet = useCallback(async (tokenId: string) => {
    if (!address) {
      toast({ title: "Connect Wallet", description: "Please connect your wallet first", variant: "destructive" });
      return null;
    }
    try {
      setIsEvolving(true);
      const result = await soulPetsContract.evolve(address, tokenId);
      setEvolutionResult(result);
      // Reload state
      await loadPetState(tokenId);
      toast({ title: "🌟 Evolution Complete!", description: result.narrative || "Your pet has evolved!" });
      return result;
    } catch (err: any) {
      console.error("Evolution failed:", err);
      const msg = err.message?.includes("[EXPECTED]")
        ? err.message.replace("[EXPECTED]", "").trim()
        : "Evolution failed. Please try again.";
      toast({ title: "Evolution Error", description: msg, variant: "destructive" });
      return null;
    } finally {
      setIsEvolving(false);
    }
  }, [address, loadPetState, toast]);

  const canEvolve = useCallback(() => {
    if (!petState) return false;
    if (petState.stage === "egg") return petState.interaction_count >= 5;
    if (petState.stage === "hatchling") return petState.evolution_points >= 20;
    if (petState.stage === "adult") return petState.evolution_points >= 50;
    return false;
  }, [petState]);

  const getEvolutionProgress = useCallback(() => {
    if (!petState) return { current: 0, needed: 5, type: "interactions" };
    if (petState.stage === "egg") return { current: petState.interaction_count, needed: 5, type: "interactions" };
    if (petState.stage === "hatchling") return { current: petState.evolution_points, needed: 20, type: "evolution points" };
    if (petState.stage === "adult") return { current: petState.evolution_points, needed: 50, type: "evolution points" };
    return { current: petState.evolution_points, needed: petState.evolution_points, type: "max" };
  }, [petState]);

  return {
    petState, history, isLoading, isChatting, isEvolving, isMinting,
    currentTokenId, lastChatResult, evolutionResult,
    loadPetState, loadHistory, mintPet, chatWithPet, evolvePet,
    canEvolve, getEvolutionProgress, setCurrentTokenId, setEvolutionResult,
  };
}
