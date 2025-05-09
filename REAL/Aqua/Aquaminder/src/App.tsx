import Homepage from './Homepage'
import "./App.css";
import AquariumTable from './components/AquariumTable';

function App() {
  return (
    <div className="Homepage">
      <h1 className="text-2xl font-bold text-center mt-4">AquaMinder</h1>
      {<Homepage />}
      <AquariumTable />
    </div>
  )
}

export default App
