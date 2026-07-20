export const defaultPotensiItems = [
  {
    id: 'hasil-bumi',
    nama: 'Hasil Bumi',
    gambar: '/hasilbumi.webp',
    deskripsi:
      'Hamparan sawah, tanaman padi, kebun bambu, dan hasil pertanian warga menjadi kekuatan utama Padukuhan Piji.',
  },
  {
    id: 'karawitan',
    nama: 'Karawitan',
    gambar: '/karawitan.webp',
    deskripsi:
      'Karawitan terus dirawat melalui kegiatan warga, latihan kelompok seni, dan agenda budaya padukuhan.',
  },
];

export function createPotensiId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `potensi-${Date.now()}`;
}

export function normalizePotensiItems(items) {
  let parsedItems = items;

  if (typeof parsedItems === 'string') {
    try {
      parsedItems = JSON.parse(parsedItems);
    } catch {
      parsedItems = [];
    }
  }

  if (!Array.isArray(parsedItems)) {
    return [];
  }

  return parsedItems
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: item.id || createPotensiId(),
      nama: item.nama || item.title || '',
      gambar: item.gambar || item.image || '',
      deskripsi: item.deskripsi || item.description || '',
    }));
}

export function getPublicPotensiItems(items) {
  const normalizedItems = normalizePotensiItems(items);

  return normalizedItems.length > 0 ? normalizedItems : defaultPotensiItems;
}
