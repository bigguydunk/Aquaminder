import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import DatabaseSearch from "./pages/DatabaseSearch";
import DiseaseDetail from "./pages/DiseaseDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/database-search" element={<DatabaseSearch />} />
        <Route path="/disease-detail" element={<DiseaseDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
