import { useEffect, useState } from 'react';
import {
  createPotensiId,
  normalizePotensiItems,
} from '../utils/potensiDefaults';
import { supabase } from '../utils/supabaseClient';

const emptyForm = {
  jumlah_jiwa: '',
  luas_wilayah: '',
};

const emptyPotensiForm = {
  id: '',
  nama: '',
  deskripsi: '',
  gambar: '',
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

export default function ProfilManager() {
  const [formData, setFormData] = useState(emptyForm);
  const [initialFormData, setInitialFormData] = useState(emptyForm);
  const [potensiItems, setPotensiItems] = useState([]);
  const [potensiForm, setPotensiForm] = useState(emptyPotensiForm);
  const [potensiImageFile, setPotensiImageFile] = useState(null);
  const [potensiImageInputKey, setPotensiImageInputKey] = useState(0);
  const [editingPotensiId, setEditingPotensiId] = useState(null);
  const [isPotensiFormOpen, setIsPotensiFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPotensi, setSavingPotensi] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isProfileDirty =
    formData.jumlah_jiwa !== initialFormData.jumlah_jiwa ||
    formData.luas_wilayah !== initialFormData.luas_wilayah;

  function clearPotensiImageFile() {
    setPotensiImageFile(null);
    setPotensiImageInputKey((currentKey) => currentKey + 1);
  }

  useEffect(() => {
    async function fetchProfil() {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('profil_desa')
        .select('jumlah_jiwa, luas_wilayah, potensi_lokal')
        .eq('id', 1)
        .single();

      if (error) {
        setError(error.message);
      } else {
        const fetchedFormData = {
          jumlah_jiwa: data?.jumlah_jiwa || '',
          luas_wilayah: data?.luas_wilayah || '',
        };

        setFormData(fetchedFormData);
        setInitialFormData(fetchedFormData);
        setPotensiItems(normalizePotensiItems(data?.potensi_lokal));
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
    setSuccess('');
  }

  function handlePotensiChange(event) {
    const { name, value } = event.target;

    setPotensiForm((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setSuccess('');
  }

  function handleAddPotensi() {
    setEditingPotensiId(null);
    setPotensiForm(emptyPotensiForm);
    clearPotensiImageFile();
    setIsPotensiFormOpen(true);
    setError('');
    setSuccess('');
  }

  function handleEditPotensi(item) {
    setEditingPotensiId(item.id);
    setPotensiForm({
      id: item.id,
      nama: item.nama || '',
      deskripsi: item.deskripsi || '',
      gambar: item.gambar || '',
    });
    clearPotensiImageFile();
    setIsPotensiFormOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCancelPotensiForm() {
    setEditingPotensiId(null);
    setPotensiForm(emptyPotensiForm);
    clearPotensiImageFile();
    setIsPotensiFormOpen(false);
  }

  function handleOpenDeleteModal(item) {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
    setError('');
    setSuccess('');
  }

  function handleCloseDeleteModal() {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  }

  async function uploadPotensiImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `potensi-${crypto.randomUUID()}.${fileExt}`;

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

  async function removePotensiImageFromStorage(gambarUrl) {
    const gambarPath = extractFotoStoragePath(gambarUrl);

    if (!gambarPath) {
      return;
    }

    const { error } = await supabase.storage
      .from('foto_desa')
      .remove([gambarPath]);

    if (error) {
      throw error;
    }
  }

  async function savePotensiItems(nextItems, successMessage) {
    const cleanedItems = normalizePotensiItems(nextItems).map((item) => ({
      id: item.id,
      nama: item.nama,
      deskripsi: item.deskripsi,
      gambar: item.gambar,
    }));

    const { data, error } = await supabase
      .from('profil_desa')
      .update({ potensi_lokal: cleanedItems })
      .eq('id', 1)
      .select('potensi_lokal')
      .single();

    if (error) {
      throw error;
    }

    setPotensiItems(normalizePotensiItems(data?.potensi_lokal));
    setSuccess(successMessage);
  }

  async function handleApplyPotensiForm(event) {
    event.preventDefault();

    if (!potensiForm.nama.trim()) {
      setError('Nama Potensi wajib diisi.');
      return;
    }

    setSavingPotensi(true);
    setError('');
    setSuccess('');

    let gambarUrl = potensiForm.gambar;

    try {
      if (potensiImageFile) {
        gambarUrl = await uploadPotensiImage(potensiImageFile);
      }
    } catch (uploadError) {
      setError(uploadError.message);
      setSavingPotensi(false);
      return;
    }

    const nextItem = {
      id: potensiForm.id || createPotensiId(),
      nama: potensiForm.nama.trim(),
      deskripsi: potensiForm.deskripsi.trim(),
      gambar: gambarUrl,
    };

    const nextItems = editingPotensiId
      ? potensiItems.map((item) =>
          item.id === editingPotensiId ? nextItem : item
        )
      : [...potensiItems, nextItem];

    try {
      await savePotensiItems(
        nextItems,
        editingPotensiId
          ? 'Potensi lokal berhasil diperbarui.'
          : 'Potensi lokal berhasil ditambahkan.'
      );
      handleCancelPotensiForm();
    } catch (saveError) {
      setError(saveError.message);
    }

    setSavingPotensi(false);
  }

  async function handleRemovePotensiImage(itemId, currentGambarUrl) {
    setSavingPotensi(true);
    setError('');
    setSuccess('');

    try {
      await removePotensiImageFromStorage(currentGambarUrl);

      const nextItems = potensiItems.map((item) =>
        item.id === itemId ? { ...item, gambar: '' } : item
      );

      await savePotensiItems(nextItems, 'Gambar potensi lokal berhasil dihapus.');

      if (editingPotensiId === itemId) {
        setPotensiForm((currentForm) => ({ ...currentForm, gambar: '' }));
      }

      clearPotensiImageFile();
    } catch (removeError) {
      setError(removeError.message);
    }

    setSavingPotensi(false);
  }

  async function handleConfirmDeletePotensi() {
    if (!itemToDelete) {
      return;
    }

    const deletingId = itemToDelete.id;

    setSavingPotensi(true);
    setError('');
    setSuccess('');

    const nextItems = potensiItems.filter((item) => item.id !== deletingId);

    try {
      await savePotensiItems(nextItems, 'Potensi lokal berhasil dihapus.');

      if (editingPotensiId === deletingId) {
        handleCancelPotensiForm();
      }

      handleCloseDeleteModal();
    } catch (saveError) {
      setError(saveError.message);
    }

    setSavingPotensi(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isProfileDirty) {
      return;
    }

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
      const savedFormData = {
        jumlah_jiwa: data?.jumlah_jiwa || '',
        luas_wilayah: data?.luas_wilayah || '',
      };

      setFormData(savedFormData);
      setInitialFormData(savedFormData);
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
          Kelola angka penduduk, luas wilayah, dan Potensi lokal yang tampil di halaman publik.
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="w-full max-w-2xl rounded-lg border border-green-200 bg-white p-5 shadow-sm">
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
        </div>

        <button
          type="submit"
          disabled={saving || !isProfileDirty}
          className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300 sm:w-auto"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>

        <div className="space-y-4 rounded-lg border border-green-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-green-950">
                Potensi Lokal
              </h3>
              <p className="mt-1 text-sm text-green-700">
                Tambah, edit, dan hapus data Potensi Lokal
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPotensi}
              className="w-full rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 sm:w-auto"
            >
              Tambah Potensi
            </button>
          </div>

          {isPotensiFormOpen && (
            <form
              onSubmit={handleApplyPotensiForm}
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"
            >
              <div className="mb-4 flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  {editingPotensiId ? 'Edit Potensi' : 'Tambah Potensi'}
                </p>
                <h4 className="text-lg font-semibold text-green-950">
                  {editingPotensiId ? potensiForm.nama || 'Potensi' : 'Potensi Baru'}
                </h4>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-green-900">
                    Nama
                  </span>
                  <input
                    type="text"
                    name="nama"
                    value={potensiForm.nama}
                    onChange={handlePotensiChange}
                    className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-950 outline-none transition placeholder:text-green-900/40 focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    placeholder="Contoh: Hasil Bumi"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-green-900">
                    Gambar
                  </span>
                  <input
                    key={potensiImageInputKey}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPotensiImageFile(event.target.files?.[0] || null)
                    }
                    className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-900 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-green-900 hover:file:bg-emerald-200"
                  />
                  {potensiImageFile && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-xs text-green-700">
                        File dipilih: {potensiImageFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={clearPotensiImageFile}
                        disabled={savingPotensi}
                        className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Hapus File
                      </button>
                    </div>
                  )}
                </label>

                <label className="block lg:col-span-2">
                  <span className="text-sm font-medium text-green-900">
                    Deskripsi
                  </span>
                  <textarea
                    name="deskripsi"
                    value={potensiForm.deskripsi}
                    onChange={handlePotensiChange}
                    rows="4"
                    className="mt-1 w-full rounded-md border border-green-200 px-3 py-2 text-sm text-green-950 outline-none transition placeholder:text-green-900/40 focus:border-green-700 focus:ring-2 focus:ring-green-100"
                    placeholder="Tulis deskripsi Potensi lokal"
                  />
                </label>
              </div>

              {potensiForm.gambar && (
                <div className="mt-4 space-y-2">
                  <img
                    src={potensiForm.gambar}
                    alt={potensiForm.nama || 'Preview Potensi'}
                    className="h-40 w-full rounded-md object-cover sm:w-72"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleRemovePotensiImage(potensiForm.id, potensiForm.gambar)
                    }
                    disabled={savingPotensi}
                    className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={savingPotensi}
                  className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  {savingPotensi
                    ? 'Mengunggah...'
                    : editingPotensiId
                      ? 'Simpan Perubahan'
                      : 'Tambah Potensi'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPotensiForm}
                  disabled={savingPotensi}
                  className="rounded-md border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-emerald-50"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          {potensiItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-green-200 bg-emerald-50/60 p-6 text-center">
              <p className="text-sm font-medium text-green-950">
                Belum ada Potensi lokal.
              </p>
              <p className="mt-1 text-sm text-green-700">
                Klik Tambah Potensi untuk membuat item pertama.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {potensiItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm"
                >
                  {item.gambar ? (
                    <img
                      src={item.gambar}
                      alt={item.nama}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 items-center justify-center bg-emerald-50 text-sm font-medium text-green-700">
                      Gambar belum diisi
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                          Potensi Lokal
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-green-950">
                          {item.nama || 'Tanpa Nama'}
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditPotensi(item)}
                          disabled={savingPotensi}
                          className="rounded-md bg-green-700 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-green-800"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(item)}
                          disabled={savingPotensi}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-green-900">
                      {item.deskripsi || 'Deskripsi belum diisi.'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-lg border border-red-100 bg-white p-6 shadow-xl">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                Konfirmasi Hapus
              </p>
              <h3 className="text-xl font-semibold text-green-950">
                Apakah Anda yakin ingin menghapus potensi ini?
              </h3>
              <p className="text-sm leading-6 text-green-700">
                {itemToDelete?.nama
                  ? `${itemToDelete.nama} akan dihapus dari daftar Potensi lokal.`
                  : 'Data Potensi lokal yang dipilih akan dihapus.'}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                disabled={savingPotensi}
                className="rounded-md border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePotensi}
                disabled={savingPotensi}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {savingPotensi ? 'Menghapus...' : 'Oke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
