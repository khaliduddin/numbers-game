// Mock User Accounts
export const mockUsers = [
  {
    id: "user-1",
    username: "TestPlayer1",
    email: "player1@example.com",
    password: "password123", // Only for testing purposes
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TestPlayer1",
    walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    joinDate: "2023-01-15",
    stats: {
      wins: 42,
      losses: 18,
      totalGames: 60,
      averageScore: 85,
      bestScore: 98,
      fastestTime: "1.2s",
      accuracy: 92,
      level: 7,
      xpProgress: 68,
    },
    achievements: [
      {
        id: "ach1",
        title: "First Victory",
        description: "Won your first 1v1 match",
        date: "2023-02-01",
        icon: "trophy",
      },
      {
        id: "ach2",
        title: "Speed Demon",
        description: "Completed a round in under 2 seconds",
        date: "2023-03-10",
        icon: "zap",
      },
      {
        id: "ach3",
        title: "Tournament Champion",
        description: "Won a tournament with 15 players or more",
        date: "2023-04-22",
        icon: "award",
      },
    ],
  },
  {
    id: "user-2",
    username: "NumberNinja",
    email: "ninja@example.com",
    password: "ninja123",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=NumberNinja",
    walletAddress: "0x82D7EeC8A3637f4B7AF86C4c7F940B42F4A0a8a9",
    joinDate: "2023-02-20",
    stats: {
      wins: 78,
      losses: 12,
      totalGames: 90,
      averageScore: 92,
      bestScore: 100,
      fastestTime: "0.9s",
      accuracy: 95,
      level: 12,
      xpProgress: 45,
    },
    achievements: [
      {
        id: "ach1",
        title: "First Victory",
        description: "Won your first 1v1 match",
        date: "2023-02-25",
        icon: "trophy",
      },
      {
        id: "ach4",
        title: "Perfect Score",
        description: "Achieved 100% accuracy in a game",
        date: "2023-03-15",
        icon: "target",
      },
      {
        id: "ach5",
        title: "Math Wizard",
        description: "Won 10 games in a row",
        date: "2023-04-10",
        icon: "zap",
      },
    ],
  },
  {
    id: "user-3",
    username: "Beginner123",
    email: "beginner@example.com",
    password: "begin123",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beginner123",
    joinDate: "2023-05-10",
    stats: {
      wins: 5,
      losses: 15,
      totalGames: 20,
      averageScore: 65,
      bestScore: 78,
      fastestTime: "3.5s",
      accuracy: 70,
      level: 2,
      xpProgress: 30,
    },
    achievements: [],
  },
];

// Mock Game History
export const mockGameHistory = [
  {
    id: "game-1",
    userId: "user-1",
    date: "2023-06-15",
    mode: "Solo",
    score: 85,
    outcome: "Completed",
    accuracy: 92,
    timePerRound: 3.2,
  },
  {
    id: "game-2",
    userId: "user-1",
    date: "2023-06-14",
    mode: "1v1",
    score: 78,
    outcome: "Win",
    opponent: "Player123",
    accuracy: 88,
    timePerRound: 2.8,
  },
  {
    id: "game-3",
    userId: "user-1",
    date: "2023-06-12",
    mode: "Tournament",
    score: 92,
    outcome: "Win",
    accuracy: 95,
    timePerRound: 2.5,
  },
  {
    id: "game-4",
    userId: "user-1",
    date: "2023-06-10",
    mode: "1v1",
    score: 65,
    outcome: "Loss",
    opponent: "NumberMaster",
    accuracy: 80,
    timePerRound: 3.5,
  },
  {
    id: "game-5",
    userId: "user-1",
    date: "2023-06-08",
    mode: "Tournament",
    score: 88,
    outcome: "Loss",
    accuracy: 90,
    timePerRound: 2.9,
  },
  {
    id: "game-6",
    userId: "user-2",
    date: "2023-06-15",
    mode: "Tournament",
    score: 95,
    outcome: "Win",
    accuracy: 98,
    timePerRound: 1.5,
  },
  {
    id: "game-7",
    userId: "user-2",
    date: "2023-06-13",
    mode: "1v1",
    score: 92,
    outcome: "Win",
    opponent: "MathGenius",
    accuracy: 95,
    timePerRound: 1.8,
  },
  {
    id: "game-8",
    userId: "user-3",
    date: "2023-06-14",
    mode: "Solo",
    score: 62,
    outcome: "Completed",
    accuracy: 70,
    timePerRound: 4.2,
  },
];

