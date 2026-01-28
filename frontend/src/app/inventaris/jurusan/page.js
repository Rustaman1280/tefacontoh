'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useDepartments } from '@/hooks/useDepartments';
import { locationAPI } from '@/lib/api';
import {
    FiMonitor,
    FiChevronRight,
    FiPlus,
    FiEdit,
    FiPackage,
    FiArrowLeft,
    FiLayers
} from 'react-icons/fi';
import Link from 'next/link';

export default function InventarisJurusanPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { departments, loading: deptLoading } = useDepartments();
    const [selectedDept, setSelectedDept] = useState(null);
    const [labs, setLabs] = useState([]);
    const [selectedLab, setSelectedLab] = useState(null);
    const [labAssets, setLabAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleDeptClick = async (dept) => {
        setSelectedDept(dept);
        setSelectedLab(null);
        setLabAssets([]);
        setLoading(true);
        try {
            const response = await locationAPI.getAll({
                department_id: dept.id,
                location_type: 'lab'
            });
            setLabs(response.data.data);
        } catch (err) {
            console.error('Failed to fetch labs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLabClick = async (lab) => {
        setSelectedLab(lab);
        setLoading(true);
        try {
            const response = await locationAPI.getById(lab.id);
            setLabAssets(response.data.data.assets || []);
        } catch (err) {
            console.error('Failed to fetch lab assets:', err);
        } finally {
            setLoading(false);
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
                    <span className="text-white">Barang Jurusan (Lab)</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/inventaris" className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                            <FiArrowLeft className="text-dark-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Barang Jurusan (Lab)</h1>
                            <p className="text-dark-400">Inventaris laboratorium per jurusan</p>
                        </div>
                    </div>
                    <Link
                        href="/assets/new?main_group=jurusan"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                    >
                        <FiPlus />
                        <span>Tambah Barang</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Departments List */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FiLayers className="text-purple-400" />
                                Daftar Jurusan
                            </h2>

                            {deptLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {departments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => handleDeptClick(dept)}
                                            className={`w-full text-left p-3 rounded-xl transition-all ${
                                                selectedDept?.id === dept.id
                                                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-400'
                                                    : 'bg-dark-700/50 hover:bg-dark-700 text-white border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold">{dept.code}</span>
                                                <span className="text-xs bg-dark-600 px-2 py-1 rounded">
                                                    {dept.total_labs} Lab
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1 truncate">{dept.name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Labs List */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <FiMonitor className="text-blue-400" />
                                Lab {selectedDept?.code || ''}
                            </h2>

                            {selectedDept ? (
                                loading && !selectedLab ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                                    </div>
                                ) : labs.length > 0 ? (
                                    <div className="space-y-2">
                                        {labs.map((lab) => (
                                            <button
                                                key={lab.id}
                                                onClick={() => handleLabClick(lab)}
                                                className={`w-full text-left p-3 rounded-xl transition-all ${
                                                    selectedLab?.id === lab.id
                                                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                                                        : 'bg-dark-700/50 hover:bg-dark-700 text-white border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{lab.name}</span>
                                                    <FiChevronRight className="text-dark-400" />
                                                </div>
                                                <p className="text-xs text-dark-400 mt-1">{lab.code}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-dark-400 text-sm">Belum ada lab untuk jurusan ini</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-dark-400 text-sm">Pilih jurusan terlebih dahulu</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assets List */}
                    <div className="lg:col-span-2">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                            {selectedLab ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedLab.name}</h2>
                                            <p className="text-dark-400 text-sm">Inventaris di lab ini</p>
                                        </div>
                                        <Link
                                            href={`/assets/new?location_id=${selectedLab.id}`}
                                            className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors"
                                        >
                                            <FiPlus size={14} />
                                            <span>Tambah</span>
                                        </Link>
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                                        </div>
                                    ) : labAssets.length > 0 ? (
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
                                                    {labAssets.map((asset) => (
                                                        <tr key={asset.id} className="border-b border-white/5 hover:bg-dark-700/30">
                                                            <td className="p-3">
                                                                <p className="font-medium text-white">{asset.name}</p>
                                                                <p className="text-xs text-dark-400">{asset.itemType?.name || '-'}</p>
                                                            </td>
                                                            <td className="p-3 text-center text-green-400 font-medium">{asset.quantity_good || 0}</td>
                                                            <td className="p-3 text-center text-yellow-400 font-medium">{asset.quantity_fair || 0}</td>
                                                            <td className="p-3 text-center text-red-400 font-medium">{asset.quantity_damaged || 0}</td>
                                                            <td className="p-3 text-center text-white font-medium">{asset.quantity || 0}</td>
                                                            <td className="p-3 text-right">
                                                                <Link
                                                                    href={`/assets/${asset.id}/edit`}
                                                                    className="p-2 hover:bg-dark-600 rounded-lg text-dark-400 hover:text-white transition-colors inline-block"
                                                                >
                                                                    <FiEdit size={16} />
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <FiPackage className="text-4xl text-dark-500 mx-auto mb-4" />
                                            <p className="text-dark-400">Belum ada barang di lab ini</p>
                                            <Link
                                                href={`/assets/new?location_id=${selectedLab.id}`}
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
                                    <FiMonitor className="text-4xl text-dark-500 mx-auto mb-4" />
                                    <p className="text-dark-400">Pilih lab untuk melihat inventaris</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
