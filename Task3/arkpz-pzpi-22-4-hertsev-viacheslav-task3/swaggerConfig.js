const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Опис документації
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Employee Management API',
            version: '1.0.0',
            description: 'API для управління співробітниками',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Локальний сервер',
            },
        ],
    },
    apis: ['./routes/*.js'], // Шлях до файлів з документацією
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerDocs, swaggerUi };