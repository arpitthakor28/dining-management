import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVCaUBHAa3yHpm_B1Ve2ZItrZrqPsI5vE",
  authDomain: "hkrn-a2804.firebaseapp.com",
  projectId: "hkrn-a2804",
  storageBucket: "hkrn-a2804.firebasestorage.app",
  messagingSenderId: "279307607321",
  appId: "1:279307607321:web:1e710eb2f64f57ccaef988",
  measurementId: "G-S2NTF5JC12"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (ensure we are running in browser context before firing analytics)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
