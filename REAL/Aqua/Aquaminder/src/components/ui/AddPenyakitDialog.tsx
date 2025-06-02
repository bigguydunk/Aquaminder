import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './dialog';
import { Button } from './button';
import supabase from '../../../supabaseClient';

const AddPenyakitDialog = ({ open, onOpenChange, onAdded }: { open: boolean; onOpenChange: (open: boolean) => void; onAdded?: () => void }) => {
  const [nama, setNama] = useState('');
  const [gejala, setGejala] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [gambar, setGambar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pengobatan, setPengobatan] = useState('');
  const [penyebab, setPenyebab] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setGambar(acceptedFiles[0]);
      setPreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024, // 2MB limit
    onDrop,
    onDropRejected: (fileRejections) => {
      if (fileRejections && fileRejections.length > 0) {
        // Always show a simple message for file size
        setError('File terlalu besar (maks 2MB)');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let gambar_url = null;
    try {
      if (gambar) {
        // Upload to Supabase Storage (assume bucket 'penyakit-images')
        const fileExt = gambar.name.split('.').pop();
        const fileName = `penyakit-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('penyakit-image').upload(fileName, gambar);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('penyakit-image').getPublicUrl(fileName);
        gambar_url = urlData.publicUrl;
      }
      const { error: insertError } = await supabase.from('penyakit').insert({
        nama_penyakit: nama,
        gejala,
        deskripsi,
        gambar_url,
        pengobatan,
        penyebab,
      });
      if (insertError) throw insertError;
      setNama(''); setGejala(''); setDeskripsi(''); setGambar(null); setPreview(null); setPengobatan(''); setPenyebab('');
      if (onAdded) onAdded();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menambah penyakit');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50  max-w-md w-full custom-scrollbar" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold mb-2 text-[#26648B]">Tambah Penyakit Baru</DialogTitle>
          <DialogDescription className="mb-4 text-[#26648B] text-center">
            Isi data penyakit dan upload gambar jika ada.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="font-semibold text-[#26648B]">Nama Penyakit
            <input className="w-full px-3 py-2 font-normal !rounded-lg border !border-[#26648B] mb-1 mt-1" value={nama} onChange={e => setNama(e.target.value)} required disabled={loading} placeholder="Beri nama seperti penyakit A jika anda tidak tahu"/>
          </label>
          <label className="font-semibold text-[#26648B]">Gejala
            <input className="w-full px-3 py-2 font-normal !rounded-lg border !border-[#26648B] mb-1 mt-1" value={gejala} onChange={e => setGejala(e.target.value)} required disabled={loading} placeholder="Tulis gejala yang anda amati"/>
          </label>
          <label className="font-semibold text-[#26648B]">Deskripsi
            <textarea className="w-full px-3 py-2 font-normal !rounded-lg border border-[#26648B] mb-1 mt-1" value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={3} required disabled={loading} placeholder="Tulis - jika ingin anda kosongkan" />
          </label>
          <label className="font-semibold text-[#26648B]">Penyebab
            <input className="w-full px-3 py-2 font-normal !rounded-lg border !border-[#26648B] mb-1 mt-1" value={penyebab} onChange={e => setPenyebab(e.target.value)} required disabled={loading} placeholder="Tulis - jika tidak tahu" />
          </label>
          <label className="font-semibold text-[#26648B]">Pengobatan
            <input className="w-full px-3 py-2 font-normal !rounded-lg border !border-[#26648B] mb-1 mt-1" value={pengobatan} onChange={e => setPengobatan(e.target.value)} required disabled={loading} placeholder="Tulis - jika tidak tahu" />
          </label>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-[#26648B] bg-[#FFE3B3]'}`}> 
            <input {...getInputProps()} disabled={loading} />
            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto mb-2 max-h-32 rounded" />
            ) : (
              <span className="text-[#26648B]">{isDragActive ? 'Drop gambar di sini...' : 'Klik atau drag gambar ke sini (opsional)'}</span>
            )}
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <div className="flex gap-4 justify-end mt-2">
            <Button type="submit" className="px-4 py-2 !bg-[#4F8FBF] text-[#FFE3B3] rounded hover:!bg-[#26648B] focus:outline-none" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Tambah'}
            </Button>
            <DialogClose asChild>
              <Button className="px-4 py-2 !bg-[#FFE3B3] text-[#26648B] rounded hover:!bg-gray-300 focus:outline-none" type="button">Batal</Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPenyakitDialog;
