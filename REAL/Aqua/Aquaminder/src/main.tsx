import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Homepage from './Homepage';
import LoginRegister from './LoginRegister';
import Encyclopedia from './encyclopedia';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Encyclopedia />} />
        <Route path="/LoginRegister" element={<LoginRegister />} />
        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);