// Mock Tournaments
export const mockTournaments = [
  {
    id: "t-123",
    name: "Weekend Challenge",
    entryFee: 5,
    prizePool: 250,
    startTime: new Date(Date.now() + 3600000), // 1 hour from now
    participantCount: 18,
    maxParticipants: 32,
    status: "upcoming",
    participants: [
      { userId: "user-1", registered: true, paid: true },
      { userId: "user-2", registered: true, paid: true },
    ],
  },
  {
    id: "t-124",
    name: "Pro Tournament",
    entryFee: 10,
    prizePool: 500,
    startTime: new Date(Date.now() + 7200000), // 2 hours from now
    participantCount: 24,
    maxParticipants: 32,
    status: "upcoming",
    participants: [{ userId: "user-2", registered: true, paid: true }],
  },
  {
    id: "t-125",
    name: "Daily Sprint",
    entryFee: 2,
    prizePool: 100,
    startTime: new Date(Date.now() + 1800000), // 30 minutes from now
    participantCount: 12,
    maxParticipants: 16,
    status: "upcoming",
    participants: [],
  },
  {
    id: "t-126",
    name: "Weekly Championship",
    entryFee: 15,
    prizePool: 750,
    startTime: new Date(Date.now() + 86400000), // 24 hours from now
    participantCount: 8,
    maxParticipants: 64,
    status: "upcoming",
    participants: [
      { userId: "user-1", registered: true, paid: false }, // Registered but not paid
    ],
  },
  {
    id: "t-127",
    name: "Beginner's Tournament",
    entryFee: 1,
    prizePool: 50,
    startTime: new Date(Date.now() - 3600000), // Started 1 hour ago
    endTime: new Date(Date.now() + 3600000), // Ends in 1 hour
    participantCount: 8,
    maxParticipants: 16,
    status: "active",
    participants: [
      { userId: "user-1", registered: true, paid: true, currentScore: 45 },
      { userId: "user-2", registered: true, paid: true, currentScore: 62 },
      { userId: "user-3", registered: true, paid: true, currentScore: 28 },
    ],
  },
  {
    id: "t-128",
    name: "Last Week's Championship",
    entryFee: 10,
    prizePool: 500,
    startTime: new Date(Date.now() - 604800000), // 7 days ago
    endTime: new Date(Date.now() - 518400000), // 6 days ago
    participantCount: 32,
    maxParticipants: 32,
    status: "completed",
    participants: [
      {
        userId: "user-1",
        registered: true,
        paid: true,
        finalRank: 3,
        prize: 50,
      },
      {
        userId: "user-2",
        registered: true,
        paid: true,
        finalRank: 1,
        prize: 250,
      },
    ],
    winners: [
      { userId: "user-2", rank: 1, prize: 250 },
      { userId: "user-other1", rank: 2, prize: 150 },
      { userId: "user-1", rank: 3, prize: 50 },
    ],
  },
];

