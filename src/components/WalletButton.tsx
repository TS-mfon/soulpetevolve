import { useWallet, formatAddress } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, RefreshCw } from "lucide-react";

export function WalletButton() {
  const { address, isConnected, isLoading, isMetaMaskInstalled, connectWallet, disconnectWallet } = useWallet();

  if (isLoading) {
    return (
      <Button variant="outline" disabled className="border-border">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (!isMetaMaskInstalled) {
    return (
      <Button
        variant="outline"
        className="border-border"
        onClick={() => window.open("https://metamask.io/download/", "_blank")}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Install MetaMask
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-mono">
        {formatAddress(address, 14)}
      </div>
      <Button variant="ghost" size="icon" onClick={disconnectWallet} className="text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
