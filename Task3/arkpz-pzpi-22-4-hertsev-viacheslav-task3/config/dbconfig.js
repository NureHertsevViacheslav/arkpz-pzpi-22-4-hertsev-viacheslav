const sql = require('mssql');

// Налаштування підключення до бази даних
const config = {
    server: 'DESKTOP-EDVVQM9', // Ім'я сервера
    database: 'ette', // Назва бази даних
    user: 'slavyao', // Ім'я користувача SQL Server
    password: '123', // Пароль користувача
    options: {
        encrypt: false, // Вимкнути SSL
        trustServerCertificate: true, // Довіряти сертифікату сервера
    },
};

// Створення пулу підключень
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch((err) => {
        console.error('Database Connection Failed!', err);
        throw err;
    });

// Експортуємо конфігурацію та пул підключень
module.exports = { sql, poolPromise };

