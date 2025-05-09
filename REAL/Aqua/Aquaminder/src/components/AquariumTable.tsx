// src/components/TabelAkuarium.tsx

import { useEffect, useState } from "react";
import  supabase  from "../../supabaseClient";
import { Database } from "../../types/supabase";

type Akuarium = Database["public"]["Tables"]["akuarium"]["Row"];

const AquariumTable = () => {
  const [aquariums, setAquariums] = useState<Akuarium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persentaseSakit, setPersentaseSakit] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase.from("akuarium").select("*");
        if (error) throw error;
        setAquariums(data || []);
        const jumlahIkanSakit = data.reduce((acc, curr) => acc + curr.jumlah_ikan_sakit, 0);
        const jumlahIkanTotal = data.reduce((acc, curr) => acc + curr.jumlah_ikan_total, 0);
        const persentaseSakit = (jumlahIkanSakit / jumlahIkanTotal) * 100;
        setPersentaseSakit(persentaseSakit);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Akuarium ID</th>
            <th>Penyakit ID</th>
            <th>Jumlah Ikan Sakit</th>
            <th>Jumlah Ikan Total</th>
            {/* Add other columns as needed */}
          </tr>
        </thead>
        <tbody>
          {aquariums.map((row) => (
            <tr key={row.akuarium_id}>
              <td>{row.akuarium_id}</td>
              <td>{row.penyakit_id}</td>
              <td>{row.jumlah_ikan_sakit}</td>
              <td>{row.jumlah_ikan_total}</td>
              {/* Map other fields */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AquariumTable;
