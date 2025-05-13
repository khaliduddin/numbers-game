import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { limit as firestoreLimit } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { v4 as uuidv4 } from "uuid";

// Auth Service
export const firebaseAuthService = {
  async signup({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }) {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
      const joinDate = new Date().toISOString();

      await setDoc(doc(db, "profiles", user.uid), {
        id: user.uid,
        username,
        email,
        avatarUrl,
        joinDate,
        isGuest: false,
        referralCode: generateReferralCode(),
        xp: { solo: 0, duel: 0, tournament: 0 },
        loginCount: 1,
        lastLogin: joinDate,
      });

      return {
        id: user.uid,
        email: user.email,
        username,
        avatarUrl,
        joinDate,
      };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  async login({ email, password }: { email: string; password: string }) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get user profile from Firestore
      const profileDoc = await getDoc(doc(db, "profiles", user.uid));

      if (!profileDoc.exists()) {
        // Create profile if it doesn't exist
        const username = email.split("@")[0];
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
        const joinDate = new Date().toISOString();

        await setDoc(doc(db, "profiles", user.uid), {
          id: user.uid,
          username,
          email,
          avatarUrl,
          joinDate,
          isGuest: false,
          referralCode: generateReferralCode(),
          xp: { solo: 0, duel: 0, tournament: 0 },
          loginCount: 1,
          lastLogin: joinDate,
        });

        return {
          id: user.uid,
          email: user.email,
          username,
          avatarUrl,
          joinDate,
        };
      }

      // Update login count and last login
      const profileData = profileDoc.data();
      await updateDoc(doc(db, "profiles", user.uid), {
        loginCount: (profileData.loginCount || 0) + 1,
        lastLogin: new Date().toISOString(),
      });

      return {
        id: user.uid,
        email: user.email,
        username: profileData.username,
        avatarUrl: profileData.avatarUrl,
        joinDate: profileData.joinDate,
        walletAddress: profileData.walletAddress,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

// Profile Service
export const firebaseProfileService = {
  async getProfile(id: string, isGuest: boolean = false) {
    try {
      console.log(
        `Firebase getProfile called with id: ${id}, isGuest: ${isGuest}`,
      );
      let profileDoc;

      if (isGuest) {
        // For guest users, query by guestId field
        const q = query(collection(db, "profiles"), where("guestId", "==", id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log(`No profile found for guest ID: ${id}`);
          return { profile: null, error: null };
        }

        profileDoc = querySnapshot.docs[0];
        console.log(`Found guest profile with ID: ${profileDoc.id}`);
      } else {
        // For authenticated users, get by document ID
        profileDoc = await getDoc(doc(db, "profiles", id));

        if (!profileDoc.exists()) {
          console.log(`No profile found for user ID: ${id}`);
          return { profile: null, error: null };
        }
        console.log(`Found user profile with ID: ${id}`);
      }

      const data = profileDoc.data();
      console.log(`Profile data retrieved:`, data);

      const profile = {
        id: data.id,
        username: data.username,
        email: data.email,
        telegramId: data.telegramId,
        walletAddress: data.walletAddress,
        phoneNumber: data.phoneNumber,
        avatarUrl: data.avatarUrl,
        joinDate: data.joinDate,
        lastLogin: data.lastLogin,
        loginCount: data.loginCount,
        referralCode: data.referralCode,
        referredByCode: data.referredByCode,
        isGuest: data.isGuest,
        guestId: data.guestId,
        stats: data.stats,
        xp: data.xp || { solo: 0, duel: 0, tournament: 0 },
      };

      console.log(
        `Returning profile with referral code: ${profile.referralCode}`,
      );

      return {
        profile,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { profile: null, error };
    }
  },

  async getProfileByTelegramId(telegramId: string) {
    try {
      console.log(
        `Firebase getProfileByTelegramId called with telegramId: ${telegramId}`,
      );

      // Query profiles by telegramId field
      const q = query(
        collection(db, "profiles"),
        where("telegramId", "==", telegramId),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`No profile found for Telegram ID: ${telegramId}`);
        return { profile: null, error: null };
      }

      const profileDoc = querySnapshot.docs[0];
      console.log(
        `Found profile with Telegram ID: ${telegramId}, profile ID: ${profileDoc.id}`,
      );

      const data = profileDoc.data();
      console.log(`Profile data retrieved:`, data);

      const profile = {
        id: data.id,
        username: data.username,
        email: data.email,
        telegramId: data.telegramId,
        walletAddress: data.walletAddress,
        phoneNumber: data.phoneNumber,
        avatarUrl: data.avatarUrl,
        joinDate: data.joinDate,
        lastLogin: data.lastLogin,
        loginCount: data.loginCount,
        referralCode: data.referralCode,
        referredByCode: data.referredByCode,
        isGuest: data.isGuest,
        guestId: data.guestId,
        stats: data.stats,
        xp: data.xp || { solo: 0, duel: 0, tournament: 0 },
      };

      return {
        profile,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching profile by Telegram ID:", error);
      return { profile: null, error };
    }
  },

  async getProfileByReferralCode(referralCode: string) {
    if (!referralCode) {
      return { profile: null, error: "No referral code provided" };
    }

    try {
      const q = query(
        collection(db, "profiles"),
        where("referralCode", "==", referralCode),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { profile: null, error: null };
      }

      const data = querySnapshot.docs[0].data();

      return { profile: data, error: null };
    } catch (error) {
      console.error("Error finding profile with referral code:", error);
      return { profile: null, error };
    }
  },

  async saveProfile(profile: any) {
    try {
      const isGuest = profile.isGuest || false;
      let profileId = profile.id;
      let docRef;

      // Check if profile exists by email first (to prevent duplicates)
      let existingProfileId = null;

      if (!isGuest && profile.email) {
        const emailQuery = query(
          collection(db, "profiles"),
          where("email", "==", profile.email),
        );
        const emailQuerySnapshot = await getDocs(emailQuery);

        if (!emailQuerySnapshot.empty) {
          // Use existing profile ID if found by email
          existingProfileId = emailQuerySnapshot.docs[0].id;
        }
      }

      if (existingProfileId) {
        // Use existing profile ID
        profileId = existingProfileId;
        docRef = doc(db, "profiles", profileId);
      } else if (isGuest && profile.guestId) {
        // For guest users, query by guestId
        const q = query(
          collection(db, "profiles"),
          where("guestId", "==", profile.guestId),
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Update existing guest profile
          docRef = querySnapshot.docs[0].ref;
          profileId = querySnapshot.docs[0].id;
        } else {
          // Create new guest profile with generated ID
          profileId = profile.guestId || `guest_${uuidv4()}`;
          docRef = doc(db, "profiles", profileId);
        }
      } else {
        // For authenticated users, use their ID
        docRef = doc(db, "profiles", profileId);
      }

      // Check if profile already exists to preserve referral code
      const existingDoc = await getDoc(docRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : null;

      // CRITICAL: Always prioritize existing referral code from database
      if (existingData && existingData.referralCode) {
        // Use existing referral code from database - this is the source of truth
        profile.referralCode = existingData.referralCode;
        console.log(
          "Using existing referral code from database:",
          profile.referralCode,
        );
      } else if (!profile.referralCode) {
        // Only generate a new referral code if one doesn't exist anywhere
        profile.referralCode = generateReferralCode();
        console.log("Generated new referral code:", profile.referralCode);
      } else {
        console.log("Using provided referral code:", profile.referralCode);
      }

      const currentTime = new Date().toISOString();

      // Prepare profile data
      const profileData = {
        id: profileId,
        username: profile.username || "User",
        email: profile.email || null,
        telegramId: profile.telegramId || null,
        walletAddress: profile.walletAddress || null,
        phoneNumber: profile.phoneNumber || null,
        avatarUrl:
          profile.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || "User"}`,
        joinDate: profile.joinDate || currentTime,
        updatedAt: currentTime,
        lastLogin: currentTime,
        loginCount: profile.loginCount || 1,
        referralCode: profile.referralCode || null,
        referredByCode: profile.referredByCode || null,
        isGuest: isGuest,
        guestId: profile.guestId || null,
        stats: profile.stats || {
          wins: 0,
          losses: 0,
          totalGames: 0,
          averageScore: 0,
          bestScore: 0,
          accuracy: 0,
        },
        xp: profile.xp || {
          solo: 0,
          duel: 0,
          tournament: 0,
        },
      };

      // Save to Firestore
      await setDoc(docRef, profileData, { merge: true });

      // Return the saved profile
      return {
        profile: {
          id: profileId,
          username: profileData.username,
          email: profileData.email,
          telegramId: profileData.telegramId,
          walletAddress: profileData.walletAddress,
          phoneNumber: profileData.phoneNumber,
          avatarUrl: profileData.avatarUrl,
          joinDate: profileData.joinDate,
          lastLogin: profileData.lastLogin,
          loginCount: profileData.loginCount,
          referralCode: profileData.referralCode,
          referredByCode: profileData.referredByCode,
          isGuest: profileData.isGuest,
          guestId: profileData.guestId,
          stats: profileData.stats,
          xp: profileData.xp,
        },
        error: null,
      };
    } catch (error) {
      console.error("Error saving profile:", error);
      return { profile: null, error };
    }
  },
};

// Game Stats Service
export const firebaseGameStatsService = {
  async saveGameStats(stats: any) {
    try {
      // Add game stats to Firestore
      const gameStatsRef = collection(db, "game_stats");

      const gameData = {
        userId: stats.userId || null,
        guestId: stats.guestId || null,
        mode: stats.mode,
        score: stats.score,
        accuracy: stats.accuracy,
        timePerRound: stats.timePerRound,
        outcome: stats.outcome,
        opponent: stats.opponent || null,
        roundDetails: stats.roundDetails || [],
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(gameStatsRef, gameData);

      // Update user XP if we have a valid user ID or guest ID
      if (stats.userId || stats.guestId) {
        try {
          // Get the user profile
          let profileDoc;

          if (stats.userId) {
            profileDoc = await getDoc(doc(db, "profiles", stats.userId));
          } else {
            const q = query(
              collection(db, "profiles"),
              where("guestId", "==", stats.guestId),
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              profileDoc = querySnapshot.docs[0];
            }
          }

          if (profileDoc && profileDoc.exists()) {
            const profileData = profileDoc.data();

            // Calculate XP to add based on game score
            const xpToAdd = Math.max(0, stats.score);

            // Get current XP values or initialize if not present
            const currentXp = profileData.xp || {
              solo: 0,
              duel: 0,
              tournament: 0,
            };

            // Update the appropriate mode's XP
            let updatedXp = { ...currentXp };
            if (stats.mode === "Solo") {
              updatedXp.solo += xpToAdd;
            } else if (stats.mode === "1v1") {
              updatedXp.duel += xpToAdd;
            } else if (stats.mode === "Tournament") {
              updatedXp.tournament += xpToAdd;
            }

            // Update the profile with new XP
            await updateDoc(doc(db, "profiles", profileDoc.id), {
              xp: updatedXp,
            });
          }
        } catch (xpErr) {
          console.error("Exception updating XP:", xpErr);
        }
      }

      return { id: docRef.id, error: null };
    } catch (err) {
      console.error("Exception saving game stats:", err);
      return { id: null, error: err };
    }
  },

  async getGameHistory(userId?: string, guestId?: string, limit: number = 20) {
    try {
      let q;
      // Ensure limit is a number and valid
      const limitValue =
        typeof limit === "number" && !isNaN(limit) && limit > 0 ? limit : 20;

      // Use the imported limit function directly
      if (userId) {
        // Use a simpler query without orderBy to avoid index requirements
        q = query(
          collection(db, "game_stats"),
          where("userId", "==", userId),
          firestoreLimit(limitValue),
        );
      } else if (guestId) {
        // Use a simpler query without orderBy to avoid index requirements
        q = query(
          collection(db, "game_stats"),
          where("guestId", "==", guestId),
          firestoreLimit(limitValue),
        );
      } else {
        return { games: [], error: "No user ID or guest ID provided" };
      }

      const querySnapshot = await getDocs(q);

      // Transform the data to match the GameRecord interface
      const games = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.createdAt
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
          mode: data.mode,
          score: data.score,
          outcome: data.outcome,
          opponent: data.opponent,
          accuracy: data.accuracy,
          timePerRound: data.timePerRound,
        };
      });

      // Sort manually since we removed orderBy from the query
      games.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return { games, error: null };
    } catch (err) {
      console.error("Exception fetching game history:", err);
      return { games: [], error: err };
    }
  },
};

// Referral Service
export const firebaseReferralService = {
  async saveReferralClick(referralCode: string) {
    try {
      // Store the referral code in localStorage for later use during signup
      localStorage.setItem("pendingReferralCode", referralCode);
    } catch (error) {
      console.error("Error saving referral click:", error);
    }
  },

  async getProfileByReferralCode(referralCode: string) {
    if (!referralCode) {
      return { profile: null, error: "No referral code provided" };
    }

    try {
      const q = query(
        collection(db, "profiles"),
        where("referralCode", "==", referralCode),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { profile: null, error: null };
      }

      const data = querySnapshot.docs[0].data();

      return { profile: data, error: null };
    } catch (error) {
      console.error("Error finding profile with referral code:", error);
      return { profile: null, error };
    }
  },

  async completeReferral(newUserId: string) {
    try {
      // Get the pending referral code from localStorage
      const referralCode = localStorage.getItem("pendingReferralCode");
      if (!referralCode) {
        return { success: false, error: "No pending referral" };
      }

      // Find the user who owns this referral code
      const { profile: referrerData, error: referrerError } =
        await this.getProfileByReferralCode(referralCode);

      if (referrerError) {
        console.error("Error finding referrer:", referrerError);
        return { success: false, error: referrerError };
      }

      if (!referrerData) {
        console.error("No referrer found with code:", referralCode);
        return { success: false, error: "Referrer not found" };
      }

      const referrerId = referrerData.id;

      // Create a record in the referrals collection
      const timestamp = new Date().toISOString();
      const referralData = {
        referralCode: referralCode,
        referrerId: referrerId,
        referredId: newUserId,
        status: "completed",
        createdAt: timestamp,
        completedAt: timestamp,
      };

      await addDoc(collection(db, "referrals"), referralData);

      // Clear the pending referral code
      localStorage.removeItem("pendingReferralCode");

      return { success: true, error: null };
    } catch (error) {
      console.error("Error completing referral:", error);
      return { success: false, error };
    }
  },

  getReferralCodeFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("ref");
  },
};

// Helper functions
function generateReferralCode() {
  // Generate a random string of 12 characters (alphanumeric)
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Level calculation moved to StatsOverview component
