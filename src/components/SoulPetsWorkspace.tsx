import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PetViewer } from "@/components/PetViewer";
import { TraitDashboard } from "@/components/TraitDashboard";
import { SoulRadarChart } from "@/components/SoulRadarChart";
import { EvolutionPanel } from "@/components/EvolutionPanel";
import { ChatInterface } from "@/components/ChatInterface";
import { InteractionLog } from "@/components/InteractionLog";
import { MintSection } from "@/components/MintSection";
import { PetLoader } from "@/components/PetLoader";
import { EvolutionOverlay } from "@/components/EvolutionOverlay";
import { Button } from "@/components/ui/button";
import { useSoulPets } from "@/hooks/useSoulPets";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useSoulPetAudio } from "@/lib/audio/SoulPetAudioProvider";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";

interface SoulPetsWorkspaceProps {
  initialTokenId?: string | null;
}

export function SoulPetsWorkspace({ initialTokenId = null }: SoulPetsWorkspaceProps) {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { playChatSend, playChatResponse, playEvolution } = useSoulPetAudio();
  const {
    petState,
    history,
    isLoading,
    isChatting,
    isEvolving,
    isMinting,
    currentTokenId,
    mintPet,
    chatWithPet,
    evolvePet,
    loadPetState,
    loadHistory,
    canEvolve,
    getEvolutionProgress,
    lastChatResult,
    evolutionResult,
    setEvolutionResult,
  } = useSoulPets();

  const [overlayOpen, setOverlayOpen] = useState(false);
  const lastHeardTurnRef = useRef(0);
  const lastEvolutionKeyRef = useRef("");

  useEffect(() => {
    if (initialTokenId && initialTokenId !== currentTokenId) {
      void loadPetState(initialTokenId);
    }
  }, [currentTokenId, initialTokenId, loadPetState]);

  useEffect(() => {
    if (currentTokenId) {
      void loadHistory(currentTokenId);
    }
  }, [currentTokenId, loadHistory]);

  useEffect(() => {
    if (!lastChatResult || lastChatResult.interaction_count <= lastHeardTurnRef.current) return;
    lastHeardTurnRef.current = lastChatResult.interaction_count;
    playChatResponse();
  }, [lastChatResult, playChatResponse]);

  useEffect(() => {
    if (!evolutionResult) return;
    const nextKey = `${evolutionResult.new_stage}-${evolutionResult.form}-${evolutionResult.narrative}`;
    if (nextKey === lastEvolutionKeyRef.current) return;

    lastEvolutionKeyRef.current = nextKey;
    setOverlayOpen(true);
    playEvolution();

    const timer = window.setTimeout(() => setOverlayOpen(false), 4200);
    return () => window.clearTimeout(timer);
  }, [evolutionResult, playEvolution]);

  const hasPet = !!petState && !!currentTokenId;

  const headerCopy = useMemo(() => {
    if (!petState) return null;
    return {
      stage: petState.stage,
      ep: petState.evolution_points,
      tokenId: petState.token_id,
    };
  }, [petState]);

  const handleMint = async () => {
    const tokenId = await mintPet();
    if (tokenId) navigate(`/pets/${tokenId}`);
  };

  const handleSendMessage = async (tokenId: string, message: string) => {
    playChatSend();
    return chatWithPet(tokenId, message);
  };

  const handleEvolve = async () => {
    if (!currentTokenId) return;
    await evolvePet(currentTokenId);
  };

  const closeOverlay = () => {
    setOverlayOpen(false);
    setEvolutionResult(null);
  };

  return (
    <>
      <EvolutionOverlay result={evolutionResult} open={overlayOpen} onClose={closeOverlay} />

      <main className="flex-1 px-4 pb-12 pt-24 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {!hasPet ? (
            <div className="space-y-8">
              <MintSection onMint={handleMint} isMinting={isMinting} isConnected={isConnected} />

              <div className="mx-auto flex max-w-3xl flex-col gap-4 md:flex-row md:items-center md:justify-center">
                {isConnected && (
                  <div className="flex-1">
                    <PetLoader onLoadPet={loadPetState} isLoading={isLoading} />
                  </div>
                )}
                <Button asChild variant="outline" className="border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary">
                  <Link to="/explorer">
                    <Compass className="mr-2 h-4 w-4" />
                    Open Explorer
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    <span className="rounded-full bg-secondary px-3 py-1">Soul bond active</span>
                    {initialTokenId && (
                      <Button asChild variant="ghost" className="h-auto px-0 py-0 text-xs text-muted-foreground hover:text-foreground">
                        <Link to="/explorer">
                          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                          Back to explorer
                        </Link>
                      </Button>
                    )}
                  </div>
                  <h1 className="text-3xl font-semibold md:text-5xl">
                    <span className="gradient-text-soul">{headerCopy?.tokenId}</span>
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">
                    Stage <span className="capitalize text-foreground">{headerCopy?.stage}</span>
                    {" · "}
                    EP <span className="text-foreground">{headerCopy?.ep}</span>
                  </p>
                </div>

                <Button asChild variant="outline" className="border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary">
                  <Link to="/explorer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Browse more pets
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-4">
                  <div className="soul-card p-4">
                    <PetViewer petState={petState} isChatting={isChatting} isEvolving={isEvolving} />
                  </div>
                  <EvolutionPanel
                    stage={petState.stage}
                    evolutionPoints={petState.evolution_points}
                    interactionCount={petState.interaction_count}
                    canEvolve={canEvolve()}
                    isEvolving={isEvolving}
                    onEvolve={handleEvolve}
                    progress={getEvolutionProgress()}
                  />
                  <SoulRadarChart traits={petState.traits} />
                </div>

                <div className="lg:col-span-5">
                  <ChatInterface
                    tokenId={currentTokenId}
                    history={history}
                    isChatting={isChatting}
                    onSendMessage={handleSendMessage}
                    lastResponse={lastChatResult?.response}
                  />
                </div>

                <div className="space-y-4 lg:col-span-3">
                  <TraitDashboard traits={petState.traits} />
                  <InteractionLog history={history} />
                  <PetLoader onLoadPet={loadPetState} isLoading={isLoading} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}