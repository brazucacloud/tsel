const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Importar modelos
const Admin = require('../models/Admin');
const Device = require('../models/Device');
const Task = require('../models/Task');

async function setupDatabase() {
    console.log('🔧 Configurando banco de dados...');
    
    try {
        // Conectar ao MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chip-warmup';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ Conectado ao MongoDB');
        
        // Criar índices
        console.log('📊 Criando índices...');
        
        // Índices para Admin
        await Admin.collection.createIndex({ email: 1 }, { unique: true });
        
        // Índices para Device
        await Device.collection.createIndex({ deviceId: 1 }, { unique: true });
        await Device.collection.createIndex({ status: 1 });
        await Device.collection.createIndex({ lastSeen: 1 });
        
        // Índices para Task
        await Task.collection.createIndex({ deviceId: 1 });
        await Task.collection.createIndex({ status: 1 });
        await Task.collection.createIndex({ priority: 1 });
        await Task.collection.createIndex({ createdAt: 1 });
        await Task.collection.createIndex({ scheduledAt: 1 });
        
        console.log('✅ Índices criados');
        
        // Criar administrador padrão se não existir
        console.log('👤 Criando administrador padrão...');
        await Admin.createDefaultAdmin();
        
        // Criar administrador de teste
        console.log('🧪 Criando administrador de teste...');
        
        const testEmail = 'test@chipwarmup.com';
        const testPassword = 'test123';
        
        const existingTest = await Admin.findOne({ email: testEmail });
        
        if (!existingTest) {
            const testAdmin = new Admin({
                name: 'Usuário Teste',
                email: testEmail,
                password: testPassword,
                role: 'admin',
                isActive: true,
                permissions: [
                    {
                        resource: 'devices',
                        actions: ['read', 'update']
                    },
                    {
                        resource: 'tasks',
                        actions: ['read', 'create']
                    },
                    {
                        resource: 'analytics',
                        actions: ['read']
                    }
                ]
            });
            
            await testAdmin.save();
            console.log('✅ Administrador de teste criado');
            console.log(`   Email: ${testEmail}`);
            console.log(`   Senha: ${testPassword}`);
        } else {
            console.log('✅ Administrador de teste já existe');
        }
        
        // Criar dispositivo de exemplo
        console.log('📱 Criando dispositivo de exemplo...');
        
        const existingDevice = await Device.findOne({ deviceId: 'test-device-001' });
        
        if (!existingDevice) {
            const testDevice = new Device({
                deviceId: 'test-device-001',
                deviceName: 'Dispositivo Teste',
                model: 'Samsung Galaxy S21',
                androidVersion: '12',
                appVersion: '1.0.0',
                manufacturer: 'Samsung',
                isOnline: true,
                lastSeen: new Date(),
                registrationDate: new Date(),
                capabilities: {
                    whatsapp: true,
                    instagram: true,
                    telegram: true,
                    facebook: true,
                    twitter: true,
                    youtube: true,
                    tiktok: true
                }
            });
            
            await testDevice.save();
            console.log('✅ Dispositivo de exemplo criado');
        } else {
            console.log('✅ Dispositivo de exemplo já existe');
        }
        
        console.log('🎉 Configuração do banco de dados concluída!');
        
    } catch (error) {
        console.error('❌ Erro ao configurar banco de dados:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    setupDatabase();
}

module.exports = setupDatabase; 