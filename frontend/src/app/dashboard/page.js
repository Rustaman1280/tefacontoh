'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import { dashboardAPI } from '@/lib/api';
import StatsCard from '@/components/StatsCard';
import { FiPackage, FiFolder, FiUsers, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function DashboardPage() {
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
        if (user) {
            fetchStats();
        }
    }, [user]);

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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!user) return null;

    const conditionData = stats?.conditionStats ? [
        { name: 'Bagus', value: stats.conditionStats.bagus?.quantity || 0, color: '#22c55e' },
        { name: 'Kurang Layak', value: stats.conditionStats.kurang_layak?.quantity || 0, color: '#f59e0b' },
        { name: 'Rusak', value: stats.conditionStats.rusak?.quantity || 0, color: '#ef4444' },
        { name: 'Hilang', value: stats.conditionStats.hilang?.quantity || 0, color: '#dc2626' },
    ].filter(d => d.value > 0) : [];

    const categoryData = stats?.assetsByCategory?.map((cat, index) => ({
        name: cat.categoryName,
        assets: cat.count,
        quantity: cat.totalQuantity,
    })) || [];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 lg:ml-0 p-4 lg:p-8 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 pt-12 lg:pt-0">
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-dark-400 mt-1">Selamat datang, {user.name}!</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Asset"
                            value={stats?.totalAssets || 0}
                            subtitle={`${stats?.totalQuantity || 0} unit total`}
                            icon={FiPackage}
                            color="primary"
                        />
                        <StatsCard
                            title="Kategori"
                            value={stats?.totalCategories || 0}
                            icon={FiFolder}
                            color="blue"
                        />
                        <StatsCard
                            title="Asset Baik"
                            value={stats?.conditionStats?.baik?.count || 0}
                            subtitle={`${stats?.conditionStats?.baik?.quantity || 0} unit`}
                            icon={FiCheckCircle}
                            color="green"
                        />
                        <StatsCard
                            title="Asset Rusak/Hilang"
                            value={(stats?.conditionStats?.rusak?.count || 0) + (stats?.conditionStats?.hilang?.count || 0)}
                            icon={FiAlertCircle}
                            color="red"
                        />
                    </div>

                    {/* Total Value Card */}
                    <div className="card mb-8 bg-gradient-to-r from-primary-900/50 to-primary-800/30 border-primary-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-dark-300 font-medium">Total Nilai Asset</p>
                                <p className="text-3xl font-bold text-white mt-2">
                                    {formatCurrency(stats?.totalValue || 0)}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">💰</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Condition Pie Chart */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-4">Kondisi Asset</h3>
                            {conditionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={conditionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {conditionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-dark-400">
                                    Belum ada data asset
                                </div>
                            )}
                        </div>

                        {/* Category Bar Chart */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-white mb-4">Asset per Kategori</h3>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={categoryData}>
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            axisLine={{ stroke: '#334155' }}
                                        />
                                        <YAxis
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            axisLine={{ stroke: '#334155' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1e293b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="assets" name="Jumlah Asset" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-dark-400">
                                    Belum ada data kategori
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-white mb-4">Aktivitas Terakhir</h3>
                        {stats?.recentTransactions?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentTransactions.slice(0, 5).map((log) => (
                                    <div key={log.id} className="flex items-center gap-4 p-3 bg-dark-700/30 rounded-lg">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.action === 'create' ? 'bg-green-500/20 text-green-400' :
                                                log.action === 'update' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {log.action === 'create' ? '+' : log.action === 'update' ? '✎' : '×'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">
                                                {log.user?.name || 'Unknown'} {
                                                    log.action === 'create' ? 'menambahkan' :
                                                        log.action === 'update' ? 'mengubah' : 'menghapus'
                                                } asset "{log.asset?.name || 'Unknown'}"
                                            </p>
                                            <p className="text-sm text-dark-400">
                                                {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
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
                            <p className="text-dark-400 text-center py-8">Belum ada aktivitas</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
