'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAsset } from '@/hooks/useAssets';
import { assetAPI, categoryAPI, locationAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function EditAssetPage() {
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { asset, loading: assetLoading } = useAsset(params.id);
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        quantity: 1,
        condition: 'baik',
        location_id: '',
        purchase_date: '',
        purchase_price: '',
        image_url: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchCategories();
        fetchLocations();
    }, []);

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                description: asset.description || '',
                category_id: asset.category_id || '',
                quantity: asset.quantity || 1,
                condition: asset.condition || 'baik',
                location_id: asset.location_id || '',
                purchase_date: asset.purchase_date || '',
                purchase_price: asset.purchase_price || '',
                image_url: asset.image_url || ''
            });
        }
    }, [asset]);

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
            const response = await locationAPI.getAll({ limit: 200 });
            setLocations(response.data.data);
        } catch (error) {
            console.error('Failed to fetch locations:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category_id) {
            toast.error('Pilih kategori terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            const data = {
                ...formData,
                quantity: parseInt(formData.quantity),
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null
            };

            await assetAPI.update(params.id, data);
            toast.success('Asset berhasil diperbarui');
            router.push(`/assets/${params.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal memperbarui asset');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || assetLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 lg:ml-0 p-4 lg:p-8 overflow-x-hidden">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 pt-12 lg:pt-0">
                        <Link
                            href={`/assets/${params.id}`}
                            className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-4 transition-colors"
                        >
                            <FiArrowLeft /> Kembali ke Detail Asset
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Edit Asset</h1>
                        <p className="text-dark-400 mt-1">Perbarui informasi asset</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="card">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Asset */}
                            <div className="md:col-span-2">
                                <label className="block text-sm text-dark-400 mb-2">Nama Asset *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Laptop Lenovo ThinkPad"
                                    className="input-field"
                                    required
                                />
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

                            {/* Kategori */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Kategori *</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Kondisi */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Kondisi *</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="baik">Baik</option>
                                    <option value="rusak">Rusak</option>
                                    <option value="hilang">Hilang</option>
                                </select>
                            </div>

                            {/* Jumlah */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Jumlah *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Lokasi */}
                            <div>
                                <label className="block text-sm text-dark-400 mb-2">Lokasi</label>
                                <select
                                    name="location_id"
                                    value={formData.location_id}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Pilih Lokasi</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name} {loc.Department ? `(${loc.Department.name})` : ''}
                                        </option>
                                    ))}
                                </select>
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
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                            <Link href={`/assets/${params.id}`} className="btn-secondary">
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
                                        <FiSave /> Simpan Perubahan
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
