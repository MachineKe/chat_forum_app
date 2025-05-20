import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      // Store user info in localStorage for use in forum posting
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/forum");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {/* Toggle for LDAP login will go here */}
        <Button type="submit">Login</Button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <div className="mt-4 text-sm text-center">
        Don't have an account? <a href="/register" className="text-blue-600 underline">Register</a>
      </div>
    </AuthLayout>
  );
};

export default Login;
