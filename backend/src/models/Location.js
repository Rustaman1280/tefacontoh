const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Location name is required' }
        }
    },
    // Kelompok utama: sekolah, jurusan, kelas
    main_group: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['sekolah', 'jurusan', 'kelas']]
        },
        comment: 'Kelompok utama lokasi'
    },
    // Tipe lokasi: ruangan, lab, kelas
    location_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['ruangan', 'lab', 'kelas']]
        },
        comment: 'Tipe lokasi'
    },
    // ID Jurusan (opsional, hanya untuk lab dan kelas jurusan)
    department_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    // Tingkat kelas (X, XI, XII) - hanya untuk kelas
    grade_level: {
        type: DataTypes.STRING(5),
        allowNull: true,
        validate: {
            isIn: [['X', 'XI', 'XII']]
        },
        comment: 'Tingkat kelas (hanya untuk tipe kelas)'
    },
    // Nomor urut (misal: kelas 1, kelas 2, lab 1, lab 2)
    sequence_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Nomor urut lokasi'
    },
    // Kode lokasi untuk identifikasi cepat
    code: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Kapasitas (opsional)
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Location;
