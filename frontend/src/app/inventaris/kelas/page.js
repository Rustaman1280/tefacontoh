'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useDepartments } from '@/hooks/useDepartments';
import { locationAPI } from '@/lib/api';
import {
    FiBookOpen,
    FiChevronRight,
    FiPlus,
    FiEdit,
    FiPackage,
    FiArrowLeft,
    FiLayers
} from 'react-icons/fi';
import Link from 'next/link';

const gradeLabels = {
    'X': 'Kelas X',
    'XI': 'Kelas XI', 
    'XII': 'Kelas XII'
};

export default function InventarisKelasPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { departments, loading: deptLoading } = useDepartments();
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState('X');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classAssets, setClassAssets] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (selectedDept) {
            fetchClasses();
        }
    }, [selectedDept, selectedGrade]);

    const fetchClasses = async () => {
        if (!selectedDept) return;
        setLoading(true);
        setSelectedClass(null);
        setClassAssets([]);
        try {
            const response = await locationAPI.getAll({
                department_id: selectedDept.id,
                location_type: 'kelas',
                grade_level: selectedGrade
            });
            setClasses(response.data.data);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        setSelectedClass(null);
        setClassAssets([]);
    };

    const handleClassClick = async (kelas) => {
        setSelectedClass(kelas);
        setLoading(true);
        try {
            const response = await locationAPI.getById(kelas.id);
            setClassAssets(response.data.data.assets || []);
        } catch (err) {
            console.error('Failed to fetch class assets:', err);
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
                    <span className="text-white">Barang Kelas</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/inventaris" className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                            <FiArrowLeft className="text-dark-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Barang Kelas</h1>
                            <p className="text-dark-400">Inventaris kelas per jurusan dan tingkat</p>
                        </div>
                    </div>
                    <Link
                        href="/assets/new?main_group=kelas"
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
                                <FiLayers className="text-green-400" />
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
                                                    ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                                                    : 'bg-dark-700/50 hover:bg-dark-700 text-white border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold">{dept.code}</span>
                                                <span className="text-xs bg-dark-600 px-2 py-1 rounded">
                                                    {dept.total_classes_per_grade * 3} Kelas
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark-400 mt-1 truncate">{dept.name}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Grade & Classes */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            {/* Grade Selector */}
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-white mb-3">Tingkat</h2>
                                <div className="flex gap-2">
                                    {Object.entries(gradeLabels).map(([grade, label]) => (
                                        <button
                                            key={grade}
                                            onClick={() => setSelectedGrade(grade)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                                selectedGrade === grade
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Classes List */}
                            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <FiBookOpen className="text-blue-400" />
                                Kelas {selectedGrade} {selectedDept?.code || ''}
                            </h2>

                            {selectedDept ? (
                                loading && !selectedClass ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                                    </div>
                                ) : classes.length > 0 ? (
                                    <div className="space-y-2">
                                        {classes.map((kelas) => (
                                            <button
                                                key={kelas.id}
                                                onClick={() => handleClassClick(kelas)}
                                                className={`w-full text-left p-3 rounded-xl transition-all ${
                                                    selectedClass?.id === kelas.id
                                                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
                                                        : 'bg-dark-700/50 hover:bg-dark-700 text-white border border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{kelas.name}</span>
                                                    <FiChevronRight className="text-dark-400" />
                                                </div>
                                                <p className="text-xs text-dark-400 mt-1">{kelas.code}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-dark-400 text-sm">Belum ada kelas {selectedGrade} untuk jurusan ini</p>
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
                            {selectedClass ? (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{selectedClass.name}</h2>
                                            <p className="text-dark-400 text-sm">Inventaris di kelas ini</p>
                                        </div>
                                        <Link
                                            href={`/assets/new?location_id=${selectedClass.id}`}
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
                                    ) : classAssets.length > 0 ? (
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
                                                    {classAssets.map((asset) => (
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
                                            <p className="text-dark-400">Belum ada barang di kelas ini</p>
                                            <Link
                                                href={`/assets/new?location_id=${selectedClass.id}`}
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
                                    <FiBookOpen className="text-4xl text-dark-500 mx-auto mb-4" />
                                    <p className="text-dark-400">Pilih kelas untuk melihat inventaris</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
