import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WhatsappModule from "./WhatsappDirect/components/WhatsappModule.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WhatsappModule />} />
      </Routes>
    </BrowserRouter>
  );
}
