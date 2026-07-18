import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const emptyForm = {
  jumlah_jiwa: '',
  luas_wilayah: '',
};

export default function ProfilManager() {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfil() {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('profil_desa')
        .select('jumlah_jiwa, luas_wilayah')
        .eq('id', 1)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setFormData({
          jumlah_jiwa: data?.jumlah_jiwa || '',
          luas_wilayah: data?.luas_wilayah || '',
        });
      }

      setLoading(false);
    }

    fetchProfil();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const { data, error } = await supabase
      .from('profil_desa')
      .update({
        jumlah_jiwa: formData.jumlah_jiwa,
        luas_wilayah: formData.luas_wilayah,
      })
      .eq('id', 1)
      .select('jumlah_jiwa, luas_wilayah')
      .single();

    if (error) {
      setError(error.message);
    } else {
      setFormData({
        jumlah_jiwa: data?.jumlah_jiwa || '',
        luas_wilayah: data?.luas_wilayah || '',
      });
      setSuccess('Profil desa berhasil disimpan.');
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-green-200 bg-white p-6 text-green-900 shadow-sm">
        Memuat profil desa...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-green-950">
          Profil Desa
        </h2>
        <p className="mt-1 text-sm text-green-700">
          Kelola angka penduduk dan luas wilayah yang tampil di halaman publik.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-green-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-green-900">
              Jumlah Jiwa
            </span>
            <input
              type="text"
              name="jumlah_jiwa"
              value={formData.jumlah_jiwa}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-950 outline-none transition placeholder:text-green-900/40 focus:border-green-700 focus:ring-2 focus:ring-green-100"
              placeholder="Contoh: 347"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-green-900">
              Luas Wilayah
            </span>
            <input
              type="text"
              name="luas_wilayah"
              value={formData.luas_wilayah}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-950 outline-none transition placeholder:text-green-900/40 focus:border-green-700 focus:ring-2 focus:ring-green-100"
              placeholder="Contoh: 90,2409"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </section>
  );
}
