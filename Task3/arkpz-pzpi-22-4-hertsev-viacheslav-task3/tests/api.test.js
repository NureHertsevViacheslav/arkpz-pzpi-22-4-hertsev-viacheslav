const { queryDatabase } = require('../query'); // Імпорт функції
const request = require('supertest');
const app = require('../app'); // Ваш додаток Express

// Тестування підключення до бази даних
async function testConnection() {
    try {
        console.log('Testing database connection...');
        const result = await queryDatabase('SELECT 1 AS TestValue'); // Пробний запит
        console.log('Connection successful! Result:', result);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testConnection();

// Тест на отримання списку користувачів
describe('GET /api/users', () => {
    it('повертає список користувачів зі статусом 200', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array); // Перевірка, що результат — масив
        if (response.body.length > 0) {
            expect(response.body[0]).toHaveProperty('UserID');
            expect(response.body[0]).toHaveProperty('Username');
            expect(response.body[0]).toHaveProperty('Email');
        }
    });
});

// Тест на додавання користувача
describe('POST /api/users', () => {
    it('додає нового користувача та повертає статус 201', async () => {
        const newUser = { username: 'JohasdnDoe', email: 'johasn.asdoe@example.com', password: 'password123', role: 'Employee' };
        const response = await request(app)
            .post('/api/users')
            .send(newUser);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'User added successfully');
    });

    it('повертає помилку 400, якщо дані неповні', async () => {
        const newUser = { username: 'JohnDoe', email: 'john.doe@example.com' }; // Відсутній пароль
        const response = await request(app)
            .post('/api/users')
            .send(newUser);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'All fields are required: username, passwordHash, email, role');
    });
});

// Тест для створення бронювання
describe('POST /api/bookings', () => {
    it('створює нове бронювання зі статусом 201', async () => {
        const newBooking = {
            userId: 35,
            roomId: 1,
            startTime: '2025-01-10T10:00:00Z',
            endTime: '2025-01-10T12:00:00Z'
        };
        const response = await request(app).post('/api/bookings').send(newBooking);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Booking created successfully');
    });
// Тест на видалення користувача
describe('DELETE /api/admin/users/:id', () => {
    it('видаляє користувача за ID та повертає статус 200', async () => {
        const userId = 38 // Тестовий ID
        const response = await request(app).delete(`/api/admin/users/${userId}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('повертає помилку 404, якщо користувач не знайдений', async () => {
        const userId = 999; // ID, якого немає в БД
        const response = await request(app).delete(`/api/admin/users/${userId}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found');
    });
});

// Тест на перевірку статусу сервера
describe('GET /api/admin/status', () => {
    it('повертає статус сервера та час роботи', async () => {
        const response = await request(app).get('/api/admin/status');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'Server is running');
        expect(response.body).toHaveProperty('uptime'); // Перевірка наявності uptime
    });
});

// Тест для отримання списку кімнат
describe('GET /api/rooms', () => {
    it('повертає список кімнат зі статусом 200', async () => {
        const response = await request(app).get('/api/rooms');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('фільтрує кімнати за ємністю', async () => {
        const response = await request(app).get('/api/rooms?capacity=10');
        expect(response.status).toBe(200);
        response.body.forEach(room => {
            expect(room.Capacity).toBeGreaterThanOrEqual(10);
        });
    });
});


    it('повертає помилку 409, якщо кімната зайнята', async () => {
        const conflictingBooking = {
            userId: 35,
            roomId: 1,
            startTime: '2025-01-10T11:00:00Z',
            endTime: '2025-01-10T13:00:00Z'
        };
        const response = await request(app).post('/api/bookings').send(conflictingBooking);
        expect(response.status).toBe(409);
        expect(response.body).toHaveProperty('error', 'Room is already booked during the selected time');
    });
});

// Тест для адміністративної панелі
describe('GET /api/admin/dashboard', () => {
    it('повертає статистику використання кімнат зі статусом 200', async () => {
        const response = await request(app).get('/api/admin/dashboard');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('roomUsage');
        expect(response.body.roomUsage).toBeInstanceOf(Array);
    });
});

// Тест для бронювальних трендів
describe('GET /api/admin/analytics/trends', () => {
    it('повертає тренди бронювань зі статусом 200', async () => {
        const response = await request(app).get('/api/admin/analytics/trends');
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        response.body.forEach(trend => {
            expect(trend).toHaveProperty('Month');
            expect(trend).toHaveProperty('TotalBookings');
        });
    });
});