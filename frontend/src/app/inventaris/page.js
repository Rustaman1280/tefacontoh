'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { dashboardAPI } from '@/lib/api';
import {
    FiHome,
    FiLayers,
    FiBookOpen,
    FiMonitor,
    FiChevronRight,
    FiPackage
} from 'react-icons/fi';
import Link from 'next/link';

const mainGroups = [
    {
        id: 'sekolah',
        title: 'Barang Sekolah',
        description: 'Inventaris ruangan umum sekolah seperti ruang guru, kepala sekolah, perpustakaan, dll.',
        icon: FiHome,
        color: 'from-blue-500 to-blue-700',
        href: '/inventaris/sekolah'
    },
    {
        id: 'jurusan',
        title: 'Barang Jurusan (Lab)',
        description: 'Inventaris laboratorium per jurusan termasuk komputer, peralatan praktik, dll.',
        icon: FiMonitor,
        color: 'from-purple-500 to-purple-700',
        href: '/inventaris/jurusan'
    },
    {
        id: 'kelas',
        title: 'Barang Kelas',
        description: 'Inventaris kelas per jurusan termasuk meja, kursi, papan tulis, dll.',
        icon: FiBookOpen,
        color: 'from-green-500 to-green-700',
        href: '/inventaris/kelas'
    }
];

export default function InventarisPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardAPI.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Inventaris Sekolah</h1>
                    <p className="text-dark-400">Kelola inventaris berdasarkan kelompok barang</p>
                </div>

                {/* Stats Summary */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <FiPackage className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-dark-400">Total Barang</p>
                                    <p className="text-xl font-bold text-white">{stats.totalAssets || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <span className="text-green-400 font-bold">✓</span>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-400">Kondisi Bagus</p>
                                    <p className="text-xl font-bold text-green-400">{stats.quantitySummary?.totalGood || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                    <span className="text-yellow-400 font-bold">!</span>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-400">Kurang Layak</p>
                                    <p className="text-xl font-bold text-yellow-400">{stats.quantitySummary?.totalFair || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <span className="text-red-400 font-bold">✗</span>
                                </div>
                                <div>
                                    <p className="text-sm text-dark-400">Rusak</p>
                                    <p className="text-xl font-bold text-red-400">{stats.quantitySummary?.totalDamaged || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Groups */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {mainGroups.map((group) => {
                        const Icon = group.icon;
                        const groupStats = stats?.mainGroupStats?.[group.id] || {};
                        
                        return (
                            <Link
                                key={group.id}
                                href={group.href}
                                className="group bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-primary-500/50 transition-all duration-300 hover:shadow-glow"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <Icon className="text-white text-2xl" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                                    {group.title}
                                </h3>
                                
                                <p className="text-dark-400 text-sm mb-4">
                                    {group.description}
                                </p>

                                {/* Stats for this group */}
                                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                    <div className="bg-dark-700/50 rounded-lg p-2">
                                        <p className="text-xs text-dark-400">Bagus</p>
                                        <p className="text-sm font-bold text-green-400">{groupStats.totalGood || 0}</p>
                                    </div>
                                    <div className="bg-dark-700/50 rounded-lg p-2">
                                        <p className="text-xs text-dark-400">Kurang</p>
                                        <p className="text-sm font-bold text-yellow-400">{groupStats.totalFair || 0}</p>
                                    </div>
                                    <div className="bg-dark-700/50 rounded-lg p-2">
                                        <p className="text-xs text-dark-400">Rusak</p>
                                        <p className="text-sm font-bold text-red-400">{groupStats.totalDamaged || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center text-primary-400 font-medium">
                                    <span>Lihat Detail</span>
                                    <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Department Quick Access */}
                {stats?.assetsByDepartment && stats.assetsByDepartment.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-white mb-4">Ringkasan Per Jurusan</h2>
                        <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left p-4 text-dark-400 font-medium">Jurusan</th>
                                        <th className="text-center p-4 text-dark-400 font-medium">Total</th>
                                        <th className="text-center p-4 text-green-400 font-medium">Bagus</th>
                                        <th className="text-center p-4 text-yellow-400 font-medium">Kurang Layak</th>
                                        <th className="text-center p-4 text-red-400 font-medium">Rusak</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.assetsByDepartment.map((dept, index) => (
                                        <tr key={index} className="border-b border-white/5 hover:bg-dark-700/30">
                                            <td className="p-4">
                                                <div>
                                                    <p className="font-medium text-white">{dept.departmentCode}</p>
                                                    <p className="text-xs text-dark-400">{dept.departmentName}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-white font-medium">{dept.totalQuantity || 0}</td>
                                            <td className="p-4 text-center text-green-400">{dept.totalGood || 0}</td>
                                            <td className="p-4 text-center text-yellow-400">{dept.totalFair || 0}</td>
                                            <td className="p-4 text-center text-red-400">{dept.totalDamaged || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
