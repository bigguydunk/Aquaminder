import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import DatabaseSearch from "./pages/DatabaseSearch";
import DiseaseDetail from "./pages/DiseaseDetail";
import LoginRegister from "./LoginRegister";
import { ToastProviderWithContext } from '@/components/ui/toast';

function App() {
  return (
    <ToastProviderWithContext>
      <Router>
        <Routes>
          <Route path="/" element={<LoginRegister/>} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/database-search" element={<DatabaseSearch />} />
          <Route path="/disease-detail" element={<DiseaseDetail />} />
        </Routes>
      </Router>
    </ToastProviderWithContext>
  );
}

export default App;
