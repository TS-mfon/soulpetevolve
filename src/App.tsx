import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";
import { SoulPetAudioProvider } from "@/lib/audio/SoulPetAudioProvider";
import { Navbar } from "@/components/SoulNavbar";
import Index from "./pages/Index.tsx";
import Explorer from "./pages/Explorer.tsx";
import PetDetail from "./pages/PetDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <SoulPetAudioProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pets" element={<Explorer />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/pets/:tokenId" element={<PetDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>

            <footer className="border-t border-border px-6 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                SoulPets — AI-evolving companions on{" "}
                <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  GenLayer
                </a>
              </p>
            </footer>
          </BrowserRouter>
        </TooltipProvider>
      </SoulPetAudioProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
