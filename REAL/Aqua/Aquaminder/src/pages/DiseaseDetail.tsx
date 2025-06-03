import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from '../../supabaseClient';
import FloatingButton from "@/components/ui/FloatingButton";
import AquaminderLogo from '../assets/Aquaminder.svg?react';
import UserActions from '../components/UserActions';
import UserMenu from '../components/UserMenu';
import Background from '../components/background';
import { Skeleton } from "@/components/ui/skeleton";
import * as RadixDialog from '@radix-ui/react-dialog';
import { ToastContext } from '@/components/ui/toast';
import React from "react";

const DiseaseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [disease, setDisease] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [akuariumOptions, setAkuariumOptions] = useState<{ akuarium_id: number }[]>([]);
  const [selectedAkuarium, setSelectedAkuarium] = useState<number | null>(null);
  const [jumlahIkanSakit, setJumlahIkanSakit] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const toastCtx = React.useContext(ToastContext);

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

  // Get the current user from Supabase Auth and fetch role from users table
  useEffect(() => {
    const getUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('username, role')
          .eq('user_id', user.id)
          .single();
        if (data && data.username) {
          setUserName(data.username);
        }
        if (data && data.role !== undefined && data.role !== null) {
          setUserRole(Number(data.role));
        }
      }
    };
    getUserAndRole();
  }, []);

  useEffect(() => {
    const fetchAkuariumData = async () => {
      const { data, error } = await supabase.from('akuarium').select('akuarium_id');
      if (!error && data) setAkuariumOptions(data);
    };
    fetchAkuariumData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const handleAddToAkuarium = async () => {
    if (!id || !selectedAkuarium) return;
    const penyakit_id = Number(id);
    if (isNaN(penyakit_id)) return;
    const jumlahTambah = parseInt(jumlahIkanSakit, 10);
    if (isNaN(jumlahTambah) || jumlahTambah <= 0) {
      toastCtx?.showToast({
        title: 'Input Error',
        description: 'Masukkan jumlah ikan sakit yang valid.',
        variant: 'error',
      });
      return;
    }
    // Get current akuarium data
    const { data: akuarium, error: errAkuarium } = await supabase
      .from('akuarium')
      .select('jumlah_ikan_sakit, jumlah_ikan_total')
      .eq('akuarium_id', selectedAkuarium)
      .single();
    if (errAkuarium || !akuarium) {
      toastCtx?.showToast({
        title: 'Error',
        description: 'Akuarium tidak ditemukan.',
        variant: 'error',
      });
      return;
    }
    const currentSick = akuarium.jumlah_ikan_sakit || 0;
    const total = akuarium.jumlah_ikan_total || 0;
    let updateSick = false;
    let newSick = currentSick;
    if (currentSick < total) {
      newSick = currentSick + jumlahTambah;
      if (newSick > total) newSick = total;
      updateSick = true;
    }
    // Always insert into akuarium_penyakit
    const { error: penyakitError } = await supabase.from('akuarium_penyakit').insert({ akuarium_id: selectedAkuarium, penyakit_id });
    if (penyakitError) {
      toastCtx?.showToast({
        title: 'Failed to add',
        description: penyakitError.message,
        variant: 'error',
      });
      return;
    }
    // Only update jumlah_ikan_sakit if not full
    if (updateSick) {
      const { error: updateError } = await supabase
        .from('akuarium')
        .update({ jumlah_ikan_sakit: newSick })
        .eq('akuarium_id', selectedAkuarium);
      if (updateError) {
        toastCtx?.showToast({
          title: 'Gagal update',
          description: updateError.message,
          variant: 'error',
        });
        return;
      }
      toastCtx?.showToast({
        title: 'Success',
        description: 'Penyakit dan jumlah ikan sakit berhasil ditambahkan!',
        variant: 'success',
      });
    } else {
      toastCtx?.showToast({
        title: 'Success',
        description: 'Penyakit berhasil ditambahkan.',
        variant: 'success',
      });
    }
    setDialogOpen(false);
    setJumlahIkanSakit("");
    setSelectedAkuarium(null);
    // Notify managers after successful addition
    try {
      await fetch('/api/notifyManagers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          akuarium_id: selectedAkuarium,
          penyakit_id,
          jumlah_ikan_sakit: jumlahTambah,
          disease_name: disease?.nama_penyakit || penyakit_id,
          added_by: userName || '-',
        }),
      });
    } catch (e) {
      // Optionally show a toast or log
      console.error('Failed to notify managers', e);
    }
  };

  const handleDelete = async () => {
    if (!disease) return;
    setLoading(true);
    let errorMsg = '';
    try {
      if (disease.gambar_url) {
        const match = disease.gambar_url.match(/penyakit-image\/(.+)$/);
        let filePath = match ? match[1] : null;
        if (filePath) {
          filePath = filePath.replace(/^\/+|^\/+/, '');
          const { error: storageError } = await supabase.storage.from('penyakit-image').remove([filePath]);
          if (storageError) errorMsg += 'Gagal hapus gambar. ';
        }
      }
      const { error: deleteError } = await supabase.from('penyakit').delete().eq('penyakit_id', disease.penyakit_id);
      if (deleteError) errorMsg += 'Gagal hapus penyakit.';
      if (!errorMsg) {
        toastCtx?.showToast({
          title: 'Penyakit berhasil dihapus.',
          variant: 'success',
        });
        navigate('/database-search');
      } else {
        toastCtx?.showToast({
          title: 'Gagal menghapus penyakit',
          description: errorMsg,
          variant: 'error',
        });
      }
    } catch (err: any) {
      toastCtx?.showToast({
        title: 'Gagal menghapus penyakit',
        description: err.message || String(err),
        variant: 'error',
      });
    }
    setLoading(false);
    setDeleteDialogOpen(false);
    setDeleteConfirmText("");
  };

  const canDelete = userRole === 1 || userRole === 2;

  return (
    <div className="min-h-screen w-screen text-gray-800">
      <header>
        <div className="w-full flex md:bg-[#56B1CA] flex-row items-center md:shadow-md justify-between pt-3 h-20 pr-6">
          <span className="ml-6 flex items-center h-12 cursor-pointer" onClick={() => navigate('/homepage') }>
            <AquaminderLogo style={{ height: '48px', width: 'auto', display: 'block' }} />
          </span>
          <div className="hidden md:block">
            <UserActions userName={userName} onLogout={handleLogout} email={user?.email} />
          </div>
          <div className="block md:hidden">
            <UserMenu userName={userName} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col min-h-screen py-0">
        <section className="flex flex-1 w-full min-h-screen flex-col md:flex-row items-start gap-2">
          {/* Disease Image */}
          <div className="relative lg:w-[25%] md:w-[35%] w-full flex flex-col h-auto md:h-full md:pl-0 pl-5 items-stretch">
            <div className="hidden md:block absolute right-[-16px] w-full md:h-full bg-[#4F8FBF] rounded-r-2xl md:rounded-b-none shadow-lg z-0" style={{ filter: 'blur(0.5px)' }} />
            <div className="hidden md:flex relative z-10 flex-col md:bg-[#26648B] md:rounded-r-xl md:rounded-b-none md:shadow md:h-full md:min-h-screen p-4 items-center justify-center">
              {loading ? (
                <div className="flex flex-col items-center w-full space-y-6">
                  <Skeleton className="w-full max-w-xs h-40 mb-4 bg-[#4F8FBF] shadow-lg" />
                </div>
              ) : disease ? (
                <>
                  {disease.gambar_url ? (
                    <img
                      src={disease.gambar_url}
                      alt="Gambar Penyakit"
                      className="w-full max-w-xs rounded-lg mb-4"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full text-center text-[#FFE3B3] italic mb-4">Foto tidak tersedia</div>
                  )}
                  {/* Add to Akuarium */}
                  <div className="flex flex-col items-center w-full mt-6">
                    <span className="text-[#FFE3B3] text-lg font-semibold mb-2">Add to akuarium?</span>
                    <RadixDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                      <RadixDialog.Trigger asChild>
                        <button className="rounded-full w-20 h-20 flex items-center justify-center !bg-[#FFE3B3] text-[#26648B] text-5xl font-bold shadow-lg hover:bg-[#FFD580] transition-colors duration-150 focus:outline-none">
                          +
                        </button>
                      </RadixDialog.Trigger>
                      <RadixDialog.Portal>
                        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 !bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                          <RadixDialog.Close asChild>
                            <button className="absolute top-4 right-4 text-[#26648B] text-2xl font-bold !bg-transparent !border-none cursor-pointer" title="Close" type="button">×</button>
                          </RadixDialog.Close>
                          <h2 className="text-xl font-bold mb-4 text-[#26648B]">Tambah Penyakit ke Akuarium</h2>
                          <div className="w-full flex flex-col gap-4">
                            <label className="text-[#26648B] font-semibold">Pilih Akuarium</label>
                            <select
                              className="w-full px-4 py-2 rounded-lg border border-[#26648B] focus:outline-none !bg-[#FFE3B3] text-[#26648B]"
                              value={selectedAkuarium ?? ''}
                              onChange={e => setSelectedAkuarium(Number(e.target.value) || null)}
                            >
                              {selectedAkuarium === null && (
                                <option value="" disabled hidden>Pilih Akuarium</option>
                              )}
                              {akuariumOptions.map(option => (
                                <option key={option.akuarium_id} value={option.akuarium_id} className="!bg-[#FFE3B3] text-[#26648B]">
                                  Akuarium {option.akuarium_id}
                                </option>
                              ))}
                            </select>
                            <label className="text-[#26648B] font-semibold mt-2">Berapa ikan yang sakit?</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-4 py-2 !rounded-lg !border !border-[#26648B] text-[#26648B] focus:outline-none"
                              placeholder="Masukkan jumlah ikan sakit"
                              value={jumlahIkanSakit}
                              onChange={e => setJumlahIkanSakit(e.target.value)}
                            />
                            <button
                              className="mt-4 w-full px-4 py-2 rounded-lg !bg-[#26648B] text-[#FFE3B3] font-bold hover:!bg-[#4F8FBF] transition-colors"
                              onClick={handleAddToAkuarium}
                              disabled={!selectedAkuarium || !jumlahIkanSakit}
                            >
                              Simpan
                            </button>
                          </div>
                        </RadixDialog.Content>
                      </RadixDialog.Portal>
                    </RadixDialog.Root>
                  </div>
                </>
              ) : (
                <div className="text-[#FFE3B3] text-xl">No Image</div>
              )}
            </div>
          </div>
          {/* Disease Details */}
          <div className="w-full flex flex-col items-start md:overflow-y-auto md:pl-10 lg:pt-15 md:h-screen md:max-h-screen md:min-h-screen">
            <div className="w-full px-0 max-w-[1000px] md:px-0 mb-0">
              <button onClick={() => navigate(-1)} className=" hidden text-xl mb-4 text-[#34e7ff] absolute top-24 left-4 md:static md:mb-6 md:mt-6">
                ←
              </button>
              <div className="w-full z-10 text-[#26648B] rounded-xl overflow-hidden text-left mt-0 p-6">
                {loading ? (
                  <>
                    <Skeleton className="w-2/3 h-10 mb-6 bg-[#26648B]" />
                    <div className="block md:hidden w-full mb-6">
                      <Skeleton className="w-full max-w-xs h-40 bg-[#26648B]" />
                    </div>
                    <div className="space-y-6">
                      <Skeleton className="w-full h-16 bg-[#FFE3B3]" />
                      <Skeleton className="w-full h-12 bg-[#FFE3B3]" />
                      <Skeleton className="w-full h-12 bg-[#FFE3B3]" />
                      <Skeleton className="w-full h-12 bg-[#FFE3B3]" />
                    </div>
                  </>
                ) : disease ? (
                  <>
                    <h2 className="text-4xl font-bold mb-4 mt-2 ">{disease.nama_penyakit}</h2>
                    <div className="block md:hidden w-full mb-4">
                      {disease.gambar_url ? (
                        <img
                          src={disease.gambar_url}
                          alt="Gambar Penyakit"
                          className="max-w-xs rounded-lg mx-auto mb-2"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="w-full text-center text-[#26648B] italic mb-2">Foto tidak tersedia</div>
                      )}
                      <div className="flex flex-col items-center w-full px-4">
                        <RadixDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                          <RadixDialog.Trigger asChild>
                            <button className="rounded-full w-14 h-14 flex items-center justify-center !bg-[#26648B] text-[#FFE3B3] text-4xl font-bold shadow-lg hover:bg-[#FFD580] transition-colors duration-150 focus:outline-none mt-2">
                              +
                            </button>
                          </RadixDialog.Trigger>
                          <RadixDialog.Portal>
                            <RadixDialog.Overlay className="fixed inset-0 !bg-black/50 z-50" />
                            <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 !bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                              <RadixDialog.Close asChild>
                                <button className="absolute -top-1 -right-1 text-[#26648B] text-2xl font-bold !bg-transparent border-none cursor-pointer" title="Close" type="button">×</button>
                              </RadixDialog.Close>
                              <h2 className="text-xl font-bold mb-4 text-[#26648B]">Tambah Penyakit ke Akuarium</h2>
                              <div className="w-full flex flex-col gap-4">
                                <label className="text-[#26648B] font-semibold">Pilih Akuarium</label>
                                <select
                                  className="w-full px-4 py-2 rounded-lg border border-[#26648B] focus:outline-none !bg-[#FFE3B3] text-[#26648B]"
                                  value={selectedAkuarium ?? ''}
                                  onChange={e => setSelectedAkuarium(Number(e.target.value) || null)}
                                >
                                  {selectedAkuarium === null && (
                                    <option value="" disabled hidden>Pilih Akuarium</option>
                                  )}
                                  {akuariumOptions.map(option => (
                                    <option key={option.akuarium_id} value={option.akuarium_id} className="!bg-[#FFE3B3] text-[#26648B]">
                                      Akuarium {option.akuarium_id}
                                    </option>
                                  ))}
                                </select>
                                <label className="text-[#26648B] font-semibold mt-2">Berapa ikan yang sakit?</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="w-full px-4 py-2 !rounded-lg border !border-[#26648B] text-[#26648B] focus:outline-none"
                                  placeholder="Masukkan jumlah ikan sakit"
                                  value={jumlahIkanSakit}
                                  onChange={e => setJumlahIkanSakit(e.target.value)}
                                />
                                <button
                                  className="mt-4 w-full px-4 py-2 rounded-lg !bg-[#26648B] text-[#FFE3B3] font-bold hover:!bg-[#4F8FBF] transition-colors"
                                  onClick={handleAddToAkuarium}
                                  disabled={!selectedAkuarium || !jumlahIkanSakit}
                                >
                                  Simpan
                                </button>
                              </div>
                            </RadixDialog.Content>
                          </RadixDialog.Portal>
                        </RadixDialog.Root>
                        <span
                          className="mt-2 text-[#26648B] font-semibold max-w-[180px] text-base sm:text-lg md:text-xl text-center truncate whitespace-normal break-words leading-tight"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          Add to akuarium?
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {disease.deskripsi && (
                        <div>
                          <h3 className="font-semibold text-xl">Description</h3>
                          <p className="bg-[#FFE3B3] p-2 rounded-lg text-left shadow-lg">{disease.deskripsi}</p>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-xl">Symptoms</h3>
                        <p className="bg-[#FFE3B3] p-2 rounded-lg text-left shadow-lg">{disease.gejala || '-'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">Causes</h3>
                        <p className="bg-[#FFE3B3] p-2 rounded-lg text-left shadow-lg">{disease.penyebab || '-'}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-xl">Treatment & Medication</h3>
                        <p className="bg-[#FFE3B3] p-2 rounded-lg text-left shadow-lg">{disease.pengobatan || '-'}</p>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 mt-4">
                      {canDelete && (
                        <button
                          className="px-4 py-2 rounded-lg !bg-red-500 text-white font-bold hover:!bg-red-700 transition-colors"
                          onClick={() => setDeleteDialogOpen(true)}
                          disabled={loading}
                        >
                          Hapus Penyakit
                        </button>
                      )}
                    </div>
                    <RadixDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <RadixDialog.Portal>
                        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                          <RadixDialog.Title className="text-lg font-bold mb-2 text-[#26648B]">Hapus Penyakit</RadixDialog.Title>
                          <RadixDialog.Description className="mb-4 text-[#26648B] text-center">
                            Ketik <span className="font-mono font-bold">{disease?.nama_penyakit || 'nama penyakit'}</span> untuk konfirmasi penghapusan penyakit ini.
                          </RadixDialog.Description>
                          <input
                            className="w-full px-3 py-2 rounded-lg border border-[#26648B] mb-2 text-center"
                            value={deleteConfirmText}
                            onChange={e => setDeleteConfirmText(e.target.value)}
                            placeholder={`Ketik ${disease?.nama_penyakit || 'nama penyakit'} untuk konfirmasi`}
                            autoFocus
                            disabled={loading}
                          />
                          <div className="flex gap-4 justify-center mt-2">
                            <button
                              className={`px-4 py-2 !bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none ${loading || deleteConfirmText !== disease?.nama_penyakit ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                              onClick={handleDelete}
                              disabled={loading || deleteConfirmText !== disease?.nama_penyakit}
                            >
                              {loading ? 'Menghapus...' : 'Hapus'}
                            </button>
                            <RadixDialog.Close asChild>
                              <button className="px-4 py-2 !bg-[#FFE3B3] text-black rounded hover:bg-gray-300 focus:outline-none">Batal</button>
                            </RadixDialog.Close>
                          </div>
                        </RadixDialog.Content>
                      </RadixDialog.Portal>
                    </RadixDialog.Root>
                  </>
                ) : (
                  <div className="mt-8 text-2xl">Disease not found.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingButton />
      <Background />
    </div>
  );
};

export default DiseaseDetail;
