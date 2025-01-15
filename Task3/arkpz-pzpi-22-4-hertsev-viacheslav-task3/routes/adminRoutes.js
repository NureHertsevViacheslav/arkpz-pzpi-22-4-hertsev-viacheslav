const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/dbconfig');

// Перевірити статус сервера
router.get('/admin/status', (req, res) => {
    res.status(200).json({ status: 'Server is running', uptime: process.uptime() });
});

// Видалити користувача (адміністративна дія)
router.delete('/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Users WHERE UserID = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

router.get('/admin/dashboard', async (req, res) => {
    try {
        const pool = await poolPromise;

        const roomUsageQuery = `
            SELECT RoomID, COUNT(*) AS BookingCount
            FROM Bookings
            GROUP BY RoomID
        `;
        const usageStats = await pool.request().query(roomUsageQuery);

        res.status(200).json({ roomUsage: usageStats.recordset });
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
});

router.get('/admin/analytics/trends', async (req, res) => {
    try {
        const pool = await poolPromise;
        const trendsQuery = `
            SELECT FORMAT(StartTime, 'yyyy-MM') AS Month, COUNT(*) AS TotalBookings
            FROM Bookings
            GROUP BY FORMAT(StartTime, 'yyyy-MM')
            ORDER BY Month
        `;
        const trends = await pool.request().query(trendsQuery);
        res.status(200).json(trends.recordset);
    } catch (err) {
        console.error('Error fetching booking trends:', err);
        res.status(500).json({ error: 'Failed to fetch booking trends' });
    }
});

module.exports = router;
