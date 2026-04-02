import { WalletButton } from "./WalletButton";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border bg-background/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐾</span>
            <h1 className="text-xl font-bold">
              <span className="gradient-text-soul">SoulPets</span>
            </h1>
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
