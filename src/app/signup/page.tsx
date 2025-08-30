"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    const res = await fetch("http://localhost:4000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Signup successful!");
    
      router.push("/login");
    } else {
      alert(data.error || "Signup failed");
    }
  } catch (err) {
    alert("Network error");
  }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Signup</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-btn">
          Signup
        </button>
      </form>
      <button
        className="signup-link"
        onClick={() => router.push("/login")}
      >
        Go to Login
      </button>
    </div>
  );
}