import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const emptyForm = {
  nama: '',
  alamat: '',
  deskripsi: '',
  foto: '',
};

function extractFotoStoragePath(fotoUrl = '') {
  if (!fotoUrl) return null;

  try {
    const url = new URL(fotoUrl);
    const storagePathMarkers = [
      '/storage/v1/object/public/foto_desa/',
      '/storage/v1/object/sign/foto_desa/',
    ];
    const matchingMarker = storagePathMarkers.find((marker) =>
      url.pathname.includes(marker)
    );

    if (!matchingMarker) {
      return null;
    }

    const pathStart = url.pathname.indexOf(matchingMarker) + matchingMarker.length;

    return decodeURIComponent(url.pathname.slice(pathStart));
  } catch {
    return null;
  }
}

export default function UMKMManager() {
  const [umkmList, setUmkmList] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editData, setEditData] = useState(emptyForm);
  const [fotoFile, setFotoFile] = useState(null);
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUMKM() {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('umkm')
        .select('id, nama, alamat, deskripsi, foto')
        .order('id', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setUmkmList(data || []);
      }

      setLoading(false);
    }

    fetchUMKM();
  }, []);

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

  async function uploadFoto(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `umkm-${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('foto_desa')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('foto_desa').getPublicUrl(fileName);

    return publicUrl;
  }

  async function handleAdd(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    let fotoUrl = '';

    try {
      if (fotoFile) {
        fotoUrl = await uploadFoto(fotoFile);
      }
    } catch (uploadError) {
      setError(uploadError.message);
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('umkm')
      .insert({
        nama: formData.nama,
        alamat: formData.alamat,
        deskripsi: formData.deskripsi,
        foto: fotoUrl,
      })
      .select('id, nama, alamat, deskripsi, foto')
      .single();

    if (error) {
      setError(error.message);
    } else {
      setUmkmList((currentList) => [...currentList, data]);
      setFormData(emptyForm);
      setFotoFile(null);
    }

    setSaving(false);
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setEditData({
      nama: row.nama || '',
      alamat: row.alamat || '',
      deskripsi: row.deskripsi || '',
      foto: row.foto || '',
    });
    setEditFotoFile(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditData(emptyForm);
    setEditFotoFile(null);
  }

  async function handleUpdate(id) {
    setSaving(true);
    setError('');

    let fotoUrl = editData.foto;

    try {
      if (editFotoFile) {
        fotoUrl = await uploadFoto(editFotoFile);
      }
    } catch (uploadError) {
      setError(uploadError.message);
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from('umkm')
      .update({
        nama: editData.nama,
        alamat: editData.alamat,
        deskripsi: editData.deskripsi,
        foto: fotoUrl,
      })
      .eq('id', id)
      .select('id, nama, alamat, deskripsi, foto')
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

  async function handleRemovePhoto(id, currentFotoUrl) {
    setSaving(true);
    setError('');

    const fotoPath = extractFotoStoragePath(currentFotoUrl);

    if (fotoPath) {
      const { error: storageError } = await supabase.storage
        .from('foto_desa')
        .remove([fotoPath]);

      if (storageError) {
        setError(storageError.message);
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from('umkm')
      .update({ foto: null })
      .eq('id', id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setUmkmList((currentList) =>
      currentList.map((row) =>
        row.id === id ? { ...row, foto: null } : row
      )
    );
    setEditData((currentData) => ({ ...currentData, foto: null }));
    setEditFotoFile(null);
    setSaving(false);
  }

  async function handleDelete(id) {
    const shouldDelete = window.confirm('Hapus data UMKM ini?');

    if (!shouldDelete) {
      return;
    }

    setSaving(true);
    setError('');

    const deletedRow = umkmList.find((row) => row.id === id);

    const { error } = await supabase.from('umkm').delete().eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      const fotoPath = extractFotoStoragePath(deletedRow?.foto);

      if (fotoPath) {
        const { error: storageError } = await supabase.storage
          .from('foto_desa')
          .remove([fotoPath]);

        if (storageError) {
          setError(storageError.message);
        }
      }

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
        className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFotoFile(event.target.files?.[0] || null)
              }
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
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
                className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    {editData.foto && (
                      <div className="flex flex-wrap items-start gap-3">
                        <img
                          src={editData.foto}
                          alt={editData.nama || 'Foto UMKM'}
                          className="h-24 w-24 rounded-md object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(row.id, editData.foto)}
                          disabled={saving}
                          className="text-sm font-medium text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    )}

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

                    <label className="block">
                      <span className="text-sm font-medium text-slate-700">
                        Foto
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setEditFotoFile(event.target.files?.[0] || null)
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
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
                    <img
                      src={
                        row.foto ||
                        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={row.nama || 'Foto UMKM'}
                      className="mb-4 h-36 w-full rounded-md object-cover"
                    />

                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-semibold text-slate-900">
                          {row.nama}
                        </h3>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
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
                        <dd className="mt-1 break-words text-slate-900">
                          {row.alamat || '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          Deskripsi
                        </dt>
                        <dd className="mt-1 break-words text-slate-900">
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
