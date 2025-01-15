const { sql, poolPromise } = require('../config/dbconfig');

// Отримати список співробітників
async function getEmployees() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Employees');
        return result.recordset;
    } catch (err) {
        console.error('Error fetching employees:', err);
        throw err;
    }
}

// Додати співробітника
async function addEmployee(name, email, phoneNumber) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .input('PhoneNumber', sql.NVarChar, phoneNumber)
            .query(`
                INSERT INTO Employees (Name, Email, PhoneNumber) 
                VALUES (@Name, @Email, @PhoneNumber)
            `);
        return result.rowsAffected[0];
    } catch (err) {
        console.error('Error adding employee:', err);
        throw err;
    }
}

module.exports = { getEmployees, addEmployee };