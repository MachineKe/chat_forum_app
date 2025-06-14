import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "@layouts/AuthLayout";
import Input from "@components/layout/Input";
import Button from "@components/layout/Button";
import { useAuth } from "@hooks/useAuth.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed");
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
        <Button type="submit" className="w-full py-3 text-base font-semibold">Login</Button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
      <div className="mt-4 text-sm text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 underline">
          Register
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
