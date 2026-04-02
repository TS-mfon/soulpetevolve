import { Navbar } from "@/components/SoulNavbar";
import { PetViewer } from "@/components/PetViewer";
import { TraitDashboard } from "@/components/TraitDashboard";
import { SoulRadarChart } from "@/components/SoulRadarChart";
import { EvolutionPanel } from "@/components/EvolutionPanel";
import { ChatInterface } from "@/components/ChatInterface";
import { InteractionLog } from "@/components/InteractionLog";
import { MintSection } from "@/components/MintSection";
import { PetLoader } from "@/components/PetLoader";
import { useSoulPets } from "@/hooks/useSoulPets";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useEffect } from "react";

const Index = () => {
  const { isConnected } = useWallet();
  const {
    petState, history, isLoading, isChatting, isEvolving, isMinting,
    currentTokenId, mintPet, chatWithPet, evolvePet,
    loadPetState, loadHistory, canEvolve, getEvolutionProgress,
    lastChatResult,
  } = useSoulPets();

  // Load history when pet is loaded
  useEffect(() => {
    if (currentTokenId) loadHistory(currentTokenId);
  }, [currentTokenId, loadHistory]);

  const hasPet = !!petState && !!currentTokenId;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!hasPet ? (
            <div className="space-y-6">
              <MintSection
                onMint={mintPet}
                isMinting={isMinting}
                isConnected={isConnected}
              />
              {isConnected && (
                <div className="max-w-sm mx-auto">
                  <PetLoader onLoadPet={loadPetState} isLoading={isLoading} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pet header */}
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold">
                  <span className="gradient-text-soul">{petState.token_id}</span>
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Stage: <span className="text-foreground capitalize">{petState.stage}</span>
                  {" · "}EP: <span className="text-foreground">{petState.evolution_points}</span>
                </p>
              </div>

              {/* Main layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left column - Pet view + stats */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="soul-card p-4">
                    <PetViewer
                      petState={petState}
                      isChatting={isChatting}
                      isEvolving={isEvolving}
                    />
                  </div>
                  <EvolutionPanel
                    stage={petState.stage}
                    evolutionPoints={petState.evolution_points}
                    interactionCount={petState.interaction_count}
                    canEvolve={canEvolve()}
                    isEvolving={isEvolving}
                    onEvolve={() => evolvePet(currentTokenId)}
                    progress={getEvolutionProgress()}
                  />
                  <SoulRadarChart traits={petState.traits} />
                </div>

                {/* Center - Chat */}
                <div className="lg:col-span-5">
                  <ChatInterface
                    tokenId={currentTokenId}
                    history={history}
                    isChatting={isChatting}
                    onSendMessage={chatWithPet}
                    lastResponse={lastChatResult?.response}
                  />
                </div>

                {/* Right - Traits + Log */}
                <div className="lg:col-span-3 space-y-4">
                  <TraitDashboard traits={petState.traits} />
                  <InteractionLog history={history} />
                  <PetLoader onLoadPet={loadPetState} isLoading={isLoading} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          SoulPets — AI-Evolving NFTs on{" "}
          <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            GenLayer
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
