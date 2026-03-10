import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./AuthPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage mode="login" />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/logout" element={<AuthPage mode="logout" />} />
      </Routes>
    </BrowserRouter>
  );
}
