import React, { useState } from "react";
import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface WalletConnectProps {
  onConnect?: (walletAddress: string) => void;
  isConnected?: boolean;
  walletAddress?: string;
}

const WalletConnect = ({
  onConnect = () => {},
  isConnected = false,
  walletAddress = "",
}: WalletConnectProps) => {
  const [open, setOpen] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const walletOptions = [
    { id: "metamask", name: "MetaMask", icon: "🦊" },
    { id: "walletconnect", name: "WalletConnect", icon: "🔗" },
    { id: "coinbase", name: "Coinbase Wallet", icon: "🪙" },
    { id: "phantom", name: "Phantom", icon: "👻" },
  ];

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallet(walletId);
  };

  const handleConnect = () => {
    if (!selectedWallet) return;

    setConnecting(true);

    // Simulate connection delay
    setTimeout(() => {
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 42);
      onConnect(mockAddress);
      setConnecting(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-md mx-auto">
      {isConnected ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium">Wallet Connected</h3>
          <p className="text-sm text-gray-500 text-center break-all">
            {walletAddress}
          </p>
          <Button
            variant="outline"
            onClick={() => onConnect("")}
            className="mt-2"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center justify-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              <DialogDescription>
                Select a wallet provider to connect to the game and participate
                in tournaments.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletSelect(wallet.id)}
                  className={`flex items-center p-4 rounded-lg border transition-colors ${
                    selectedWallet === wallet.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-2xl mr-3">{wallet.icon}</div>
                  <div className="flex-1 text-left">{wallet.name}</div>
                  {selectedWallet === wallet.id && (
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button
                onClick={handleConnect}
                disabled={!selectedWallet || connecting}
                className="w-full"
              >
                {connecting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WalletConnect;
