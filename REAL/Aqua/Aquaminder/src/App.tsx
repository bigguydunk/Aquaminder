import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./Homepage";
import DatabaseSearch from "./pages/DatabaseSearch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/database-search" element={<DatabaseSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
