import { WalletButton } from "./WalletButton";
import { NavLink } from "./NavLink";
import { SoundToggle } from "./SoundToggle";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border bg-background/80">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-3">
              <span className="text-2xl">🐾</span>
              <p className="text-xl font-bold">
                <span className="gradient-text-soul">SoulPets</span>
              </p>
            </NavLink>

            <nav className="hidden items-center gap-4 md:flex">
              <NavLink
                to="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeClassName="text-foreground"
              >
                Home
              </NavLink>
              <NavLink
                to="/explorer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeClassName="text-foreground"
              >
                Explorer
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <SoundToggle />
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
