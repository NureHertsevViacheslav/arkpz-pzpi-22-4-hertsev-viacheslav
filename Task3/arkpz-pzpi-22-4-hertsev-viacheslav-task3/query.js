const { sql, poolPromise } = require('./config/dbconfig');

async function queryDatabase(query, params = []) {
    try {
        const pool = await poolPromise; // Отримати підключення з пулу
        const request = pool.request();

        // Додати параметри до запиту
        params.forEach(({ name, type, value }) => {
            request.input(name, type, value);
        });

        const result = await request.query(query);
        return result.recordset; // Повернути записи
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
}

module.exports = { queryDatabase };