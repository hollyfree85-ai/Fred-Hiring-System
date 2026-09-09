export const firebaseConfig = {
  apiKey: "AIzaSyCoue8yF3TSjRLQQU00sqGPB11xfhI9UEY",
  authDomain: "fred-hiring-system.firebaseapp.com",
  projectId: "fred-hiring-system",
  storageBucket: "fred-hiring-system.firebasestorage.app",
  messagingSenderId: "1015711468492",
  appId: "1:1015711468492:web:1e095d676c634e53ebab69",
};

export const ownerIdentity = {
  username: "Fred",
  displayName: "Fred",
  email: "fred.owner@fred-hiring-system.app",
};

const managerEmailDomain = "staff.fred-hiring-system.app";

export function normalizeStaffUsername(value: string) {
  return value.trim().toLowerCase();
}

export function usernameToAuthEmail(value: string) {
  const username = normalizeStaffUsername(value);
  if (!/^[a-z][a-z0-9_-]{2,31}$/.test(username)) {
    throw new Error("Username must be 3–32 characters and use letters, numbers, underscores, or hyphens.");
  }
  return `${username}@${managerEmailDomain}`;
}

export function assertFirebaseConfigured() {
  if (Object.values(firebaseConfig).some((value) => value.startsWith("REPLACE_WITH_"))) {
    throw new Error("The new Firebase project has not been connected yet.");
  }
}
