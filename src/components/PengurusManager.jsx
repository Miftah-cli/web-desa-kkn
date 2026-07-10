import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function PengurusManager() {
  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingJabatan, setEditingJabatan] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    no_telp: '',
  });

  useEffect(() => {
    fetchPengurus();
  }, []);

  async function fetchPengurus() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('pengurus')
      .select('jabatan, nama, alamat, no_telp');

    if (error) {
      setError(error.message);
    } else {
      setPengurus(data || []);
    }

    setLoading(false);
  }

  function handleEdit(row) {
    setEditingJabatan(row.jabatan);
    setFormData({
      nama: row.nama || '',
      alamat: row.alamat || '',
      no_telp: row.no_telp || '',
    });
  }

  function handleCancel() {
    setEditingJabatan(null);
    setFormData({
      nama: '',
      alamat: '',
      no_telp: '',
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSave(jabatan) {
    setSaving(true);
    setError('');

    const { data, error } = await supabase
      .from('pengurus')
      .update({
        nama: formData.nama,
        alamat: formData.alamat,
        no_telp: formData.no_telp,
      })
      .eq('jabatan', jabatan)
      .select('jabatan, nama, alamat, no_telp')
      .single();

    if (error) {
      setError(error.message);
    } else {
      setPengurus((currentPengurus) =>
        currentPengurus.map((row) =>
          row.jabatan === jabatan ? data : row
        )
      );
      handleCancel();
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Memuat data pengurus...
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Manajemen Pengurus
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Kelola nama, alamat, dan nomor telepon pengurus desa.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pengurus.map((row) => {
          const isEditing = editingJabatan === row.jabatan;

          return (
            <article
              key={row.jabatan}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Jabatan
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {row.jabatan}
                  </h3>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Nama
                    </span>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      Alamat
                    </span>
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">
                      No. Telepon
                    </span>
                    <input
                      type="text"
                      name="no_telp"
                      value={formData.no_telp}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSave(row.jabatan)}
                      disabled={saving}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-slate-500">Nama</dt>
                    <dd className="mt-1 text-slate-900">
                      {row.nama || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Alamat</dt>
                    <dd className="mt-1 text-slate-900">
                      {row.alamat || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">No. Telepon</dt>
                    <dd className="mt-1 text-slate-900">
                      {row.no_telp || '-'}
                    </dd>
                  </div>
                </dl>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
