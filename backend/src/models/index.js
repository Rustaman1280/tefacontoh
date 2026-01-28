const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Asset = require('./Asset');
const TransactionLog = require('./TransactionLog');
const Department = require('./Department');
const Location = require('./Location');
const ItemType = require('./ItemType');

// Define associations

// ==================== Department Associations ====================
// Department has many Locations (labs and classes)
Department.hasMany(Location, {
    foreignKey: 'department_id',
    as: 'locations'
});

Location.belongsTo(Department, {
    foreignKey: 'department_id',
    as: 'department'
});

// ==================== ItemType Associations ====================
// ItemType has many Assets
ItemType.hasMany(Asset, {
    foreignKey: 'item_type_id',
    as: 'assets'
});

Asset.belongsTo(ItemType, {
    foreignKey: 'item_type_id',
    as: 'itemType'
});

// ==================== Location Associations ====================
// Location has many Assets
Location.hasMany(Asset, {
    foreignKey: 'location_id',
    as: 'assets'
});

Asset.belongsTo(Location, {
    foreignKey: 'location_id',
    as: 'locationDetail'
});

// ==================== Category Associations ====================
// Asset belongs to Category
Asset.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// Category has many Assets
Category.hasMany(Asset, {
    foreignKey: 'category_id',
    as: 'assets'
});

// ==================== User Associations ====================
// Asset belongs to User (created_by)
Asset.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// User has many Assets
User.hasMany(Asset, {
    foreignKey: 'created_by',
    as: 'assets'
});

// ==================== TransactionLog Associations ====================
// TransactionLog belongs to Asset
TransactionLog.belongsTo(Asset, {
    foreignKey: 'asset_id',
    as: 'asset'
});

// Asset has many TransactionLogs
Asset.hasMany(TransactionLog, {
    foreignKey: 'asset_id',
    as: 'logs'
});

// TransactionLog belongs to User
TransactionLog.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// User has many TransactionLogs
User.hasMany(TransactionLog, {
    foreignKey: 'user_id',
    as: 'logs'
});

// Sync database
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');
    } catch (error) {
        console.error('❌ Error syncing database:', error.message);
    }
};

module.exports = {
    sequelize,
    User,
    Category,
    Asset,
    TransactionLog,
    Department,
    Location,
    ItemType,
    syncDatabase
};
