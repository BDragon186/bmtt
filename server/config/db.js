const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

// --- SQLite Configuration ---
const sqliteDb = new Database(':memory:');
const initSqlPath = path.join(__dirname, '../../database/init.sql');
const initSql = fs.readFileSync(initSqlPath, 'utf8');
sqliteDb.exec(initSql);
console.log('✅ SQLite initialized in-memory');

// --- MongoDB Configuration ---
let mongoClient = null;
let mongoDb = null;

async function startMongo() {
  try {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    
    mongoDb = mongoClient.db('vulnauth');
    
    // Clear and Seed
    const usersCol = mongoDb.collection('users');
    await usersCol.deleteMany({});
    await usersCol.insertMany([
      { username: 'admin', password: 'admin123' },
      { username: 'test', password: '123456' }
    ]);
    
    console.log(`✅ MongoDB in-memory initialized at ${uri}`);
  } catch (error) {
    console.error('❌ MongoDB initialization error:', error);
  }
}

function getMongoDb() {
  if (!mongoDb) {
    throw new Error('MongoDB not initialized yet');
  }
  return mongoDb;
}

module.exports = {
  sqliteDb,
  startMongo,
  getMongoDb
};
