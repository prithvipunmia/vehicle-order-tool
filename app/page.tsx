"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../lib/firebase";

export default function Home() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const { app } = await import("../lib/firebase");
        setAuth(getAuth(app));
      } catch (err) {
        console.error("Firebase initialization error:", err);
        setError("Failed to initialize authentication");
      }
    };

    initFirebase();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Authentication not initialized");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/explore");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Authentication not initialized");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { getFirestore, collection, addDoc } = await import("firebase/firestore");
      const { app } = await import("../lib/firebase");

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, signupPassword);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: name,
      });

      // Store additional details in Firestore
      const db = getFirestore(app);
      const usersCollection = collection(db, "users");
      await addDoc(usersCollection, {
        uid: user.uid,
        name: name,
        email: email,
        companyName: companyName,
        location: location,
        phone: phone,
        createdAt: new Date(),
      });

      router.push("/explore");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Red Theme Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-red-800 to-red-900 flex-flex-col items-center justify-center p-8">
        <div className="text-center text-white space-y-6">
          <h1 className="text-5xl font-bold">Surya Honda</h1>
          <p className="text-2xl font-light">Consultant Portal</p>
          <div className="pt-8 border-t border-red-700">
            <p className="text-red-200 mt-8 leading-relaxed max-w-sm">
              Welcome to your exclusive portal. Manage your vehicle orders and consultations with ease.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <form
          onSubmit={isSignUp ? handleSignUp : handleLogin}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
        >
          <div>
            <div className="md:hidden text-center mb-6">
              <h2 className="text-2xl font-bold text-red-800">Surya Honda</h2>
              <p className="text-gray-600">Consultant Portal</p>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800">
              {isSignUp ? "Sign Up" : "Login"}
            </h1>
          </div>
          
          {error && (
            <div className="bg-red-200 text-red-800 p-3 rounded border border-red-400">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {isSignUp && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-red-700 placeholder-gray-400 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-red-700 placeholder-gray-400 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-red-700 placeholder-gray-400 text-gray-900"
                />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-red-700 placeholder-gray-400 text-gray-900"
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-red-700 placeholder-gray-400 text-gray-900"
            />
            <input
              type="password"
              placeholder="Password"
              value={isSignUp ? signupPassword : password}
              onChange={(e) => isSignUp ? setSignupPassword(e.target.value) : setPassword(e.target.value)}
              required
              className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-red-700 placeholder-gray-400 text-gray-900"
            />
          </div>
          
          <button
            type="submit"
            disabled={!auth || loading}
            className="bg-red-800 hover:bg-red-900 text-white px-4 py-3 rounded font-semibold w-full disabled:opacity-50 transition-colors"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-red-800 font-semibold hover:underline"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
