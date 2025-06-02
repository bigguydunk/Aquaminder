import { useEffect, useState } from 'react';
import Background from './components/background';
import UserMenu from './components/UserMenu';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import AquaminderLogo from './assets/Aquaminder.svg?react';
import UserActions from './components/UserActions';
import FloatingButton from './components/ui/FloatingButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './components/ui/dialog';
import { Button } from './components/ui/button';

function SettingsPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [changeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jumlahIkanTotal, setJumlahIkanTotal] = useState('');
  const [tugasName, setTugasName] = useState('');
  const [addingAquarium, setAddingAquarium] = useState(false);
  const [addingTugas, setAddingTugas] = useState(false);
  const [addAquariumError, setAddAquariumError] = useState<string | null>(null);
  const [addTugasError, setAddTugasError] = useState<string | null>(null);
  const [aquariumList, setAquariumList] = useState<Array<{ akuarium_id: number, jumlah_ikan_total: number, jumlah_ikan_sakit: number }>>([]);
  const [tugasList, setTugasList] = useState<Array<{ tugas_id: number, deskripsi_tugas: string | null }>>([]);
  const [loadingAquarium, setLoadingAquarium] = useState(false);
  const [loadingTugas, setLoadingTugas] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAquarium, setDeletingAquarium] = useState(false);
  const [deleteTugasDialogOpen, setDeleteTugasDialogOpen] = useState<number | null>(null);
  const [deleteTugasConfirmText, setDeleteTugasConfirmText] = useState('');
  const [deletingTugas, setDeletingTugas] = useState(false);
  // Add userRole state
  const [userRole, setUserRole] = useState<number | null>(null);

  useEffect(() => {
    const getUser = async () => {
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
        if (data && typeof data.role === 'number') {
          setUserRole(data.role);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setChanging(true);
    setError(null);
    if (!newUsername.trim()) {
      setError('Username cannot be empty.');
      setChanging(false);
      return;
    }
    if (!user) {
      setError('User not found.');
      setChanging(false);
      return;
    }
    const { error: updateError } = await supabase
      .from('users')
      .update({ username: newUsername.trim() })
      .eq('user_id', user.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setUserName(newUsername.trim());
      setChangeUsernameOpen(false);
      setNewUsername('');
    }
    setChanging(false);
  };

  // Fetch aquarium list when component mounts
  useEffect(() => {
    setLoadingAquarium(true);
    supabase.from('akuarium').select('akuarium_id, jumlah_ikan_total, jumlah_ikan_sakit').then(({ data }) => {
      setAquariumList(data || []);
      setLoadingAquarium(false);
    });
  }, []);

  // Fetch tugas list when component mounts
  useEffect(() => {
    setLoadingTugas(true);
    supabase.from('tugas').select('tugas_id, deskripsi_tugas').then(({ data }) => {
      setTugasList(data || []);
      setLoadingTugas(false);
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col">
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
      <FloatingButton />
      <main className="flex-1 w-full flex flex-col min-h-screen py-0">
        <section className="flex flex-col items-center w-full min-h-screen gap-8 py-8 px-4 md:px-0">
          {/* Account Settings Box - match width of below boxes */}
          <div className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 w-full max-w-6xl text-[#26648B] flex flex-col items-start relative min-h-[180px] md:min-h-0">
            <div className="font-semibold mb-2 text-lg">Account</div>
            <div className="mb-2 flex flex-row items-center gap-2">
              <div>Nama: <span className="font-bold">{userName || '-'}</span></div>
              <Button size="sm" className="!bg-[#4F8FBF] !text-[#FFE3B3] hover:!bg-[#26648B] px-2 py-1 text-xs h-7 min-w-0" onClick={() => { setChangeUsernameOpen(true); setNewUsername(userName || ''); }}>Ubah</Button>
            </div>
            <div className="flex items-center w-full min-w-0 mb-2">
              <span>Email: </span>
              <span className="font-bold ml-1 truncate min-w-0 max-w-[200px] md:max-w-xs" title={user?.email || '-'}
              >
                {user?.email || '-'}
              </span>
            </div>
            <div className="flex w-full" style={{ minHeight: 0 }}>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 !shadow-lg rounded-lg !bg-red-400 text-white max-w-[200px] !text-sm font-bold hover:!bg-red-500 transition absolute right-6 bottom-6 md:right-6 md:bottom-6"
                style={{ position: 'absolute', right: '1.5rem', bottom: '0.5rem' }}
              >
                Log out
              </button>
            </div>
          </div>
          {/* Aquarium and Tugas side by side, only for role 1 or 2 */}
          {(userRole === 1 || userRole === 2) && (
            <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8 justify-center">
              {/* Aquarium Box */}
              <div className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 w-full md:w-1/2 max-w-2xl text-[#26648B]">
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-2xl font-bold mb-4">Aquarium List</h3>
                  <div className="w-full max-w-md mb-6">
                    {loadingAquarium ? (
                      <div className="text-center text-[#26648B]">Loading...</div>
                    ) : aquariumList.length === 0 ? (
                      <div className="text-center text-[#26648B]">No aquarium found.</div>
                    ) : (
                      <ul className="divide-y divide-[#26648B]/20">
                        {aquariumList.map(aq => (
                          <li key={aq.akuarium_id} className="flex items-center justify-between py-2 px-2 group relative">
                            <div>
                              <span className="font-semibold">ID: {aq.akuarium_id}</span> - Total: {aq.jumlah_ikan_total}, Sakit: {aq.jumlah_ikan_sakit}
                            </div>
                            <button
                              className="absolute right-2 top-1 text-red-500 hover:text-red-700 text-lg font-bold !bg-transparent border-none cursor-pointer z-20"
                              title="Delete aquarium"
                              type="button"
                              onClick={() => { setDeleteDialogOpen(aq.akuarium_id); setDeleteConfirmText(''); }}
                            >
                              ×
                            </button>
                            {/* Delete confirmation dialog using app's Dialog components */}
                            <Dialog open={deleteDialogOpen === aq.akuarium_id} onOpenChange={open => { if (!open) setDeleteDialogOpen(null); }}>
                              <DialogContent className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-bold mb-2 text-[#26648B]">Delete Aquarium</DialogTitle>
                                  <DialogDescription className="mb-4 text-[#26648B] text-center">
                                    Ketik <span className="font-mono font-bold">DELETE</span> untuk mengkonfirmasi penghapusan aquarium <span className="font-semibold">{aq.akuarium_id}</span>.
                                  </DialogDescription>
                                </DialogHeader>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-[#26648B] mb-2 text-center"
                                  value={deleteConfirmText}
                                  onChange={e => setDeleteConfirmText(e.target.value)}
                                  placeholder="Ketik DELETE untuk mengkonfirmasi"
                                  autoFocus
                                  disabled={deletingAquarium}
                                />
                                <div className="flex gap-4 justify-center mt-2">
                                  <Button
                                    className="px-4 py-2 !bg-red-600 text-white rounded hover:!bg-red-700 focus:outline-none"
                                    onClick={async () => {
                                      if (deleteConfirmText !== 'DELETE') return;
                                      setDeletingAquarium(true);
                                      const { error } = await supabase.from('akuarium').delete().eq('akuarium_id', aq.akuarium_id);
                                      setDeletingAquarium(false);
                                      setDeleteDialogOpen(null);
                                      setDeleteConfirmText('');
                                      if (!error) {
                                        setAquariumList(list => list.filter(item => item.akuarium_id !== aq.akuarium_id));
                                      } else {
                                        alert('Failed to delete aquarium: ' + error.message);
                                      }
                                    }}
                                    disabled={deletingAquarium || deleteConfirmText !== 'DELETE'}
                                  >
                                    {deletingAquarium ? 'Deleting...' : 'Delete'}
                                  </Button>
                                  <DialogClose asChild>
                                    <Button className="px-4 py-2 !bg-[#FFE3B3] text-black rounded hover:!bg-gray-300 focus:outline-none">Cancel</Button>
                                  </DialogClose>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Add Aquarium</h3>
                  <form
                    className="w-full max-w-md flex flex-col gap-4 mb-4"
                    onSubmit={async e => {
                      e.preventDefault();
                      setAddingAquarium(true);
                      setAddAquariumError(null);
                      if (!jumlahIkanTotal) {
                        setAddAquariumError('Jumlah Ikan Total harus diisi');
                        setAddingAquarium(false);
                        return;
                      }
                      const jumlahTotal = parseInt(jumlahIkanTotal, 10);
                      const { error } = await supabase.from('akuarium').insert({ jumlah_ikan_total: jumlahTotal, jumlah_ikan_sakit: 0 });
                      if (error) {
                        setAddAquariumError(error.message);
                      } else {
                        setJumlahIkanTotal('');
                        setLoadingAquarium(true);
                        const { data } = await supabase.from('akuarium').select('akuarium_id, jumlah_ikan_total, jumlah_ikan_sakit');
                        setAquariumList(data || []);
                        setLoadingAquarium(false);
                      }
                      setAddingAquarium(false);
                    }}
                  >
                    <div>
                      <label className="block font-semibold mb-1">Jumlah ikan yang ada dalam aquarium</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-[#26648B] focus:outline-none"
                        placeholder="Jumlah Ikan Total"
                        value={jumlahIkanTotal}
                        onChange={e => setJumlahIkanTotal(e.target.value)}
                        min={1}
                        required
                      />
                    </div>
                    {addAquariumError && <div className="text-red-600 text-sm">{addAquariumError}</div>}
                    <Button type="submit" className="!bg-[#4F8FBF] !text-[#FFE3B3] hover:!bg-[#26648B]" disabled={addingAquarium}>
                      {addingAquarium ? 'Adding...' : 'Add Aquarium'}
                    </Button>
                  </form>
                </div>
              </div>
              {/* Tugas Box */}
              <div className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 w-full md:w-1/2 max-w-2xl text-[#26648B]">
                <div className="flex flex-col items-center w-full">
                  <h3 className="text-2xl font-bold mb-4">Tugas List</h3>
                  <div className="w-full max-w-md mb-6">
                    {loadingTugas ? (
                      <div className="text-center text-[#26648B]">Loading...</div>
                    ) : tugasList.length === 0 ? (
                      <div className="text-center text-[#26648B]">No tugas found.</div>
                    ) : (
                      <ul className="divide-y divide-[#26648B]/20">
                        {tugasList.map(tg => (
                          <li key={tg.tugas_id} className="flex items-center justify-between py-2 px-2 group relative">
                            <div>
                              <span className="font-semibold">ID: {tg.tugas_id}</span> - {tg.deskripsi_tugas}
                            </div>
                            <button
                              className="absolute right-2 top-1 text-red-500 hover:text-red-700 text-lg font-bold !bg-transparent border-none cursor-pointer z-20"
                              title="Delete tugas"
                              type="button"
                              onClick={() => { setDeleteTugasDialogOpen(tg.tugas_id); setDeleteTugasConfirmText(''); }}
                            >
                              ×
                            </button>
                            <Dialog open={deleteTugasDialogOpen === tg.tugas_id} onOpenChange={open => { if (!open) setDeleteTugasDialogOpen(null); }}>
                              <DialogContent className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-bold mb-2 text-[#26648B]">Delete Tugas</DialogTitle>
                                  <DialogDescription className="mb-4 text-[#26648B] text-center">
                                    Ketik <span className="font-mono font-bold">DELETE</span> untuk mengkonfirmasi penghapusan tugas <span className="font-semibold">{tg.deskripsi_tugas}</span>.
                                  </DialogDescription>
                                </DialogHeader>
                                <input
                                  className="w-full px-3 py-2 rounded-lg border border-[#26648B] mb-2 text-center"
                                  value={deleteTugasConfirmText}
                                  onChange={e => setDeleteTugasConfirmText(e.target.value)}
                                  placeholder="Ketik DELETE untuk mengkonfirmasi"
                                  autoFocus
                                  disabled={deletingTugas}
                                />
                                <div className="flex gap-4 justify-center mt-2">
                                  <Button
                                    className="px-4 py-2 !bg-red-600 text-white rounded hover:!bg-red-700 focus:outline-none"
                                    onClick={async () => {
                                      if (deleteTugasConfirmText !== 'DELETE') return;
                                      setDeletingTugas(true);
                                      const { error } = await supabase.from('tugas').delete().eq('tugas_id', tg.tugas_id);
                                      setDeletingTugas(false);
                                      setDeleteTugasDialogOpen(null);
                                      setDeleteTugasConfirmText('');
                                      if (!error) {
                                        setTugasList(list => list.filter(item => item.tugas_id !== tg.tugas_id));
                                      } else {
                                        alert('Failed to delete tugas: ' + error.message);
                                      }
                                    }}
                                    disabled={deletingTugas || deleteTugasConfirmText !== 'DELETE'}
                                  >
                                    {deletingTugas ? 'Deleting...' : 'Delete'}
                                  </Button>
                                  <DialogClose asChild>
                                    <Button className="px-4 py-2 !bg-[#FFE3B3] text-black rounded hover:!bg-gray-300 focus:outline-none">Cancel</Button>
                                  </DialogClose>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Add Tugas</h3>
                  <form
                    className="w-full max-w-md flex flex-col gap-4 mb-4"
                    onSubmit={async e => {
                      e.preventDefault();
                      setAddingTugas(true);
                      setAddTugasError(null);
                      if (!tugasName.trim()) {
                        setAddTugasError('Nama tugas harus diisi');
                        setAddingTugas(false);
                        return;
                      }
                      const { error } = await supabase.from('tugas').insert({ deskripsi_tugas: tugasName.trim() });
                      if (error) {
                        setAddTugasError(error.message);
                      } else {
                        setTugasName('');
                        setLoadingTugas(true);
                        const { data } = await supabase.from('tugas').select('tugas_id, deskripsi_tugas');
                        setTugasList(data || []);
                        setLoadingTugas(false);
                      }
                      setAddingTugas(false);
                    }}
                  >
                    <div>
                      <label className="block font-semibold mb-1">Nama Tugas</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-[#26648B] focus:outline-none"
                        placeholder="Deskripsi Tugas"
                        value={tugasName}
                        onChange={e => setTugasName(e.target.value)}
                        required
                      />
                    </div>
                    {addTugasError && <div className="text-red-600 text-sm">{addTugasError}</div>}
                    <Button type="submit" className="!bg-[#4F8FBF] !text-[#FFE3B3] hover:!bg-[#26648B]" disabled={addingTugas}>
                      {addingTugas ? 'Adding...' : 'Add Tugas'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Dialog open={changeUsernameOpen} onOpenChange={setChangeUsernameOpen}>
        <DialogContent className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold mb-2 text-[#26648B]">Ubah Nama Pengguna</DialogTitle>
            <DialogDescription className="mb-4 text-[#26648B]">
              Masukkan nama pengguna baru Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangeUsername}>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#26648B] mb-4 focus:outline-none"
              placeholder="Nama Pengguna Baru"
              required
            />
            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
            <div className="flex gap-4 justify-end">
              <Button
                type="submit"
                className="px-4 py-2 !bg-[#4F8FBF] text-[#FFE3B3] rounded hover:!bg-[#26648B] focus:outline-none"
                disabled={changing}
              >
                {changing ? 'Mengubah...' : 'Ubah Nama'}
              </Button>
              <DialogClose asChild>
                <Button className="px-4 py-2 !bg-[#FFE3B3] text-black rounded hover:!bg-gray-300 focus:outline-none">Batal</Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Background />
    </div>
  );
}

export default SettingsPage;
