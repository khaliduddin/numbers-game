import { getUserWallet, mockWallets } from "./mockData";

// Mock wallet service for Web3 functionality
class MockWalletService {
  private connectedWallet: any | null = null;
  private isConnected: boolean = false;
  private localStorageKey: string = "mock_wallet_connection";

  constructor() {
    // Check if wallet is already connected from localStorage
    this.checkLocalStorage();
  }

  private checkLocalStorage() {
    const savedConnection = localStorage.getItem(this.localStorageKey);
    if (savedConnection) {
      try {
        const connectionData = JSON.parse(savedConnection);
        const wallet = getUserWallet(connectionData.userId);
        if (wallet && wallet.address) {
          this.connectedWallet = wallet;
          this.isConnected = true;
        }
      } catch (error) {
        console.error("Error parsing saved wallet connection:", error);
        localStorage.removeItem(this.localStorageKey);
      }
    }
  }

  connectWallet(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const wallet = getUserWallet(userId);

        if (wallet && wallet.address) {
          this.connectedWallet = wallet;
          this.isConnected = true;

          // Save to localStorage
          localStorage.setItem(
            this.localStorageKey,
            JSON.stringify({ userId }),
          );

          resolve(wallet);
        } else {
          reject(
            new Error(
              "No wallet found for this user or wallet address is empty",
            ),
          );
        }
      }, 1500); // Simulate network delay for blockchain connection
    });
  }

  disconnectWallet(): void {
    this.connectedWallet = null;
    this.isConnected = false;
    localStorage.removeItem(this.localStorageKey);
  }

  getConnectedWallet(): any | null {
    return this.connectedWallet;
  }

  isWalletConnected(): boolean {
    return this.isConnected;
  }

  getBalance(): number {
    return this.connectedWallet ? this.connectedWallet.balance : 0;
  }

  getTransactions(): any[] {
    return this.connectedWallet ? this.connectedWallet.transactions : [];
  }

  // Mock transaction methods
  payTournamentEntry(tournamentId: string, entryFee: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Wallet not connected"));
        return;
      }

      if (this.connectedWallet.balance < entryFee) {
        reject(new Error("Insufficient balance"));
        return;
      }

      // Simulate network delay
      setTimeout(() => {
        // In a real app, this would interact with a blockchain
        // For this mock, we'll just update the local wallet data
        this.connectedWallet.balance -= entryFee;

        // Add transaction record
        const newTransaction = {
          id: `tx${this.connectedWallet.transactions.length + 1}`,
          type: "tournament-entry",
          amount: -entryFee,
          tournamentId,
          timestamp: new Date(),
        };

        this.connectedWallet.transactions.push(newTransaction);

        resolve(true);
      }, 2000); // Simulate blockchain transaction time
    });
  }

  // For testing different wallet scenarios
  mockDeposit(amount: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Wallet not connected"));
        return;
      }

      // Simulate network delay
      setTimeout(() => {
        // Update the local wallet data
        this.connectedWallet.balance += amount;

        // Add transaction record
        const newTransaction = {
          id: `tx${this.connectedWallet.transactions.length + 1}`,
          type: "deposit",
          amount,
          timestamp: new Date(),
        };

        this.connectedWallet.transactions.push(newTransaction);

        resolve(true);
      }, 1500);
    });
  }
}

export const mockWallet = new MockWalletService();
