const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TransactionLog = sequelize.define('TransactionLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    asset_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'assets',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.ENUM('create', 'update', 'delete'),
        allowNull: false
    },
    changes: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    }
}, {
    tableName: 'transaction_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = TransactionLog;
