import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from '../../supabaseClient';
import FloatingButton from "@/components/ui/FloatingButton";

const DiseaseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [disease, setDisease] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisease = async () => {
      setLoading(true);
      const penyakitId = Number(id);
      if (isNaN(penyakitId)) {
        setDisease(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('penyakit')
        .select('*')
        .eq('penyakit_id', penyakitId)
        .single();
      if (!error && data) {
        setDisease(data);
      } else {
        setDisease(null);
      }
      setLoading(false);
    };
    if (id) fetchDisease();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#28D0FF] to-[#88D7FF] text-gray-800 w-full flex flex-col items-start">
      <main className="p-4 w-full text-left">
        <button onClick={() => navigate(-1)} className="text-xl mb-4 text-[#34e7ff] absolute top-4 left-4">
          ←
        </button>
        {loading ? (
          <div className="mt-8 text-2xl">Loading...</div>
        ) : disease ? (
          <>
            <h2 className="text-lg font-bold mb-4 mt-8">{disease.nama_penyakit}</h2>
            <div className="mb-4">
              {/* Placeholder image, replace with actual if available */}
              <img
                src="https://via.placeholder.com/300x150"
                alt="Gambar Penyakit"
                className="w-full max-w-md rounded-lg mb-4"
                style={{ objectFit: 'cover' }}
              />
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Symptoms</h3>
                  <p className="bg-gray-200 p-2 rounded text-left">{disease.gejala || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Causes</h3>
                  <p className="bg-gray-200 p-2 rounded text-left">{disease.penyebab || '-'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Treatment & Medication</h3>
                  <p className="bg-gray-200 p-2 rounded text-left">{disease.pengobatan || '-'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8 text-2xl">Disease not found.</div>
        )}
      </main>
      <FloatingButton />
    </div>
  );
};

export default DiseaseDetail;
