const express = require('express');
const dbService = require('../services/dbService');
const router = express.Router();

// Отримати всіх співробітників
router.get('/employees', async (req, res) => {
    try {
        const employees = await dbService.getEmployees();
        res.status(200).json(employees);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

// Додати співробітника
router.post('/employees', async (req, res) => {
    const { name, email, phoneNumber } = req.body;
    try {
        const result = await dbService.addEmployee(name, email, phoneNumber);
        res.status(200).json({ message: `${result} employee(s) added successfully.` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add employee' });
    }
});

module.exports = router;
