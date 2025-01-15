const express = require('express');
const dbService = require('../services/dbService');
const router = express.Router();
const { poolPromise, sql } = require('../config/dbconfig');
/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Отримати список співробітників
 *     responses:
 *       200:
 *         description: Успішний запит
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Унікальний ідентифікатор співробітника
 *                   name:
 *                     type: string
 *                     description: Ім'я співробітника
 *                   email:
 *                     type: string
 *                     description: Електронна пошта співробітника
 *                   phoneNumber:
 *                     type: string
 *                     description: Номер телефону співробітника
 */

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Додати нового співробітника
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Ім'я співробітника
 *               email:
 *                 type: string
 *                 description: Електронна пошта співробітника
 *               phoneNumber:
 *                 type: string
 *                 description: Номер телефону співробітника
 *     responses:
 *       200:
 *         description: Успішно додано співробітника
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Підтвердження додавання
 */

// Отримати всіх користувачів
router.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT UserID, Username, Email, Role FROM Users');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Додати нового користувача
router.post('/users', async (req, res) => {
    const { username, email, password, role } = req.body;

    // Перевірка даних
    if (!username || !email || !password || !role) {
        return res.status(400).json({ error: 'All fields are required: username, passwordHash, email, role' });
    }

    // Перевірка валідності ролі
    if (!['Admin', 'Employee'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('passwordHash', sql.NVarChar, password) // Хешування пароля рекомендується!
            .input('role', sql.NVarChar, role)
            .query('INSERT INTO Users (Username, Email, PasswordHash, Role) VALUES (@username, @email, @passwordHash, @role)');
        res.status(201).json({ message: 'User added successfully' });
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

// Fetch available rooms with filters
router.get('/rooms', async (req, res) => {
    const { capacity, equipment } = req.query;
    try {
        const pool = await poolPromise;
        let query = 'SELECT * FROM Rooms WHERE 1=1';
        if (capacity) query += ' AND Capacity >= @capacity';
        if (equipment) query += ' AND Equipment LIKE @equipment';
        
        const request = pool.request();
        if (capacity) request.input('capacity', sql.Int, capacity);
        if (equipment) request.input('equipment', sql.NVarChar, `%${equipment}%`);

        const result = await request.query(query);
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Create a booking
router.post('/bookings', async (req, res) => {
    const { userId, roomId, startTime, endTime } = req.body;
    try {
        const pool = await poolPromise;

        // Check for conflicts
        const conflictQuery = `
            SELECT * FROM Bookings
            WHERE RoomID = @roomId AND 
            ((@startTime BETWEEN StartTime AND EndTime) OR 
            (@endTime BETWEEN StartTime AND EndTime) OR 
            (StartTime BETWEEN @startTime AND @endTime))
        `;
        const conflictCheck = await pool.request()
            .input('roomId', sql.Int, roomId)
            .input('startTime', sql.DateTime, startTime)
            .input('endTime', sql.DateTime, endTime)
            .query(conflictQuery);

        if (conflictCheck.recordset.length > 0) {
            return res.status(409).json({ error: 'Room is already booked during the selected time' });
        }

        // Insert booking
        const insertQuery = `
            INSERT INTO Bookings (UserID, RoomID, StartTime, EndTime)
            VALUES (@userId, @roomId, @startTime, @endTime)
        `;
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('roomId', sql.Int, roomId)
            .input('startTime', sql.DateTime, startTime)
            .input('endTime', sql.DateTime, endTime)
            .query(insertQuery);

        res.status(201).json({ message: 'Booking created successfully' });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

module.exports = router;