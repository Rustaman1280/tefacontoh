'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { categoryAPI } from '@/lib/api';

export default function SearchFilter({ onFilter, initialValues = {} }) {
    const [search, setSearch] = useState(initialValues.search || '');
    const [category, setCategory] = useState(initialValues.category || '');
    const [condition, setCondition] = useState(initialValues.condition || '');
    const [categories, setCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll({ limit: 100 });
            setCategories(response.data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        onFilter({
            search,
            category,
            condition,
            page: 1
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setCondition('');
        onFilter({ search: '', category: '', condition: '', page: 1 });
    };

    const hasActiveFilters = search || category || condition;

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari asset berdasarkan nama..."
                        className="input-field pl-11"
                    />
                </div>
                <button type="submit" className="btn-primary">
                    Cari
                </button>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-primary-500' : ''}`}
                >
                    <FiFilter />
                    Filter
                </button>
            </form>

            {/* Filter panel */}
            {showFilters && (
                <div className="card animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Kategori</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-400 mb-2">Kondisi</label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Semua Kondisi</option>
                                <option value="baik">Baik</option>
                                <option value="rusak">Rusak</option>
                                <option value="hilang">Hilang</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                            >
                                <FiX /> Clear Filters
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="btn-primary"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            )}

            {/* Active filters */}
            {hasActiveFilters && !showFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-dark-400">Active filters:</span>
                    {search && (
                        <span className="badge bg-primary-500/20 text-primary-400 border border-primary-500/30">
                            Search: {search}
                        </span>
                    )}
                    {category && (
                        <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Category: {categories.find(c => c.id === category)?.name}
                        </span>
                    )}
                    {condition && (
                        <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            Condition: {condition}
                        </span>
                    )}
                    <button
                        onClick={clearFilters}
                        className="text-sm text-dark-400 hover:text-red-400 transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
