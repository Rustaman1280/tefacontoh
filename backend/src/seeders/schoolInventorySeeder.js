/**
 * Seeder untuk data awal inventaris sekolah
 * Jalankan: node src/seeders/schoolInventorySeeder.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');
const { syncDatabase, Department, Location, ItemType, Asset, Category, User } = require('../models');

// Data Jurusan
const departmentsData = [
    { code: 'AKL', name: 'Akuntansi dan Keuangan Lembaga', total_classes_per_grade: 3, total_labs: 1 },
    { code: 'MPL', name: 'Manajemen Perkantoran dan Layanan Bisnis', total_classes_per_grade: 3, total_labs: 2 },
    { code: 'PM', name: 'Pemasaran', total_classes_per_grade: 2, total_labs: 2 },
    { code: 'TLG', name: 'Teknik Logistik', total_classes_per_grade: 2, total_labs: 1 },
    { code: 'TKF', name: 'Teknik Kendaraan Ringan dan Fabrikasi', total_classes_per_grade: 3, total_labs: 1 },
    { code: 'TLM', name: 'Teknik dan Manajemen Perawatan Otomotif', total_classes_per_grade: 2, total_labs: 1 },
    { code: 'DKV', name: 'Desain Komunikasi Visual', total_classes_per_grade: 3, total_labs: 4 },
    { code: 'PPL', name: 'Pengembangan Perangkat Lunak dan Gim', total_classes_per_grade: 2, total_labs: 2 },
    { code: 'TJK', name: 'Teknik Jaringan Komputer dan Telekomunikasi', total_classes_per_grade: 3, total_labs: 2 },
    { code: 'TET', name: 'Teknik Elektronika', total_classes_per_grade: 1, total_labs: 1 }
];

// Ruangan Sekolah
const schoolRoomsData = [
    'Kepala Sekolah',
    'Wakasek',
    'R.Guru',
    'Kantor BLUD',
    'Bank Mini',
    'LSP',
    'Agen Pos',
    'Masjid',
    'UKS',
    'Mushola',
    'Raflesia',
    'Apotek Mini',
    'MasterPrint',
    'Perpustakaan',
    'Gudang Sekolah',
    'Kantin Belakang',
    'Kantin Akuarium',
    'Motekar',
    'Sasana',
    'Gudang Olahraga'
];

// Jenis Barang untuk Lab (Jurusan)
const labItemsData = [
    { name: 'Komputer', item_category: 'jurusan', description: 'Komputer desktop untuk lab' },
    { name: 'Meja', item_category: 'jurusan', description: 'Meja kerja lab' },
    { name: 'Kursi', item_category: 'jurusan', description: 'Kursi lab' },
    { name: 'Smart TV', item_category: 'jurusan', description: 'Smart TV untuk presentasi' },
    { name: 'Board', item_category: 'jurusan', description: 'Papan tulis' },
    { name: 'AC', item_category: 'jurusan', description: 'Air Conditioner' },
    { name: 'Keyboard', item_category: 'jurusan', description: 'Keyboard komputer' },
    { name: 'Mouse', item_category: 'jurusan', description: 'Mouse komputer' },
    { name: 'CCTV', item_category: 'jurusan', description: 'Kamera CCTV' },
    { name: 'Lemari', item_category: 'jurusan', description: 'Lemari penyimpanan' },
    { name: 'WiFi', item_category: 'jurusan', description: 'Router WiFi / Access Point' },
    { name: 'InFocus', item_category: 'jurusan', description: 'Proyektor InFocus' },
    { name: 'Wall Screen', item_category: 'jurusan', description: 'Layar proyektor' }
];

// Jenis Barang untuk Kelas
const classItemsData = [
    { name: 'Kursi', item_category: 'kelas', description: 'Kursi siswa' },
    { name: 'Meja', item_category: 'kelas', description: 'Meja siswa' },
    { name: 'Board', item_category: 'kelas', description: 'Papan tulis kelas' },
    { name: 'Lemari', item_category: 'kelas', description: 'Lemari kelas' }
];

// Jenis Barang Umum (untuk ruangan sekolah)
const generalItemsData = [
    { name: 'Meja Kerja', item_category: 'umum', description: 'Meja kerja kantor' },
    { name: 'Kursi Kerja', item_category: 'umum', description: 'Kursi kerja kantor' },
    { name: 'Komputer', item_category: 'umum', description: 'Komputer kantor' },
    { name: 'Printer', item_category: 'umum', description: 'Printer' },
    { name: 'AC', item_category: 'umum', description: 'Air Conditioner' },
    { name: 'Lemari Arsip', item_category: 'umum', description: 'Lemari arsip dokumen' },
    { name: 'Sofa', item_category: 'umum', description: 'Sofa tamu' },
    { name: 'Meja Rapat', item_category: 'umum', description: 'Meja rapat' },
    { name: 'Proyektor', item_category: 'umum', description: 'Proyektor presentasi' },
    { name: 'Dispenser', item_category: 'umum', description: 'Dispenser air' },
    { name: 'CCTV', item_category: 'umum', description: 'Kamera CCTV' },
    { name: 'Telephone', item_category: 'umum', description: 'Telepon kantor' },
    { name: 'WiFi Router', item_category: 'umum', description: 'Router WiFi' }
];

const seedDatabase = async () => {
    try {
        console.log('🔄 Connecting to database...');
        await connectDB();
        await syncDatabase();

        console.log('🌱 Starting seeding process...\n');

        // 1. Seed Departments
        console.log('📚 Seeding departments...');
        const departments = {};
        for (const dept of departmentsData) {
            const [department, created] = await Department.findOrCreate({
                where: { code: dept.code },
                defaults: dept
            });
            departments[dept.code] = department;
            console.log(`   ${created ? '✅ Created' : '⏭️  Exists'}: ${dept.code} - ${dept.name}`);
        }

        // 2. Seed Item Types
        console.log('\n📦 Seeding item types...');
        
        // Lab items
        console.log('   Lab Items:');
        for (const item of labItemsData) {
            const [itemType, created] = await ItemType.findOrCreate({
                where: { name: item.name, item_category: item.item_category },
                defaults: item
            });
            console.log(`      ${created ? '✅' : '⏭️ '} ${item.name}`);
        }

        // Class items
        console.log('   Class Items:');
        for (const item of classItemsData) {
            const [itemType, created] = await ItemType.findOrCreate({
                where: { name: item.name, item_category: item.item_category },
                defaults: item
            });
            console.log(`      ${created ? '✅' : '⏭️ '} ${item.name}`);
        }

        // General items
        console.log('   General Items:');
        for (const item of generalItemsData) {
            const [itemType, created] = await ItemType.findOrCreate({
                where: { name: item.name, item_category: item.item_category },
                defaults: item
            });
            console.log(`      ${created ? '✅' : '⏭️ '} ${item.name}`);
        }

        // 3. Seed School Rooms (Locations with main_group: 'sekolah')
        console.log('\n🏫 Seeding school rooms...');
        for (let i = 0; i < schoolRoomsData.length; i++) {
            const roomName = schoolRoomsData[i];
            const code = `RNG-${String(i + 1).padStart(3, '0')}`;
            const [location, created] = await Location.findOrCreate({
                where: { code },
                defaults: {
                    name: roomName,
                    main_group: 'sekolah',
                    location_type: 'ruangan',
                    code,
                    description: `Ruangan ${roomName}`
                }
            });
            console.log(`   ${created ? '✅' : '⏭️ '} ${roomName}`);
        }

        // 4. Seed Labs and Classes for each Department
        console.log('\n🔬 Seeding labs and classes for each department...');
        const grades = ['X', 'XI', 'XII'];

        for (const deptCode in departments) {
            const dept = departments[deptCode];
            console.log(`\n   📁 ${deptCode} - ${dept.name}`);

            // Create Labs
            for (let i = 1; i <= dept.total_labs; i++) {
                const code = `LAB-${deptCode}-${i}`;
                const [location, created] = await Location.findOrCreate({
                    where: { code },
                    defaults: {
                        name: `Lab ${deptCode} ${i}`,
                        main_group: 'jurusan',
                        location_type: 'lab',
                        department_id: dept.id,
                        sequence_number: i,
                        code,
                        description: `Laboratorium ${deptCode} nomor ${i}`
                    }
                });
                console.log(`      ${created ? '✅' : '⏭️ '} Lab ${deptCode} ${i}`);
            }

            // Create Classes for each grade
            for (const grade of grades) {
                for (let i = 1; i <= dept.total_classes_per_grade; i++) {
                    const code = `KLS-${grade}-${deptCode}-${i}`;
                    const [location, created] = await Location.findOrCreate({
                        where: { code },
                        defaults: {
                            name: `${grade} ${deptCode} ${i}`,
                            main_group: 'kelas',
                            location_type: 'kelas',
                            department_id: dept.id,
                            grade_level: grade,
                            sequence_number: i,
                            code,
                            description: `Kelas ${grade} ${deptCode} ${i}`
                        }
                    });
                    console.log(`      ${created ? '✅' : '⏭️ '} Kelas ${grade} ${deptCode} ${i}`);
                }
            }
        }

        // 5. Create admin user for seeding assets
        console.log('\n👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const [adminUser, adminCreated] = await User.findOrCreate({
            where: { email: 'admin@sekolah.com' },
            defaults: {
                name: 'Administrator',
                email: 'admin@sekolah.com',
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log(`   ${adminCreated ? '✅ Created' : '⏭️  Exists'}: admin@sekolah.com`);

        console.log('\n✅ Seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Departments: ${departmentsData.length}`);
        console.log(`   - School Rooms: ${schoolRoomsData.length}`);
        console.log(`   - Item Types: ${labItemsData.length + classItemsData.length + generalItemsData.length}`);
        
        // Calculate total locations
        let totalLabs = 0, totalClasses = 0;
        for (const dept of departmentsData) {
            totalLabs += dept.total_labs;
            totalClasses += dept.total_classes_per_grade * 3; // 3 grades
        }
        console.log(`   - Labs: ${totalLabs}`);
        console.log(`   - Classes: ${totalClasses}`);
        console.log(`   - Total Locations: ${schoolRoomsData.length + totalLabs + totalClasses}`);

        // 5. Create default category if not exists
        console.log('\n📂 Creating default category...');
        const [defaultCategory, catCreated] = await Category.findOrCreate({
            where: { name: 'Inventaris Sekolah' },
            defaults: {
                name: 'Inventaris Sekolah',
                description: 'Kategori default untuk inventaris sekolah'
            }
        });
        console.log(`   ${catCreated ? '✅ Created' : '⏭️  Exists'}: Inventaris Sekolah`);

        // 6. Seed Assets for Labs
        console.log('\n🔧 Seeding assets for labs (Barang Jurusan)...');
        const labLocations = await Location.findAll({
            where: { main_group: 'jurusan', location_type: 'lab' },
            include: [{ model: Department, as: 'department' }]
        });

        const labItemTypes = await ItemType.findAll({
            where: { item_category: 'jurusan' }
        });

        let labAssetCount = 0;
        for (const lab of labLocations) {
            for (const itemType of labItemTypes) {
                // Generate random quantities
                const qtyGood = Math.floor(Math.random() * 20) + 5;  // 5-24 bagus
                const qtyFair = Math.floor(Math.random() * 5);       // 0-4 kurang layak
                const qtyDamaged = Math.floor(Math.random() * 3);    // 0-2 rusak
                const totalQty = qtyGood + qtyFair + qtyDamaged;

                const inventoryCode = `INV-LAB-${lab.department?.code || 'XX'}-${itemType.name.substring(0, 3).toUpperCase()}-${String(labAssetCount + 1).padStart(4, '0')}`;

                const [asset, created] = await Asset.findOrCreate({
                    where: { inventory_code: inventoryCode },
                    defaults: {
                        name: `${itemType.name} - ${lab.name}`,
                        inventory_code: inventoryCode,
                        quantity: totalQty,
                        quantity_good: qtyGood,
                        quantity_fair: qtyFair,
                        quantity_damaged: qtyDamaged,
                        condition: qtyGood > 0 ? 'bagus' : (qtyFair > 0 ? 'kurang_layak' : 'rusak'),
                        location_id: lab.id,
                        item_type_id: itemType.id,
                        category_id: defaultCategory.id,
                        created_by: adminUser.id,
                        purchase_date: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                        notes: `${itemType.name} untuk ${lab.name}`
                    }
                });
                if (created) labAssetCount++;
            }
            console.log(`   ✅ ${lab.name}: ${labItemTypes.length} jenis barang`);
        }

        // 7. Seed Assets for Classes
        console.log('\n📚 Seeding assets for classes (Barang Kelas)...');
        const classLocations = await Location.findAll({
            where: { main_group: 'kelas', location_type: 'kelas' },
            include: [{ model: Department, as: 'department' }]
        });

        const classItemTypes = await ItemType.findAll({
            where: { item_category: 'kelas' }
        });

        let classAssetCount = 0;
        for (const kelas of classLocations) {
            for (const itemType of classItemTypes) {
                let qtyGood, qtyFair, qtyDamaged;
                
                // Set realistic quantities based on item type
                if (itemType.name === 'Kursi' || itemType.name === 'Meja') {
                    qtyGood = Math.floor(Math.random() * 10) + 30;  // 30-39 bagus
                    qtyFair = Math.floor(Math.random() * 5);         // 0-4 kurang layak
                    qtyDamaged = Math.floor(Math.random() * 3);      // 0-2 rusak
                } else if (itemType.name === 'Board') {
                    qtyGood = 1;
                    qtyFair = 0;
                    qtyDamaged = 0;
                } else { // Lemari
                    qtyGood = Math.floor(Math.random() * 2) + 1;  // 1-2
                    qtyFair = 0;
                    qtyDamaged = 0;
                }

                const totalQty = qtyGood + qtyFair + qtyDamaged;
                const inventoryCode = `INV-KLS-${kelas.department?.code || 'XX'}-${kelas.grade_level || 'X'}-${itemType.name.substring(0, 3).toUpperCase()}-${String(classAssetCount + 1).padStart(4, '0')}`;

                const [asset, created] = await Asset.findOrCreate({
                    where: { inventory_code: inventoryCode },
                    defaults: {
                        name: `${itemType.name} - ${kelas.name}`,
                        inventory_code: inventoryCode,
                        quantity: totalQty,
                        quantity_good: qtyGood,
                        quantity_fair: qtyFair,
                        quantity_damaged: qtyDamaged,
                        condition: qtyGood > 0 ? 'bagus' : (qtyFair > 0 ? 'kurang_layak' : 'rusak'),
                        location_id: kelas.id,
                        item_type_id: itemType.id,
                        category_id: defaultCategory.id,
                        created_by: adminUser.id,
                        purchase_date: new Date(2018 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                        notes: `${itemType.name} untuk ${kelas.name}`
                    }
                });
                if (created) classAssetCount++;
            }
        }
        console.log(`   ✅ Total ${classLocations.length} kelas x ${classItemTypes.length} jenis barang = ${classLocations.length * classItemTypes.length} assets`);

        // 8. Seed Assets for School Rooms
        console.log('\n🏢 Seeding assets for school rooms (Barang Sekolah)...');
        const schoolLocations = await Location.findAll({
            where: { main_group: 'sekolah', location_type: 'ruangan' }
        });

        const generalItemTypes = await ItemType.findAll({
            where: { item_category: 'umum' }
        });

        let schoolAssetCount = 0;
        for (const room of schoolLocations) {
            // Each room gets 3-6 random item types
            const numItems = Math.floor(Math.random() * 4) + 3;
            const shuffledItems = generalItemTypes.sort(() => 0.5 - Math.random()).slice(0, numItems);

            for (const itemType of shuffledItems) {
                const qtyGood = Math.floor(Math.random() * 5) + 1;  // 1-5
                const qtyFair = Math.floor(Math.random() * 2);       // 0-1
                const qtyDamaged = Math.floor(Math.random() * 2);    // 0-1
                const totalQty = qtyGood + qtyFair + qtyDamaged;

                const inventoryCode = `INV-SKL-${room.code.replace('RNG-', '')}-${itemType.name.substring(0, 3).toUpperCase()}-${String(schoolAssetCount + 1).padStart(4, '0')}`;

                const [asset, created] = await Asset.findOrCreate({
                    where: { inventory_code: inventoryCode },
                    defaults: {
                        name: `${itemType.name} - ${room.name}`,
                        inventory_code: inventoryCode,
                        quantity: totalQty,
                        quantity_good: qtyGood,
                        quantity_fair: qtyFair,
                        quantity_damaged: qtyDamaged,
                        condition: qtyGood > 0 ? 'bagus' : (qtyFair > 0 ? 'kurang_layak' : 'rusak'),
                        location_id: room.id,
                        item_type_id: itemType.id,
                        category_id: defaultCategory.id,
                        created_by: adminUser.id,
                        purchase_date: new Date(2015 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                        notes: `${itemType.name} untuk ${room.name}`
                    }
                });
                if (created) schoolAssetCount++;
            }
            console.log(`   ✅ ${room.name}: ${shuffledItems.length} jenis barang`);
        }

        // Final Summary
        const totalAssets = await Asset.count();
        const totalLocations = await Location.count();

        console.log('\n' + '='.repeat(50));
        console.log('📊 FINAL SUMMARY');
        console.log('='.repeat(50));
        console.log(`   📁 Departments: ${departmentsData.length}`);
        console.log(`   🏫 School Rooms: ${schoolRoomsData.length}`);
        console.log(`   🔬 Labs: ${totalLabs}`);
        console.log(`   📚 Classes: ${totalClasses}`);
        console.log(`   📍 Total Locations: ${totalLocations}`);
        console.log(`   📦 Item Types: ${labItemsData.length + classItemsData.length + generalItemsData.length}`);
        console.log(`   🗂️  Total Assets: ${totalAssets}`);
        console.log('='.repeat(50));
        console.log('✅ Seeding completed successfully!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();
