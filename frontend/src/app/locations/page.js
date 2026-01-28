'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useLocations } from '@/hooks/useLocations';
import { useDepartments } from '@/hooks/useDepartments';
import { locationAPI } from '@/lib/api';
import {
    FiMapPin,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiHome,
    FiMonitor,
    FiBookOpen,
    FiFilter
} from 'react-icons/fi';
import Modal from '@/components/Modal';

const mainGroupLabels = {
    sekolah: { label: 'Barang Sekolah', icon: FiHome, color: 'text-blue-400' },
    jurusan: { label: 'Lab Jurusan', icon: FiMonitor, color: 'text-purple-400' },
    kelas: { label: 'Kelas', icon: FiBookOpen, color: 'text-green-400' }
};

const locationTypeLabels = {
    ruangan: 'Ruangan',
    lab: 'Laboratorium',
    kelas: 'Kelas'
};

export default function LocationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [filterMainGroup, setFilterMainGroup] = useState('');
    const { locations, loading, refresh, updateParams } = useLocations({ main_group: filterMainGroup || undefined });
    const { departments } = useDepartments();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        main_group: 'sekolah',
        location_type: 'ruangan',
        department_id: '',
        grade_level: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        updateParams({ main_group: filterMainGroup || undefined });
    }, [filterMainGroup]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = {
                ...formData,
                department_id: formData.department_id || null,
                grade_level: formData.grade_level || null
            };
            
            if (showEditModal && selectedLocation) {
                await locationAPI.update(selectedLocation.id, data);
            } else {
                await locationAPI.create(data);
            }
            refresh();
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save location');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            main_group: 'sekolah',
            location_type: 'ruangan',
            department_id: '',
            grade_level: '',
            description: ''
        });
    };

    const handleEdit = (location) => {
        setSelectedLocation(location);
        setFormData({
            name: location.name,
            main_group: location.main_group,
            location_type: location.location_type,
            department_id: location.department_id || '',
            grade_level: location.grade_level || '',
            description: location.description || ''
        });
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        if (!selectedLocation) return;
        setSubmitting(true);
        try {
            await locationAPI.delete(selectedLocation.id);
            refresh();
            setShowDeleteModal(false);
            setSelectedLocation(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete location');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMainGroupChange = (value) => {
        setFormData(prev => ({
            ...prev,
            main_group: value,
            location_type: value === 'sekolah' ? 'ruangan' : value === 'jurusan' ? 'lab' : 'kelas',
            department_id: value === 'sekolah' ? '' : prev.department_id,
            grade_level: value !== 'kelas' ? '' : prev.grade_level
        }));
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
                        <h1 className="text-3xl font-bold text-white mb-1">Daftar Lokasi</h1>
                        <p className="text-dark-400">Kelola ruangan, lab, dan kelas</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
                    >
                        <FiPlus />
                        <span>Tambah Lokasi</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <FiFilter className="text-dark-400" />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterMainGroup('')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    !filterMainGroup ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                }`}
                            >
                                Semua
                            </button>
                            {Object.entries(mainGroupLabels).map(([key, value]) => {
                                const Icon = value.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilterMainGroup(key)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                            filterMainGroup === key ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                        }`}
                                    >
                                        <Icon size={16} />
                                        <span>{value.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Locations Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <div className="bg-dark-800/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-dark-400 font-medium">Kode</th>
                                    <th className="text-left p-4 text-dark-400 font-medium">Nama Lokasi</th>
                                    <th className="text-left p-4 text-dark-400 font-medium">Kelompok</th>
                                    <th className="text-left p-4 text-dark-400 font-medium">Tipe</th>
                                    <th className="text-left p-4 text-dark-400 font-medium">Jurusan</th>
                                    <th className="text-right p-4 text-dark-400 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((location) => {
                                    const groupInfo = mainGroupLabels[location.main_group];
                                    const Icon = groupInfo?.icon || FiMapPin;
                                    
                                    return (
                                        <tr key={location.id} className="border-b border-white/5 hover:bg-dark-700/30">
                                            <td className="p-4">
                                                <span className="text-primary-400 font-mono">{location.code}</span>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-white">{location.name}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className={`flex items-center gap-2 ${groupInfo?.color || 'text-dark-400'}`}>
                                                    <Icon size={16} />
                                                    <span>{groupInfo?.label || location.main_group}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-dark-300">
                                                {locationTypeLabels[location.location_type] || location.location_type}
                                            </td>
                                            <td className="p-4 text-dark-300">
                                                {location.department?.code || '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(location)}
                                                        className="p-2 hover:bg-dark-600 rounded-lg text-dark-400 hover:text-white transition-colors"
                                                    >
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedLocation(location);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-dark-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {locations.length === 0 && (
                            <div className="text-center py-12">
                                <FiMapPin className="text-4xl text-dark-500 mx-auto mb-4" />
                                <p className="text-dark-400">Belum ada lokasi</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add/Edit Modal */}
                <Modal
                    isOpen={showAddModal || showEditModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                    }}
                    title={showEditModal ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Nama Lokasi
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                placeholder="Contoh: Lab TKJ 1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-dark-300 mb-2">
                                Kelompok Utama
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(mainGroupLabels).map(([key, value]) => {
                                    const Icon = value.icon;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => handleMainGroupChange(key)}
                                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                                                formData.main_group === key
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            }`}
                                        >
                                            <Icon size={16} />
                                            <span className="text-sm">{value.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {formData.main_group !== 'sekolah' && (
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Jurusan
                                </label>
                                <select
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Pilih Jurusan</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.code} - {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.main_group === 'kelas' && (
                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">
                                    Tingkat Kelas
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['X', 'XI', 'XII'].map((grade) => (
                                        <button
                                            key={grade}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, grade_level: grade })}
                                            className={`px-4 py-3 rounded-xl transition-colors ${
                                                formData.grade_level === grade
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            }`}
                                        >
                                            Kelas {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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
                    title="Hapus Lokasi"
                >
                    <p className="text-dark-300 mb-6">
                        Apakah Anda yakin ingin menghapus lokasi <strong className="text-white">{selectedLocation?.name}</strong>?
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
