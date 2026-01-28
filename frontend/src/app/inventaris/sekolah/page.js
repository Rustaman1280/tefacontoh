'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useLocations } from '@/hooks/useLocations';
import { locationAPI, assetAPI } from '@/lib/api';
import {
    FiHome,
    FiChevronRight,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiPackage,
    FiArrowLeft
} from 'react-icons/fi';
import Link from 'next/link';
import Modal from '@/components/Modal';

export default function InventarisSekolahPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { locations, loading, error, refresh } = useLocations({ main_group: 'sekolah' });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationAssets, setLocationAssets] = useState([]);
    const [assetsLoading, setAssetsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleLocationClick = async (location) => {
        setSelectedLocation(location);
        setAssetsLoading(true);
        try {
            const response = await locationAPI.getById(location.id);
            setLocationAssets(response.data.data.assets || []);
        } catch (err) {
            console.error('Failed to fetch location assets:', err);
        } finally {
            setAssetsLoading(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-950 flex">
            <Sidebar />

            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-dark-400 mb-4">
                    <Link href="/inventaris" className="hover:text-white transition-colors">
                        Inventaris
                    </Link>
                    <FiChevronRight />
                    <span className="text-white">Barang Sekolah</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/inventaris" className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                            <FiArrowLeft className="text-dark-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Barang Sekolah</h1>
                            <p className="text-dark-400">Inventaris ruangan umum sekolah</p>
                        </div>
                    </div>
                    <Link
                        href="/assets/new?main_group=sekolah"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                    >
                        <FiPlus />
                        <span>Tambah Barang</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Locations List */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FiHome className="text-blue-400" />
                                Ruangan Sekolah
                            </h2>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {locations.map((location) => (
                                        <button
                                            key={location.id}
                                            onClick={() => handleLocationClick(location)}
                                            className={`w-full text-left p-3 rounded-xl transition-all ${
                                                selectedLocation?.id === location.id
                                                    ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                                                    : 'bg-dark-700/50 hover:bg-dark-700 text-white border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{location.name}</span>
                                                <FiChevronRight className="text-dark-400" />
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1">{location.code}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assets List */}
                    <div className="lg:col-span-2">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            {selectedLocation ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedLocation.name}</h2>
                                            <p className="text-dark-400 text-sm">Daftar inventaris di ruangan ini</p>
                                        </div>
                                        <Link
                                            href={`/assets/new?location_id=${selectedLocation.id}`}
                                            className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                                        >
                                            <FiPlus size={14} />
                                            <span>Tambah</span>
                                        </Link>
                                    </div>

                                    {assetsLoading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                                        </div>
                                    ) : locationAssets.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-white/10">
                                                        <th className="text-left p-3 text-dark-400 font-medium">Nama Barang</th>
                                                        <th className="text-center p-3 text-green-400 font-medium">Bagus</th>
                                                        <th className="text-center p-3 text-yellow-400 font-medium">Kurang</th>
                                                        <th className="text-center p-3 text-red-400 font-medium">Rusak</th>
                                                        <th className="text-center p-3 text-dark-400 font-medium">Total</th>
                                                        <th className="text-right p-3 text-dark-400 font-medium">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {locationAssets.map((asset) => (
                                                        <tr key={asset.id} className="border-b border-white/5 hover:bg-dark-700/30">
                                                            <td className="p-3">
                                                                <p className="font-medium text-white">{asset.name}</p>
                                                                <p className="text-xs text-dark-400">{asset.inventory_code || '-'}</p>
                                                            </td>
                                                            <td className="p-3 text-center text-green-400 font-medium">{asset.quantity_good || 0}</td>
                                                            <td className="p-3 text-center text-yellow-400 font-medium">{asset.quantity_fair || 0}</td>
                                                            <td className="p-3 text-center text-red-400 font-medium">{asset.quantity_damaged || 0}</td>
                                                            <td className="p-3 text-center text-white font-medium">{asset.quantity || 0}</td>
                                                            <td className="p-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Link
                                                                        href={`/assets/${asset.id}/edit`}
                                                                        className="p-2 hover:bg-dark-600 rounded-lg text-dark-400 hover:text-white transition-colors"
                                                                    >
                                                                        <FiEdit size={16} />
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FiPackage className="text-4xl text-dark-500 mx-auto mb-4" />
                                            <p className="text-dark-400">Belum ada barang di ruangan ini</p>
                                            <Link
                                                href={`/assets/new?location_id=${selectedLocation.id}`}
                                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                            >
                                                <FiPlus size={16} />
                                                <span>Tambah Barang Pertama</span>
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <FiHome className="text-4xl text-dark-500 mx-auto mb-4" />
                                    <p className="text-dark-400">Pilih ruangan untuk melihat inventaris</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
