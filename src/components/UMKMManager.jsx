import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const emptyForm = {
  nama: '',
  alamat: '',
  no_telp: '',
  deskripsi: '',
};

export default function UMKMManager() {
  const [umkmList, setUmkmList] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editData, setEditData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUMKM();
  }, []);

  async function fetchUMKM() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('umkm')
      .select('id, nama, alamat, no_telp, deskripsi')
      .order('id', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setUmkmList(data || []);
    }

    setLoading(false);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleAdd(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const { data, error } = await supabase
      .from('umkm')
      .insert({
        nama: formData.nama,
        alamat: formData.alamat,
        no_telp: formData.no_telp,
        deskripsi: formData.deskripsi,
      })
      .select('id, nama, alamat, no_telp, deskripsi')
      .single();

    if (error) {
      setError(error.message);
    } else {
      setUmkmList((currentList) => [...currentList, data]);
      setFormData(emptyForm);
    }

    setSaving(false);
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setEditData({
      nama: row.nama || '',
      alamat: row.alamat || '',
      no_telp: row.no_telp || '',
      deskripsi: row.deskripsi || '',
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditData(emptyForm);
  }

  async function handleUpdate(id) {
    setSaving(true);
    setError('');

    const { data, error } = await supabase
      .from('umkm')
      .update({
        nama: editData.nama,
        alamat: editData.alamat,
        no_telp: editData.no_telp,
        deskripsi: editData.deskripsi,
      })
      .eq('id', id)
      .select('id, nama, alamat, no_telp, deskripsi')
      .single();

    if (error) {
      setError(error.message);
    } else {
      setUmkmList((currentList) =>
        currentList.map((row) => (row.id === id ? data : row))
      );
      handleCancelEdit();
    }

    setSaving(false);
  }

  async function handleDelete(id) {
    const shouldDelete = window.confirm('Hapus data UMKM ini?');

    if (!shouldDelete) {
      return;
    }

    setSaving(true);
    setError('');

    const { error } = await supabase.from('umkm').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      setUmkmList((currentList) => currentList.filter((row) => row.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    }

    setSaving(false);
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Manajemen UMKM
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Tambah, ubah, dan hapus data UMKM desa.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Add New UMKM
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nama</span>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleFormChange}
              required
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
              onChange={handleFormChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Alamat</span>
            <input
              type="text"
              name="alamat"
              value={formData.alamat}
              onChange={handleFormChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">
              Deskripsi
            </span>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleFormChange}
              rows="3"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? 'Menyimpan...' : 'Add UMKM'}
        </button>
      </form>

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Memuat data UMKM...
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {umkmList.map((row) => {
            const isEditing = editingId === row.id;

            return (
              <article
                key={row.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Nama
                      </span>
                      <input
                        type="text"
                        name="nama"
                        value={editData.nama}
                        onChange={handleEditChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Alamat
                      </span>
                      <input
                        type="text"
                        name="alamat"
                        value={editData.alamat}
                        onChange={handleEditChange}
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
                        value={editData.no_telp}
                        onChange={handleEditChange}
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Deskripsi
                      </span>
                      <textarea
                        name="deskripsi"
                        value={editData.deskripsi}
                        onChange={handleEditChange}
                        rows="3"
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(row.id)}
                        disabled={saving}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {row.nama}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.no_telp || '-'}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          disabled={saving}
                          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <dl className="mt-4 space-y-3 text-sm">
                      <div>
                        <dt className="font-medium text-slate-500">Alamat</dt>
                        <dd className="mt-1 text-slate-900">
                          {row.alamat || '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          Deskripsi
                        </dt>
                        <dd className="mt-1 text-slate-900">
                          {row.deskripsi || '-'}
                        </dd>
                      </div>
                    </dl>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
