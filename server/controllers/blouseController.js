const db = require('../config/db');

// Create new blouse style
exports.createBlouse = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const image = req.file ? `uploads/blouse/${req.file.filename}` : null;

        if (!name || !price) {
            return res.status(400).json({ status: 'error', message: 'Name and price are required' });
        }

        const [result] = await db.execute(
            'INSERT INTO blouse_styles (name, description, image, price, category) VALUES (?, ?, ?, ?, ?)',
            [name, description, image, price, category]
        );

        res.status(201).json({
            status: 'success',
            message: 'Blouse style created successfully',
            id: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Get all blouse styles (where status = true)
exports.getAllBlouses = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM blouse_styles WHERE status = 1 ORDER BY created_at DESC');
        res.json({ status: 'success', data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Get single blouse style
exports.getBlouseById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM blouse_styles WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Blouse style not found' });
        }
        res.json({ status: 'success', data: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

// Delete blouse style
exports.deleteBlouse = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM blouse_styles WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Blouse style not found' });
        }
        res.json({ status: 'success', message: 'Blouse style deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
