'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { assetAPI, categoryAPI, locationAPI, itemTypeAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function NewAssetPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        item_type_id: '',
        location_id: '',
        quantity_good: 0,
        quantity_fair: 0,
        quantity_damaged: 0,
        condition: 'bagus',
        location: '',
        inventory_code: '',
        purchase_date: '',
        purchase_price: '',
        image_url: '',
        notes: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchCategories();
        fetchLocations();
        fetchItemTypes();
        
        // Check for location_id in URL params
        const locationId = searchParams.get('location_id');
        if (locationId) {
            setFormData(prev => ({ ...prev, location_id: locationId }));
        }
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll({ limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await locationAPI.getAll();
            setLocations(response.data.data);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    };

    const fetchItemTypes = async () => {
        try {
            const response = await itemTypeAPI.getAll();
            setItemTypes(response.data.data);
        } catch (error) {
            console.error('Failed to fetch item types:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.location_id && !formData.location) {
            toast.error('Pilih lokasi terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                quantity_good: parseInt(formData.quantity_good) || 0,
                quantity_fair: parseInt(formData.quantity_fair) || 0,
                quantity_damaged: parseInt(formData.quantity_damaged) || 0,
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
                category_id: formData.category_id || null,
                item_type_id: formData.item_type_id || null,
                location_id: formData.location_id || null
            };

            await assetAPI.create(data);
            toast.success('Asset berhasil ditambahkan');
            
            // Redirect back to the appropriate page
            const locationId = searchParams.get('location_id');
            if (locationId) {
                router.back();
            } else {
                router.push('/assets');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menambahkan asset');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill name based on item type
    const handleItemTypeChange = (e) => {
        const itemTypeId = e.target.value;
        const selectedItemType = itemTypes.find(it => it.id === itemTypeId);
        setFormData(prev => ({
            ...prev,
            item_type_id: itemTypeId,
            name: selectedItemType ? selectedItemType.name : prev.name
        }));
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) return null;

    // Group locations by main_group
    const groupedLocations = {
        sekolah: locations.filter(l => l.main_group === 'sekolah'),
        jurusan: locations.filter(l => l.main_group === 'jurusan'),
        kelas: locations.filter(l => l.main_group === 'kelas')
    };

    // Group item types by category
    const groupedItemTypes = {
        jurusan: itemTypes.filter(it => it.item_category === 'jurusan'),
        kelas: itemTypes.filter(it => it.item_category === 'kelas'),
        umum: itemTypes.filter(it => it.item_category === 'umum')
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 lg:ml-0 p-4 lg:p-8 overflow-x-hidden">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 pt-12 lg:pt-0">
                        <Link
                            href="/assets"
                            className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-4 transition-colors"
                        >
                            <FiArrowLeft /> Kembali ke Daftar Asset
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Tambah Asset Baru</h1>
                        <p className="text-dark-400 mt-1">Isi form berikut untuk menambahkan asset</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="card">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Lokasi */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-2">Lokasi *</label>
                                <select
                                    name="location_id"
                                    value={formData.location_id}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Pilih Lokasi</option>
                                    <optgroup label="Ruangan Sekolah">
                                        {groupedLocations.sekolah.map((loc) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Lab Jurusan">
                                        {groupedLocations.jurusan.map((loc) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Kelas">
                                        {groupedLocations.kelas.map((loc) => (
                                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Jenis Barang */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Jenis Barang</label>
                                <select
                                    name="item_type_id"
                                    value={formData.item_type_id}
                                    onChange={handleItemTypeChange}
                                    className="input-field"
                                >
                                    <option value="">Pilih Jenis Barang</option>
                                    <optgroup label="Barang Lab (Jurusan)">
                                        {groupedItemTypes.jurusan.map((it) => (
                                            <option key={it.id} value={it.id}>{it.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Barang Kelas">
                                        {groupedItemTypes.kelas.map((it) => (
                                            <option key={it.id} value={it.id}>{it.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Barang Umum">
                                        {groupedItemTypes.umum.map((it) => (
                                            <option key={it.id} value={it.id}>{it.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            {/* Kategori (optional) */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Kategori</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nama Asset */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-2">Nama Asset *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Komputer Desktop"
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Kode Inventaris */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Kode Inventaris</label>
                                <input
                                    type="text"
                                    name="inventory_code"
                                    value={formData.inventory_code}
                                    onChange={handleChange}
                                    placeholder="Contoh: INV-2024-001"
                                    className="input-field"
                                />
                            </div>

                            {/* Kondisi default */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Kondisi Utama</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="bagus">Bagus</option>
                                    <option value="kurang_layak">Kurang Layak</option>
                                    <option value="rusak">Rusak</option>
                                    <option value="hilang">Hilang</option>
                                </select>
                            </div>

                            {/* Quantity Section */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-3">Jumlah Berdasarkan Kondisi</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                        <label className="block text-xs text-green-400 mb-2">Bagus</label>
                                        <input
                                            type="number"
                                            name="quantity_good"
                                            value={formData.quantity_good}
                                            onChange={handleChange}
                                            min="0"
                                            className="input-field text-center text-lg font-bold"
                                        />
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                        <label className="block text-xs text-yellow-400 mb-2">Kurang Layak</label>
                                        <input
                                            type="number"
                                            name="quantity_fair"
                                            value={formData.quantity_fair}
                                            onChange={handleChange}
                                            min="0"
                                            className="input-field text-center text-lg font-bold"
                                        />
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                        <label className="block text-xs text-red-400 mb-2">Rusak</label>
                                        <input
                                            type="number"
                                            name="quantity_damaged"
                                            value={formData.quantity_damaged}
                                            onChange={handleChange}
                                            min="0"
                                            className="input-field text-center text-lg font-bold"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-dark-500 mt-2">
                                    Total: {(parseInt(formData.quantity_good) || 0) + (parseInt(formData.quantity_fair) || 0) + (parseInt(formData.quantity_damaged) || 0)} unit
                                </p>
                            </div>

                            {/* Deskripsi */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-2">Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Deskripsi detail tentang asset..."
                                    rows={3}
                                    className="input-field resize-none"
                                />
                            </div>

                            {/* Tanggal Pembelian */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Tanggal Pembelian</label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={formData.purchase_date}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            {/* Harga Pembelian */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Harga Pembelian (Rp)</label>
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    className="input-field"
                                />
                            </div>

                            {/* URL Gambar */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-2">URL Gambar (Opsional)</label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="input-field"
                                />
                            </div>

                            {/* Catatan */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-2">Catatan Tambahan</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Catatan tambahan..."
                                    rows={2}
                                    className="input-field resize-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                            <Link href="/assets" className="btn-secondary">
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <FiSave /> Simpan Asset
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
