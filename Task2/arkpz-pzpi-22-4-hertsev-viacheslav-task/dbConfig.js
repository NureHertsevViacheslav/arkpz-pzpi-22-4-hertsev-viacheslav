const sql = require('mssql');

// Конфігурація для підключення до бази даних
const dbConfig = {
    user: 'your_username',
    password: 'your_password',
    server: 'your_server',
    database: 'your_database',
    options: {
        encrypt: true, // Якщо потрібне шифрування
        trustServerCertificate: true, // Для локального сервера
    },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then((pool) => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch((err) => console.error('Database Connection Failed!', err));

module.exports = { sql, poolPromise };
