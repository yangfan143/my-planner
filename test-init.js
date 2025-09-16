// test-init.js
const initDatabase = require('./src/db/schema');
initDatabase();
console.log('Database initialization attempted. Check data.db file.');