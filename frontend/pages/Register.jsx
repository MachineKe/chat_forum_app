import React, { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/register`, form);
      setSuccess(res.data.message + (res.data.emailToken ? " (Token: " + res.data.emailToken + ")" : ""));
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
      {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
      {success && <div className="mt-4 text-green-600 text-sm">{success}</div>}
      <div className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 underline">
          Login
        </a>
      </div>
    </AuthLayout>
  );
};

export default Register;
