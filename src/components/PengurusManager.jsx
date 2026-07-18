import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const jabatanOptions = [
  'Dukuh',
  'RW',
  'RT 01',
  'RT 02',
  'RT 03',
  'RT 04',
  'RT 05',
];

function isAllowedJabatan(jabatan = '') {
  return jabatanOptions.includes(jabatan);
}

function compareJabatan(a, b) {
  return jabatanOptions.indexOf(a.jabatan) - jabatanOptions.indexOf(b.jabatan);
}

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

function normalizePengurusRows(rows = []) {
  const rowsByJabatan = new Map(
    rows
      .filter((row) => isAllowedJabatan(row.jabatan))
      .map((row) => [row.jabatan, row])
  );

  return jabatanOptions.map(
    (jabatan) =>
      rowsByJabatan.get(jabatan) || {
        id: null,
        jabatan,
        nama: '',
        alamat: '',
        foto: null,
      }
  );
}

export default function PengurusManager() {
  const [pengurus, setPengurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingJabatan, setEditingJabatan] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    foto: '',
  });

  useEffect(() => {
    async function fetchPengurus() {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('pengurus')
        .select('id, jabatan, nama, alamat, foto');

      if (error) {
        setError(error.message);
      } else {
        setPengurus(normalizePengurusRows(data));
      }

      setLoading(false);
    }

    fetchPengurus();
  }, []);

  function handleEdit(row) {
    setEditingJabatan(row.jabatan);
    setFormData({
      nama: row.nama || '',
      alamat: row.alamat || '',
      foto: row.foto || '',
    });
    setFotoFile(null);
  }

  function handleCancel() {
    setEditingJabatan(null);
    setFormData({
      nama: '',
      alamat: '',
      foto: '',
    });
    setFotoFile(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function uploadFoto(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `pengurus-${crypto.randomUUID()}.${fileExt}`;

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

  async function handleSave(jabatan) {
    setSaving(true);
    setError('');

    let fotoUrl = formData.foto;

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
      .from('pengurus')
      .upsert(
        {
          jabatan,
          nama: formData.nama,
          alamat: formData.alamat,
          foto: fotoUrl,
        },
        { onConflict: 'jabatan' }
      )
      .select('id, jabatan, nama, alamat, foto')
      .single();

    if (error) {
      setError(error.message);
    } else {
      setPengurus((currentPengurus) =>
        currentPengurus.map((row) =>
          row.jabatan === jabatan ? data : row
        ).sort(compareJabatan)
      );
      handleCancel();
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
      .from('pengurus')
      .update({ foto: null })
      .eq('id', id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setPengurus((currentPengurus) =>
      currentPengurus.map((row) =>
        row.id === id ? { ...row, foto: null } : row
      )
    );
    setFormData((currentData) => ({ ...currentData, foto: null }));
    setFotoFile(null);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-green-200 bg-white p-6 text-green-900 shadow-sm">
        Memuat data pengurus...
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-green-950">
          Manajemen Pengurus Padukuhan Piji
        </h2>
        <p className="mt-1 text-sm text-green-700">
          Kelola data Dukuh, RW, dan RT Padukuhan Piji.
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
              className="min-w-0 rounded-lg border border-green-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={row.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.nama || row.jabatan)}&background=dcfce7&color=14532d`}
                    alt={row.nama || row.jabatan}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-green-100"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                      Jabatan
                    </p>
                    <h3 className="mt-1 truncate text-lg font-semibold text-green-950">
                      {row.jabatan}
                    </h3>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-sm font-medium text-green-900">
                      Nama
                    </span>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-green-900">
                      Alamat
                    </span>
                    <textarea
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleChange}
                      rows="3"
                      className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-green-900">
                      Foto Profil
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setFotoFile(event.target.files?.[0] || null)
                      }
                      className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-900 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-green-900 hover:file:bg-emerald-200"
                    />
                    {formData.foto && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={formData.foto}
                          alt="Foto pengurus saat ini"
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-green-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(row.id, formData.foto)}
                          disabled={saving || !row.id}
                          className="text-sm font-medium text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    )}
                  </label>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSave(row.jabatan)}
                      disabled={saving}
                      className="rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="rounded-md border border-green-200 px-3 py-2 text-sm font-medium text-green-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-medium text-green-700">Nama</dt>
                    <dd className="mt-1 break-words text-green-950">
                      {row.nama || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-green-700">Alamat</dt>
                    <dd className="mt-1 break-words text-green-950">
                      {row.alamat || '-'}
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
