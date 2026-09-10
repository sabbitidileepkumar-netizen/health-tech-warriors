import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile, saveUserProfile, getLocal } from "./dataStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null); // 'CITIZEN' | 'ASHA_WORKER' | 'HIGHER_AUTHORITY' | 'GUEST'
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage or Firebase Auth
  useEffect(() => {
    const cachedSession = localStorage.getItem("carelink_auth_session");
    if (cachedSession) {
      try {
        const parsed = JSON.parse(cachedSession);
        setUser(parsed.user);
        setUserProfile(parsed.profile);
        setRole(parsed.profile?.role || "CITIZEN");
      } catch (_e) {}
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          // Check local users array
          const allUsers = getLocal("users");
          profile = allUsers.find((u) => u.email === firebaseUser.email || u.uid === firebaseUser.uid);
          if (!profile) {
            // Default new signups without specified role to CITIZEN
            profile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
              role: "CITIZEN",
              village: "Relangi"
            };
            await saveUserProfile(firebaseUser.uid, profile);
          }
        }
        setUserProfile(profile);
        setRole(profile.role || "CITIZEN");
        localStorage.setItem(
          "carelink_auth_session",
          JSON.stringify({ user: { uid: firebaseUser.uid, email: firebaseUser.email }, profile })
        );
      } else {
        const cached = localStorage.getItem("carelink_auth_session");
        if (!cached) {
          setUser(null);
          setUserProfile(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      let profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        const allUsers = getLocal("users");
        profile = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (profile) {
          profile = { ...profile, uid: cred.user.uid };
          await saveUserProfile(cred.user.uid, profile);
        } else {
          profile = {
            uid: cred.user.uid,
            email: cred.user.email,
            name: cred.user.email.split("@")[0],
            role: "CITIZEN",
            village: "Relangi"
          };
          await saveUserProfile(cred.user.uid, profile);
        }
      }
      setUser(cred.user);
      setUserProfile(profile);
      setRole(profile.role || "CITIZEN");
      localStorage.setItem(
        "carelink_auth_session",
        JSON.stringify({ user: { uid: cred.user.uid, email: cred.user.email }, profile })
      );
      setLoading(false);
      return { success: true, profile };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signupWithEmail = async (email, password, extraData = {}) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const profile = {
        uid: cred.user.uid,
        email: cred.user.email,
        name: extraData.name || cred.user.email.split("@")[0],
        role: extraData.role || "CITIZEN",
        village: extraData.village || "Relangi",
        phone: extraData.phone || "",
        age: extraData.age || "",
        bloodGroup: extraData.bloodGroup || "O+",
        assignedAshaId: extraData.role === "CITIZEN" ? "ASHA-001" : undefined,
        assignedAshaName: extraData.role === "CITIZEN" ? "Rani Devi" : undefined,
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(cred.user.uid, profile);
      setUser(cred.user);
      setUserProfile(profile);
      setRole(profile.role);
      localStorage.setItem(
        "carelink_auth_session",
        JSON.stringify({ user: { uid: cred.user.uid, email: cred.user.email }, profile })
      );
      setLoading(false);
      return { success: true, profile };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);

      let profile = await getUserProfile(cred.user.uid);
      if (!profile) {
        profile = {
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || cred.user.email.split("@")[0],
          role: "CITIZEN",
          village: "Relangi",
          createdAt: new Date().toISOString()
        };
        await saveUserProfile(cred.user.uid, profile);
      }

      setUser(cred.user);
      setUserProfile(profile);
      setRole(profile.role || "CITIZEN");
      localStorage.setItem(
        "carelink_auth_session",
        JSON.stringify({ user: { uid: cred.user.uid, email: cred.user.email }, profile })
      );
      setLoading(false);
      return { success: true, profile };
    } catch (err) {
      setLoading(false);
      console.warn("Google login notice:", err.message);
      throw err;
    }
  };

  const loginAsGuest = () => {
    const guestUser = { uid: "guest_" + Date.now(), isAnonymous: true, email: "guest@carelink.in" };
    const guestProfile = {
      uid: guestUser.uid,
      name: "Guest Visitor",
      email: "guest@carelink.in",
      role: "GUEST",
      village: "Relangi (Default View)"
    };
    setUser(guestUser);
    setUserProfile(guestProfile);
    setRole("GUEST");
    localStorage.setItem("carelink_auth_session", JSON.stringify({ user: guestUser, profile: guestProfile }));
  };

  // Instant 1-click Demo Logins for Testing and Hackathon Evaluation
  const loginWithDemoAccount = (roleType) => {
    const allUsers = getLocal("users");
    let target = allUsers.find((u) => u.role === roleType);

    if (!target) {
      if (roleType === "CITIZEN") {
        target = {
          uid: "user_citizen_ravi",
          email: "ravi.kumar@carelink.in",
          name: "Ravi Kumar",
          role: "CITIZEN",
          village: "Relangi",
          phone: "9848022338",
          assignedAshaId: "ASHA-001",
          assignedAshaName: "Rani Devi"
        };
      } else if (roleType === "ASHA_WORKER") {
        target = {
          uid: "user_asha_rani",
          email: "asha.rani@carelink.in",
          name: "Rani Devi",
          workerId: "ASHA-001",
          role: "ASHA_WORKER",
          village: "Relangi",
          phone: "9848011223"
        };
      } else if (roleType === "PHC_STAFF") {
        target = {
          uid: "user_phc_anjali",
          email: "dr.anjali@carelink.in",
          name: "Dr. Anjali Rao",
          role: "PHC_STAFF",
          designation: "Medical Officer",
          facilityId: "tanuku-ah",
          facility: "Tanuku Government Area Hospital",
          village: "Tanuku"
        };
      } else {
        target = {
          uid: "user_authority_rao",
          email: "dr.k.v.rao@carelink.in",
          name: "Dr. K. V. Rao (DM&HO)",
          role: "HIGHER_AUTHORITY",
          designation: "District Medical & Health Officer",
          jurisdiction: "West Godavari District"
        };
      }
    }

    const demoUser = { uid: target.uid, email: target.email, displayName: target.name };
    setUser(demoUser);
    setUserProfile(target);
    setRole(target.role);
    localStorage.setItem("carelink_auth_session", JSON.stringify({ user: demoUser, profile: target }));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_e) {}
    localStorage.removeItem("carelink_auth_session");
    localStorage.removeItem("carelink_asha_auth");
    setUser(null);
    setUserProfile(null);
    setRole(null);
  };

  const sendPasswordReset = async (email) => {
    return await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        role,
        isGuest: role === "GUEST",
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginAsGuest,
        loginWithDemoAccount,
        logout,
        sendPasswordReset
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
