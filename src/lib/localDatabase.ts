import { openDB, DBSchema, IDBPDatabase } from "idb";

interface GameDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      username: string;
      email?: string;
      avatarUrl?: string;
      joinDate: string;
      isGuest: boolean;
      walletAddress?: string;
    };
    indexes: { "by-email": string };
  };
  gameStats: {
    key: string;
    value: {
      id: string;
      userId: string;
      mode: "Solo" | "1v1" | "Tournament";
      score: number;
      accuracy: number;
      timePerRound: number;
      outcome: "Win" | "Loss" | "Draw" | "Completed";
      opponent?: string;
      createdAt: string;
      roundDetails?: any[];
    };
    indexes: { "by-userId": string };
  };
}

let dbPromise: Promise<IDBPDatabase<GameDB>>;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<GameDB>("web3-number-game", 1, {
      upgrade(db) {
        // Create users store
        const userStore = db.createObjectStore("users", { keyPath: "id" });
        userStore.createIndex("by-email", "email");

        // Create game stats store
        const gameStatsStore = db.createObjectStore("gameStats", {
          keyPath: "id",
          autoIncrement: true,
        });
        gameStatsStore.createIndex("by-userId", "userId");
      },
    });
  }
  return dbPromise;
};

export const localDatabase = {
  async getUser(id: string) {
    const db = await initDB();
    return db.get("users", id);
  },

  async getUserByEmail(email: string) {
    const db = await initDB();
    return db.getFromIndex("users", "by-email", email);
  },

  async saveUser(user: GameDB["users"]["value"]) {
    const db = await initDB();
    return db.put("users", user);
  },

  async saveGameStats(stats: Omit<GameDB["gameStats"]["value"], "id">) {
    const db = await initDB();
    return db.add("gameStats", stats as any);
  },

  async getGameHistory(userId: string) {
    const db = await initDB();
    const games = await db.getAllFromIndex("gameStats", "by-userId", userId);
    return games.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
};
