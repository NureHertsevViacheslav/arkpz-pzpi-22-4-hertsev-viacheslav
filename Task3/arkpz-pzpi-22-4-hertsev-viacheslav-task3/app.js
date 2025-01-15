const express = require('express');
const bodyParser = require('body-parser');
const { swaggerDocs, swaggerUi } = require('./swaggerConfig.js');
const userRoutes = require('./routes/apiRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/api', userRoutes);
app.use('/api', adminRoutes);
// Головний маршрут
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Swagger документація
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

// if (process.env.NODE_ENV !== 'test') {
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }

module.exports = app;