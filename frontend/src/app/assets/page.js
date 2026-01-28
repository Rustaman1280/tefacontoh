'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAssets } from '@/hooks/useAssets';
import { assetAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import AssetCard from '@/components/AssetCard';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AssetsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { assets, loading, pagination, updateParams, refresh } = useAssets();
    const [deleteModal, setDeleteModal] = useState({ open: false, asset: null });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleFilter = (filters) => {
        updateParams(filters);
    };

    const handleDelete = async () => {
        if (!deleteModal.asset) return;

        setDeleting(true);
        try {
            await assetAPI.delete(deleteModal.asset.id);
            toast.success('Asset berhasil dihapus');
            setDeleteModal({ open: false, asset: null });
            refresh();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus asset');
        } finally {
            setDeleting(false);
        }
    };

    const handlePageChange = (newPage) => {
        updateParams({ page: newPage });
    };

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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pt-12 lg:pt-0">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Daftar Asset</h1>
                            <p className="text-dark-400 mt-1">Kelola semua asset inventaris Anda</p>
                        </div>
                        <Link href="/assets/new" className="btn-primary flex items-center gap-2 w-fit">
                            <FiPlus /> Tambah Asset
                        </Link>
                    </div>

                    {/* Search & Filter */}
                    <div className="mb-6">
                        <SearchFilter onFilter={handleFilter} />
                    </div>

                    {/* Assets Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="card animate-pulse">
                                    <div className="h-40 bg-dark-700 rounded-xl mb-4"></div>
                                    <div className="h-6 bg-dark-700 rounded mb-2 w-3/4"></div>
                                    <div className="h-4 bg-dark-700 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : assets.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {assets.map((asset) => (
                                    <AssetCard
                                        key={asset.id}
                                        asset={asset}
                                        onDelete={(asset) => setDeleteModal({ open: true, asset })}
                                    />
                                ))}
                            </div>

                            {/* Pagination Dropdown */}
                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-8">
                                    <span className="text-dark-400">Halaman</span>
                                    <select
                                        value={pagination.page}
                                        onChange={(e) => handlePageChange(Number(e.target.value))}
                                        className="input-field w-auto min-w-[80px] text-center cursor-pointer"
                                    >
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-dark-400">dari {pagination.totalPages}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card text-center py-12">
                            <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">📦</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Asset</h3>
                            <p className="text-dark-400 mb-6">Mulai tambahkan asset inventaris Anda</p>
                            <Link href="/assets/new" className="btn-primary inline-flex items-center gap-2">
                                <FiPlus /> Tambah Asset Pertama
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, asset: null })}
                title="Hapus Asset"
                size="sm"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <p className="text-white mb-2">
                        Apakah Anda yakin ingin menghapus asset
                    </p>
                    <p className="text-primary-400 font-semibold mb-6">
                        "{deleteModal.asset?.name}"?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteModal({ open: false, asset: null })}
                            className="btn-secondary flex-1"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn-danger flex-1 flex items-center justify-center"
                        >
                            {deleting ? (
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
