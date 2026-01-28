'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { categoryAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, mode: 'add', category: null });
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, category: null });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchCategories();
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryAPI.getAll({ limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setFormData({ name: '', description: '' });
        setModal({ open: true, mode: 'add', category: null });
    };

    const openEditModal = (category) => {
        setFormData({ name: category.name, description: category.description || '' });
        setModal({ open: true, mode: 'edit', category });
    };

    const closeModal = () => {
        setModal({ open: false, mode: 'add', category: null });
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (modal.mode === 'add') {
                await categoryAPI.create(formData);
                toast.success('Kategori berhasil ditambahkan');
            } else {
                await categoryAPI.update(modal.category.id, formData);
                toast.success('Kategori berhasil diperbarui');
            }
            closeModal();
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan kategori');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;

        setSubmitting(true);
        try {
            await categoryAPI.delete(deleteModal.category.id);
            toast.success('Kategori berhasil dihapus');
            setDeleteModal({ open: false, category: null });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus kategori');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    if (authLoading) {
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
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pt-12 lg:pt-0">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Kategori Asset</h1>
                            <p className="text-dark-400 mt-1">Kelola kategori untuk asset inventaris</p>
                        </div>
                        <button onClick={openAddModal} className="btn-primary flex items-center gap-2 w-fit">
                            <FiPlus /> Tambah Kategori
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kategori..."
                                className="input-field pl-11"
                            />
                        </div>
                    </div>

                    {/* Categories Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-6 bg-dark-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCategories.map((category) => (
                                <div key={category.id} className="card-hover group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                                <FiFolder className="text-primary-400 text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                                                    {category.name}
                                                </h3>
                                                <p className="text-sm text-dark-400">
                                                    {category.assetCount || 0} asset
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="p-2 text-dark-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => setDeleteModal({ open: true, category })}
                                                className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                    {category.description && (
                                        <p className="text-sm text-dark-400 mt-3 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiFolder className="text-4xl text-dark-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {search ? 'Kategori Tidak Ditemukan' : 'Belum Ada Kategori'}
                            </h3>
                            <p className="text-dark-400 mb-6">
                                {search ? 'Coba gunakan kata kunci lain' : 'Mulai dengan membuat kategori pertama'}
                            </p>
                            {!search && (
                                <button onClick={openAddModal} className="btn-primary inline-flex items-center gap-2">
                                    <FiPlus /> Tambah Kategori
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modal.open}
                onClose={closeModal}
                title={modal.mode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
                size="md"
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Nama Kategori *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Contoh: Elektronik"
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Deskripsi</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Deskripsi kategori (opsional)"
                                rows={3}
                                className="input-field resize-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1 flex items-center justify-center"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                modal.mode === 'add' ? 'Tambah' : 'Simpan'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, category: null })}
                title="Hapus Kategori"
                size="sm"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <p className="text-white mb-2">
                        Apakah Anda yakin ingin menghapus kategori
                    </p>
                    <p className="text-primary-400 font-semibold mb-4">
                        "{deleteModal.category?.name}"?
                    </p>
                    <p className="text-dark-400 text-sm mb-6">
                        Kategori dengan asset terkait tidak dapat dihapus.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteModal({ open: false, category: null })}
                            className="btn-secondary flex-1"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={submitting}
                            className="btn-danger flex-1 flex items-center justify-center"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Hapus'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
