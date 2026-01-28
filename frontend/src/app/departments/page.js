'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useDepartments } from '@/hooks/useDepartments';
import { departmentAPI } from '@/lib/api';
import {
    FiLayers,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiMonitor,
    FiBookOpen
} from 'react-icons/fi';
import Modal from '@/components/Modal';

export default function DepartmentsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { departments, loading, error, refresh } = useDepartments();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        total_classes_per_grade: 1,
        total_labs: 0,
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (showEditModal && selectedDept) {
                await departmentAPI.update(selectedDept.id, formData);
            } else {
                await departmentAPI.create(formData);
            }
            refresh();
            setShowAddModal(false);
            setShowEditModal(false);
            setFormData({ code: '', name: '', total_classes_per_grade: 1, total_labs: 0, description: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save department');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (dept) => {
        setSelectedDept(dept);
        setFormData({
            code: dept.code,
            name: dept.name,
            total_classes_per_grade: dept.total_classes_per_grade,
            total_labs: dept.total_labs,
            description: dept.description || ''
        });
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        if (!selectedDept) return;
        setSubmitting(true);
        try {
            await departmentAPI.delete(selectedDept.id);
            refresh();
            setShowDeleteModal(false);
            setSelectedDept(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete department');
        } finally {
            setSubmitting(false);
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
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Daftar Jurusan</h1>
                        <p className="text-dark-400">Kelola data jurusan dan alokasi lab/kelas</p>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ code: '', name: '', total_classes_per_grade: 1, total_labs: 0, description: '' });
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                    >
                        <FiPlus />
                        <span>Tambah Jurusan</span>
                    </button>
                </div>

                {/* Departments Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map((dept) => (
                            <div
                                key={dept.id}
                                className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-primary-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary-400">{dept.code}</h3>
                                        <p className="text-white font-medium mt-1">{dept.name}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="p-2 hover:bg-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
                                        >
                                            <FiEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedDept(dept);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 hover:bg-red-500/20 rounded-lg text-dark-400 hover:text-red-400 transition-colors"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-dark-700/50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                                            <FiMonitor />
                                            <span className="text-sm font-medium">Lab</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{dept.total_labs}</p>
                                    </div>
                                    <div className="bg-dark-700/50 rounded-xl p-4">
                                        <div className="flex items-center gap-2 text-green-400 mb-2">
                                            <FiBookOpen />
                                            <span className="text-sm font-medium">Kelas/Angkatan</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{dept.total_classes_per_grade}</p>
                                    </div>
                                </div>

                                <p className="text-dark-400 text-sm mt-4">
                                    Total: {dept.total_labs} lab, {dept.total_classes_per_grade * 3} kelas (3 angkatan)
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={showAddModal || showEditModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                    }}
                    title={showEditModal ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Kode Jurusan
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                placeholder="Contoh: TKJ"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Nama Lengkap Jurusan
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                placeholder="Contoh: Teknik Komputer dan Jaringan"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Jumlah Kelas per Angkatan
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.total_classes_per_grade}
                                    onChange={(e) => setFormData({ ...formData, total_classes_per_grade: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Jumlah Lab
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.total_labs}
                                    onChange={(e) => setFormData({ ...formData, total_labs: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Deskripsi (Opsional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setShowEditModal(false);
                                }}
                                className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    title="Hapus Jurusan"
                >
                    <p className="text-dark-300 mb-6">
                        Apakah Anda yakin ingin menghapus jurusan <strong className="text-white">{selectedDept?.code} - {selectedDept?.name}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Menghapus...' : 'Hapus'}
                        </button>
                    </div>
                </Modal>
            </main>
        </div>
    );
}
