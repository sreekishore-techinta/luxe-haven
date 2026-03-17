const express = require('express');
const cors = require('cors');
const path = require('path');
const blouseRoutes = require('./routes/blouseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serving static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/blouse', blouseRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
