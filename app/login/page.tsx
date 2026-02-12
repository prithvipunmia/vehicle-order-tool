// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize Firebase only on the client
    const initFirebase = async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const { app } = await import("../../lib/firebase");
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
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold">Login</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full" />
        <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 w-full" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" />
        <button type="submit" disabled={!auth} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">Login</button>
      </form>
    </main>
  );
}
export default LoginPage;