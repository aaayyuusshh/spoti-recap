import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.tsx'
import { PrivacyPolicy } from './PrivacyPolicy';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/callback" element={<App />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
