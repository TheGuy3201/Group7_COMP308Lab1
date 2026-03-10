import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const baseCard = {
  maxWidth: 460,
  margin: "32px auto",
  padding: "24px",
  borderRadius: "14px",
  border: "1px solid #d4d7de",
  background: "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
  boxShadow: "0 10px 30px rgba(24, 39, 75, 0.08)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginTop: "6px",
  borderRadius: "8px",
  border: "1px solid #c7cdd8",
  fontSize: "14px",
};

const submitStyle = {
  width: "100%",
  marginTop: "16px",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: "#0b5fff",
  fontWeight: 600,
};

const endpointBase = import.meta.env.VITE_AUTH_API_BASE || "http://localhost:4002";

const storeSession = (authResult) => {
  const sessionPayload = {
    token: authResult.token,
    user: authResult.user,
    message: authResult.message || "Authentication successful",
  };

  sessionStorage.setItem("jwt", JSON.stringify(sessionPayload));
};

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const onChange = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const response = await fetch(`${endpointBase}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Authentication request failed");
      }

      storeSession(data);
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={baseCard}>
      <h2 style={{ marginTop: 0, marginBottom: "18px", color: "#22304d" }}>
        {isRegister ? "Create account" : "Sign in"}
      </h2>

      <form onSubmit={onSubmit}>
        {isRegister && (
          <label style={{ display: "block", marginBottom: "12px", color: "#384a6a" }}>
            Username
            <input
              type="text"
              value={form.username}
              onChange={onChange("username")}
              required
              style={inputStyle}
            />
          </label>
        )}

        <label style={{ display: "block", marginBottom: "12px", color: "#384a6a" }}>
          Email
          <input
            type="email"
            value={form.email}
            onChange={onChange("email")}
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: "block", marginBottom: "12px", color: "#384a6a" }}>
          Password
          <input
            type="password"
            value={form.password}
            onChange={onChange("password")}
            required
            style={inputStyle}
          />
        </label>

        {error && (
          <p style={{ color: "#b42318", background: "#fef3f2", padding: "8px", borderRadius: "6px" }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} style={submitStyle}>
          {loading ? "Submitting..." : isRegister ? "Register" : "Login"}
        </button>
      </form>
    </div>
  );
}
