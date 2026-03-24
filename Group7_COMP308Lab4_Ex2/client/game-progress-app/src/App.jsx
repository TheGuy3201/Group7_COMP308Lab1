import React from "react";
import { BrowserRouter, Route, Routes, useInRouterContext } from "react-router-dom";
import GameProgressPage from "./GameProgressPage.jsx";

function ProgressRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GameProgressPage />} />
      <Route path="/progress" element={<GameProgressPage />} />
      <Route path="*" element={<GameProgressPage />} />
    </Routes>
  );
}

export default function App() {
  const inRouterContext = useInRouterContext();

  if (inRouterContext) {
    return <ProgressRoutes />;
  }

  return (
    <BrowserRouter>
      <ProgressRoutes />
    </BrowserRouter>
  );
}
