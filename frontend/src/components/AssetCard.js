'use client';

import Link from 'next/link';
import { FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';

const conditionColors = {
    baik: 'badge-success',
    rusak: 'badge-warning',
    hilang: 'badge-danger'
};

const conditionLabels = {
    baik: 'Baik',
    rusak: 'Rusak',
    hilang: 'Hilang'
};

export default function AssetCard({ asset, onDelete }) {
    const formatPrice = (price) => {
        if (!price) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="card-hover group animate-fade-in">
            {/* Image placeholder */}
            <div className="relative h-40 bg-dark-700/50 rounded-xl mb-4 overflow-hidden">
                {asset.image_url ? (
                    <img
                        src={asset.image_url}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <FiPackage className="text-4xl text-dark-500" />
                    </div>
                )}
                <span className={`absolute top-3 right-3 ${conditionColors[asset.condition]}`}>
                    {conditionLabels[asset.condition]}
                </span>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                        {asset.name}
                    </h3>
                    <p className="text-sm text-dark-400 line-clamp-2 mt-1">
                        {asset.description || 'No description'}
                    </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Kategori</span>
                    <span className="text-primary-400 font-medium">
                        {asset.category?.name || 'Uncategorized'}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Jumlah</span>
                    <span className="text-white font-semibold">{asset.quantity} unit</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400">Harga</span>
                    <span className="text-green-400 font-medium">{formatPrice(asset.purchase_price)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <Link
                        href={`/assets/${asset.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-dark-300 hover:text-primary-400 bg-dark-700/50 hover:bg-primary-500/10 rounded-lg transition-all"
                    >
                        <FiEye /> Detail
                    </Link>
                    <Link
                        href={`/assets/${asset.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-dark-300 hover:text-yellow-400 bg-dark-700/50 hover:bg-yellow-500/10 rounded-lg transition-all"
                    >
                        <FiEdit2 /> Edit
                    </Link>
                    <button
                        onClick={() => onDelete && onDelete(asset)}
                        className="flex items-center justify-center gap-2 py-2 px-3 text-sm text-dark-300 hover:text-red-400 bg-dark-700/50 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    );
}
