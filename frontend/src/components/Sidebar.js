'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    FiHome,
    FiPackage,
    FiFolder,
    FiLogOut,
    FiMenu,
    FiX,
    FiUser,
    FiGrid,
    FiMapPin,
    FiLayers
} from 'react-icons/fi';
import { useState } from 'react';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/inventaris', label: 'Inventaris Sekolah', icon: FiGrid },
    { href: '/assets', label: 'Semua Barang', icon: FiPackage },
    { href: '/locations', label: 'Lokasi', icon: FiMapPin },
    { href: '/departments', label: 'Jurusan', icon: FiLayers },
    { href: '/categories', label: 'Kategori', icon: FiFolder },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-800 rounded-lg border border-white/10"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-dark-900/95 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
                                <FiPackage className="text-white text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Inventaris</h1>
                                <p className="text-xs text-dark-400">Asset Management</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${isActive
                                            ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30 shadow-glow'
                                            : 'text-dark-300 hover:bg-dark-800 hover:text-white border border-transparent'
                                        }
                  `}
                                >
                                    <Icon className={`text-xl ${isActive ? 'text-primary-400' : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-4 py-3 bg-dark-800/50 rounded-xl mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center">
                                <FiUser className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-dark-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                        >
                            <FiLogOut className="text-xl" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
