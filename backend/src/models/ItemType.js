const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ItemType = sequelize.define('ItemType', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Item type name is required' }
        }
    },
    // Kategori barang: untuk jurusan (lab), untuk kelas, atau umum
    item_category: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['jurusan', 'kelas', 'umum']]
        },
        comment: 'Kategori barang: jurusan (lab), kelas, atau umum (sekolah)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Icon atau gambar default untuk jenis barang ini
    icon: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'item_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ItemType;
