const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/apiRoutes');
const { swaggerDocs, swaggerUi } = require('./swaggerConfig');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/api', apiRoutes);

// Swagger документація
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
