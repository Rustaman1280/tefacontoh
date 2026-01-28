const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asset = sequelize.define('Asset', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Asset name is required' },
            len: { args: [2, 200], msg: 'Asset name must be between 2 and 200 characters' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Tetap ada category_id untuk backward compatibility
    category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    // Relasi ke ItemType (jenis barang)
    item_type_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'item_types',
            key: 'id'
        }
    },
    // Relasi ke Location (lokasi barang)
    location_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'locations',
            key: 'id'
        }
    },
    // Jumlah berdasarkan kondisi
    quantity_good: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Jumlah barang kondisi bagus'
    },
    quantity_fair: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Jumlah barang kondisi kurang layak'
    },
    quantity_damaged: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Jumlah barang kondisi rusak'
    },
    // Total quantity (computed from good + fair + damaged)
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: { args: [0], msg: 'Quantity cannot be negative' }
        }
    },
    // Kondisi umum (untuk backward compatibility dan single item)
    condition: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'bagus',
        validate: {
            isIn: [['bagus', 'kurang_layak', 'rusak', 'hilang']]
        }
    },
    // Lokasi text (untuk backward compatibility)
    location: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    // Kode inventaris unik
    inventory_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    purchase_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    purchase_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            min: { args: [0], msg: 'Price cannot be negative' }
        }
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    // Catatan tambahan
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'assets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeSave: (asset) => {
            // Auto-calculate total quantity
            asset.quantity = (asset.quantity_good || 0) + (asset.quantity_fair || 0) + (asset.quantity_damaged || 0);
            if (asset.quantity === 0) {
                asset.quantity = 1; // minimum 1
            }
        }
    }
});

module.exports = Asset;
