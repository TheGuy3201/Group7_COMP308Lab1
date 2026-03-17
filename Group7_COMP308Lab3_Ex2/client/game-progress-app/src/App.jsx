import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GameProgressPage from "./GameProgressPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameProgressPage />} />
        <Route path="/progress" element={<GameProgressPage />} />
        <Route path="*" element={<GameProgressPage />} />
      </Routes>
    </BrowserRouter>
  );
}
