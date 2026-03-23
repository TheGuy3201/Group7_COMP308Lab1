import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
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

const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $email: String!, $password: String!, $role: String) {
    signup(username: $username, email: $email, password: $password, role: $role) {
      token
      user {
        userId
        username
        email
        role
        createdAt
      }
      message
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        userId
        username
        email
        role
        createdAt
      }
      message
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout($token: String) {
    logout(token: $token) {
      success
      message
    }
  }
`;

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
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "player" });
  const [error, setError] = useState("");
  const [signupMutation, { loading: signupLoading }] = useMutation(SIGNUP_MUTATION);
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION);

  const isRegister = mode === "register";
  const isLogout = mode === "logout";
  const loading = signupLoading || loginLoading || logoutLoading;

  const onChange = (name) => (event) => {
    setForm((prev) => ({ ...prev, [name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (isRegister) {
        const { data } = await signupMutation({
          variables: {
            username: form.username,
            email: form.email,
            password: form.password,
            role: form.role,
          },
        });
        storeSession(data.signup);
      } else {
        const { data } = await loginMutation({
          variables: {
            email: form.email,
            password: form.password,
          },
        });
        storeSession(data.login);
      }

      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const onLogout = async () => {
    setError("");
    const currentSession = JSON.parse(sessionStorage.getItem("jwt") || "null");

    try {
      await logoutMutation({
        variables: {
          token: currentSession?.token || "",
        },
      });
      sessionStorage.removeItem("jwt");
      navigate("/");
    } catch (logoutError) {
      setError(logoutError.message);
    }
  };

  if (isLogout) {
    return (
      <div style={baseCard}>
        <h2 style={{ marginTop: 0, marginBottom: "18px", color: "#22304d" }}>Sign out</h2>
        <p style={{ color: "#384a6a", marginBottom: "14px" }}>End your current session securely.</p>
        {error && (
          <p style={{ color: "#b42318", background: "#fef3f2", padding: "8px", borderRadius: "6px" }}>
            {error}
          </p>
        )}
        <button type="button" disabled={loading} style={submitStyle} onClick={onLogout}>
          {loading ? "Signing out..." : "Logout"}
        </button>
      </div>
    );
  }

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

        {isRegister && (
          <label style={{ display: "block", marginBottom: "12px", color: "#384a6a" }}>
            Role
            <select value={form.role} onChange={onChange("role")} style={inputStyle}>
              <option value="player">Player</option>
              <option value="admin">Admin</option>
            </select>
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
