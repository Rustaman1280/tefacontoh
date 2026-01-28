'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAsset } from '@/hooks/useAssets';
import Sidebar from '@/components/Sidebar';
import { FiArrowLeft, FiEdit2, FiTrash2, FiPackage, FiMapPin, FiCalendar, FiDollarSign, FiUser, FiClock } from 'react-icons/fi';
import { assetAPI } from '@/lib/api';
import Modal from '@/components/Modal';
import toast from 'react-hot-toast';

const conditionColors = {
    baik: 'badge-success',
    rusak: 'badge-warning',
    hilang: 'badge-danger'
};

const conditionLabels = {
    baik: 'Baik',
    rusak: 'Rusak',
    hilang: 'Hilang'
};

export default function AssetDetailPage() {
    const params = useParams();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { asset, loading, error } = useAsset(params.id);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await assetAPI.delete(params.id);
            toast.success('Asset berhasil dihapus');
            router.push('/assets');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus asset');
        } finally {
            setDeleting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) return null;

    if (error || !asset) {
        return (
            <div className="min-h-screen flex">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">❌</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Asset Tidak Ditemukan</h2>
                        <p className="text-dark-400 mb-6">{error || 'Asset yang Anda cari tidak tersedia'}</p>
                        <Link href="/assets" className="btn-primary">
                            Kembali ke Daftar Asset
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 lg:ml-0 p-4 lg:p-8 overflow-x-hidden">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pt-12 lg:pt-0">
                        <div>
                            <Link
                                href="/assets"
                                className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-4 transition-colors"
                            >
                                <FiArrowLeft /> Kembali ke Daftar Asset
                            </Link>
                            <h1 className="text-3xl font-bold text-white">{asset.name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={conditionColors[asset.condition]}>
                                    {conditionLabels[asset.condition]}
                                </span>
                                <span className="text-dark-400">•</span>
                                <span className="text-primary-400">{asset.category?.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/assets/${asset.id}/edit`}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <FiEdit2 /> Edit
                            </Link>
                            <button
                                onClick={() => setDeleteModal(true)}
                                className="btn-danger flex items-center gap-2"
                            >
                                <FiTrash2 /> Hapus
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image */}
                            <div className="card">
                                <div className="h-64 bg-dark-700/50 rounded-xl overflow-hidden flex items-center justify-center">
                                    {asset.image_url ? (
                                        <img
                                            src={asset.image_url}
                                            alt={asset.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FiPackage className="text-6xl text-dark-500" />
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-white mb-3">Deskripsi</h3>
                                <p className="text-dark-300">
                                    {asset.description || 'Tidak ada deskripsi'}
                                </p>
                            </div>

                            {/* Transaction History */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-white mb-4">Riwayat Transaksi</h3>
                                {asset.logs && asset.logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {asset.logs.map((log) => (
                                            <div key={log.id} className="flex items-start gap-3 p-3 bg-dark-700/30 rounded-lg">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${log.action === 'create' ? 'bg-green-500/20 text-green-400' :
                                                        log.action === 'update' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {log.action === 'create' ? '+' : log.action === 'update' ? '✎' : '×'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm">
                                                        <span className="font-medium">{log.user?.name}</span>
                                                        {' '}
                                                        {log.action === 'create' ? 'membuat asset ini' :
                                                            log.action === 'update' ? 'mengubah asset ini' : 'menghapus asset ini'}
                                                    </p>
                                                    <p className="text-dark-400 text-xs mt-1">
                                                        {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-dark-400">Belum ada riwayat transaksi</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Quick Info */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-white mb-4">Informasi</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                            <FiPackage className="text-primary-400" />
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Jumlah</p>
                                            <p className="text-white font-semibold">{asset.quantity} unit</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <FiDollarSign className="text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Harga Pembelian</p>
                                            <p className="text-white font-semibold">{formatPrice(asset.purchase_price)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                            <FiMapPin className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Lokasi</p>
                                            <p className="text-white font-semibold">{asset.locationDetail?.name || '-'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                            <FiCalendar className="text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-dark-400 text-sm">Tanggal Pembelian</p>
                                            <p className="text-white font-semibold">{formatDate(asset.purchase_date)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Creator Info */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-white mb-4">Dibuat Oleh</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
                                        <FiUser className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{asset.creator?.name || 'Unknown'}</p>
                                        <p className="text-dark-400 text-sm">{asset.creator?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-dark-400 text-sm">
                                    <FiClock />
                                    <span>Dibuat {formatDate(asset.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
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
                        "{asset.name}"?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteModal(false)}
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
