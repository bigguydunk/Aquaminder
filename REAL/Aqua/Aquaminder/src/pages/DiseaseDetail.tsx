import React from "react";
import { useNavigate } from "react-router-dom";

const DiseaseDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#28D0FF] to-[#88D7FF] text-gray-800">
      <main className="p-4">
        <button onClick={() => navigate(-1)} className="text-xl mb-4 text-[#34e7ff] absolute top-4 left-4">
          ←
        </button>
        
        <h2 className="text-lg font-bold mb-4 mt-8">Iridovirus Dwarf Gourami Disease</h2>
        
        <div className="mb-4">
          <img
            src="https://via.placeholder.com/300x150"
            alt="Gambar Penyakit"
            className="w-full rounded-lg mb-4"
          />
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Specialty</h3>
              <p className="bg-gray-200 p-2 rounded">Aquarium disease</p>
            </div>
            <div>
              <h3 className="font-semibold">Symptoms</h3>
              <p className="bg-gray-200 p-2 rounded">
                Loss of colour, loss of appetite and deterioration of muscle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Complications</h3>
              <p className="bg-gray-200 p-2 rounded">Necrosis of the kidney and spleen</p>
            </div>
            <div>
              <h3 className="font-semibold">Usual onset</h3>
              <p className="bg-gray-200 p-2 rounded">1 day–6 months post exposure</p>
            </div>
            <div>
              <h3 className="font-semibold">Causes</h3>
              <p className="bg-gray-200 p-2 rounded">
                Megalocytivirus likened by inbreeding
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Risk factors</h3>
              <p className="bg-gray-200 p-2 rounded">
                Highly infectious amongst Gourami
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Diagnostic method</h3>
              <p className="bg-gray-200 p-2 rounded">Observation of symptoms</p>
            </div>
            <div>
              <h3 className="font-semibold">Prevention</h3>
              <p className="bg-gray-200 p-2 rounded">
                Obtaining Dwarf gourami from reputable sources, keeping them in a low-stress
                environment. Once infected, avoid adding any gourami to the aquarium for a period
                of three months.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Treatment & Medication</h3>
              <p className="bg-gray-200 p-2 rounded">None, always fatal</p>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed bottom-4 right-4 flex flex-col items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
          title="Home"
        >
          🏠
        </button>
        <button
          onClick={() => navigate("/database-search")}
          className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
          title="D-Database"
        >
          📝
        </button>
        <button
          onClick={() => navigate("/foodstock")}
          className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
          title="Foodstock"
        >
          🐟
        </button>
      </div>
    </div>
  );
};

export default DiseaseDetail;
