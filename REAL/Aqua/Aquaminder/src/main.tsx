import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Homepage from './Homepage';
import LoginRegister from './LoginRegister';
import Background from './components/background';
import { Home } from 'lucide-react';
/*import LoginRegister from './LoginRegister';*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister/>} />
        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);