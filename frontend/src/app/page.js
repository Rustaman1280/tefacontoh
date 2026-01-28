'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FiPackage, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="text-center max-w-3xl mx-auto animate-fade-in">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-glow-lg mb-8">
                        <FiPackage className="text-4xl text-white" />
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                            Inventaris
                        </span>
                    </h1>

                    <p className="text-xl text-dark-300 mb-8 max-w-xl mx-auto">
                        Sistem Informasi Manajemen Inventaris dan Asset yang modern,
                        aman, dan mudah digunakan.
                    </p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            href="/login"
                            className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
                        >
                            Masuk <FiArrowRight />
                        </Link>
                        <Link
                            href="/register"
                            className="btn-secondary text-lg px-8 py-3"
                        >
                            Daftar Akun
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        <div className="card text-left">
                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Manajemen Asset</h3>
                            <p className="text-dark-400 text-sm">Kelola semua asset dengan mudah - tambah, edit, hapus, dan lihat detail.</p>
                        </div>
                        <div className="card text-left">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Dashboard Analytics</h3>
                            <p className="text-dark-400 text-sm">Pantau statistik asset, kondisi, dan kategori dalam satu tampilan.</p>
                        </div>
                        <div className="card text-left">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Pencarian & Filter</h3>
                            <p className="text-dark-400 text-sm">Cari asset berdasarkan nama, kategori, atau status kondisi.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center text-dark-500 text-sm">
                © 2026 Inventaris. Built with Next.js & Express.js
            </footer>
        </div>
    );
}