// Mock Leaderboard Data
export const mockLeaderboard = {
  global: [
    {
      id: "1",
      userId: "user-2",
      rank: 1,
      name: "NumberNinja",
      score: 9850,
      gamesPlayed: 124,
      winRate: 78,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NumberNinja",
    },
    {
      id: "2",
      rank: 2,
      name: "Maria Garcia",
      score: 9720,
      gamesPlayed: 118,
      winRate: 75,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    {
      id: "3",
      rank: 3,
      name: "Wei Zhang",
      score: 9650,
      gamesPlayed: 132,
      winRate: 72,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wei",
    },
    {
      id: "4",
      userId: "user-1",
      rank: 4,
      name: "TestPlayer1",
      score: 9540,
      gamesPlayed: 110,
      winRate: 70,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TestPlayer1",
    },
    {
      id: "5",
      rank: 5,
      name: "Sophia Lee",
      score: 9480,
      gamesPlayed: 105,
      winRate: 68,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    },
    {
      id: "15",
      userId: "user-3",
      rank: 15,
      name: "Beginner123",
      score: 4250,
      gamesPlayed: 20,
      winRate: 25,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beginner123",
    },
  ],
  friends: [
    {
      id: "1",
      userId: "user-2",
      rank: 1,
      name: "NumberNinja",
      score: 8950,
      gamesPlayed: 98,
      winRate: 72,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NumberNinja",
    },
    {
      id: "2",
      rank: 2,
      name: "Michael Brown",
      score: 8720,
      gamesPlayed: 105,
      winRate: 68,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    {
      id: "3",
      rank: 3,
      name: "Sarah Davis",
      score: 8450,
      gamesPlayed: 92,
      winRate: 65,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
  ],
  tournaments: [
    {
      id: "1",
      rank: 1,
      name: "Weekend Challenge #42",
      score: 10000,
      gamesPlayed: 15,
      winRate: 100,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament1",
    },
    {
      id: "2",
      rank: 2,
      name: "Pro Series #18",
      score: 9500,
      gamesPlayed: 15,
      winRate: 93,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament2",
    },
    {
      id: "3",
      rank: 3,
      name: "Monthly Championship",
      score: 9200,
      gamesPlayed: 15,
      winRate: 87,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament3",
    },
    {
      id: "4",
      rank: 4,
      name: "Beginner Friendly #7",
      score: 8800,
      gamesPlayed: 15,
      winRate: 80,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tournament4",
    },
  ],
};

// Mock Wallet Data
export const mockWallets = {
  "user-1": {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    balance: 25.75,
    transactions: [
      {
        id: "tx1",
        type: "deposit",
        amount: 50,
        timestamp: new Date(Date.now() - 604800000),
      },
      {
        id: "tx2",
        type: "tournament-entry",
        amount: -10,
        tournamentId: "t-128",
        timestamp: new Date(Date.now() - 604800000),
      },
      {
        id: "tx3",
        type: "tournament-prize",
        amount: 50,
        tournamentId: "t-128",
        timestamp: new Date(Date.now() - 518400000),
      },
      {
        id: "tx4",
        type: "tournament-entry",
        amount: -5,
        tournamentId: "t-123",
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
  },
  "user-2": {
    address: "0x82D7EeC8A3637f4B7AF86C4c7F940B42F4A0a8a9",
    balance: 350.5,
    transactions: [
      {
        id: "tx1",
        type: "deposit",
        amount: 100,
        timestamp: new Date(Date.now() - 1209600000),
      },
      {
        id: "tx2",
        type: "tournament-entry",
        amount: -10,
        tournamentId: "t-128",
        timestamp: new Date(Date.now() - 604800000),
      },
      {
        id: "tx3",
        type: "tournament-prize",
        amount: 250,
        tournamentId: "t-128",
        timestamp: new Date(Date.now() - 518400000),
      },
      {
        id: "tx4",
        type: "tournament-entry",
        amount: -10,
        tournamentId: "t-124",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        id: "tx5",
        type: "tournament-entry",
        amount: -5,
        tournamentId: "t-123",
        timestamp: new Date(Date.now() - 43200000),
      },
    ],
  },
  "user-3": {
    address: "", // No wallet connected
    balance: 0,
    transactions: [],
  },
};

// Helper function to get user by credentials (for login simulation)
export const getUserByCredentials = (email: string, password: string) => {
  return (
    mockUsers.find(
      (user) => user.email === email && user.password === password,
    ) || null
  );
};

// Helper function to get user by ID
export const getUserById = (userId: string) => {
  return mockUsers.find((user) => user.id === userId) || null;
};

// Helper function to get user's game history
export const getUserGameHistory = (userId: string) => {
  return mockGameHistory.filter((game) => game.userId === userId);
};

// Helper function to get user's wallet
export const getUserWallet = (userId: string) => {
  return mockWallets[userId as keyof typeof mockWallets] || null;
};

// Helper function to get tournaments by status
export const getTournamentsByStatus = (
  status: "upcoming" | "active" | "completed",
) => {
  return mockTournaments.filter((tournament) => tournament.status === status);
};

// Helper function to get user's tournaments
export const getUserTournaments = (userId: string) => {
  return mockTournaments.filter((tournament) =>
    tournament.participants.some(
      (participant) => participant.userId === userId,
    ),
  );
};
