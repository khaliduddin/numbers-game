import { getUserByCredentials, getUserById, mockUsers } from "./mockData";

// Mock authentication service
class MockAuthService {
  private currentUser: any | null = null;
  private isAuthenticated: boolean = false;
  private localStorageKey: string = "mock_auth_user";

  constructor() {
    // Check if user is already logged in from localStorage
    this.checkLocalStorage();
  }

  private checkLocalStorage() {
    const savedUser = localStorage.getItem(this.localStorageKey);
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const user = getUserById(userData.id);
        if (user) {
          this.currentUser = user;
          this.isAuthenticated = true;
        }
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem(this.localStorageKey);
      }
    }
  }

  login(email: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        const user = getUserByCredentials(email, password);
        if (user) {
          this.currentUser = user;
          this.isAuthenticated = true;

          // Save to localStorage (exclude password for security)
          const { password: _, ...safeUserData } = user;
          localStorage.setItem(
            this.localStorageKey,
            JSON.stringify(safeUserData),
          );

          resolve(safeUserData);
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 800); // Simulate network delay
    });
  }

  signup(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Check if email already exists
        const existingUser = mockUsers.find(
          (user) => user.email === userData.email,
        );
        if (existingUser) {
          reject(new Error("Email already in use"));
          return;
        }

        // Create new user (in a real app, this would be saved to a database)
        const newUser = {
          id: `user-${mockUsers.length + 1}`,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          joinDate: new Date().toISOString().split("T")[0],
          stats: {
            wins: 0,
            losses: 0,
            totalGames: 0,
            averageScore: 0,
            bestScore: 0,
            fastestTime: "0s",
            accuracy: 0,
            level: 1,
            xpProgress: 0,
          },
          achievements: [],
        };

        // In a real app, we would add this user to the database
        // For this mock, we'll just set it as the current user
        this.currentUser = newUser;
        this.isAuthenticated = true;

        // Save to localStorage (exclude password for security)
        const { password: _, ...safeUserData } = newUser;
        localStorage.setItem(
          this.localStorageKey,
          JSON.stringify(safeUserData),
        );

        resolve(safeUserData);
      }, 1000); // Simulate network delay
    });
  }

  logout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem(this.localStorageKey);
  }

  getCurrentUser(): any | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // For testing different user scenarios
  loginAsUser(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const user = getUserById(userId);
      if (user) {
        this.currentUser = user;
        this.isAuthenticated = true;

        // Save to localStorage (exclude password for security)
        const { password: _, ...safeUserData } = user;
        localStorage.setItem(
          this.localStorageKey,
          JSON.stringify(safeUserData),
        );

        resolve(safeUserData);
      } else {
        reject(new Error(`User with ID ${userId} not found`));
      }
    });
  }
}

export const mockAuth = new MockAuthService();
