const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
        tool VARCHAR(50) PRIMARY KEY,
        count INT DEFAULT 0
    );
`).catch(err => console.error("Database connection/init error:", err));

app.get('/api/votes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM votes ORDER BY count DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/votes', async (req, res) => {
    const { tool } = req.body;
    if (!tool) return res.status(400).json({ error: 'Tool name is required' });

    try {
        await pool.query(`
            INSERT INTO votes (tool, count) VALUES ($1, 1)
            ON CONFLICT (tool) DO UPDATE SET count = votes.count + 1;
        `, [tool]);
        res.json({ message: `Vote registered for ${tool}` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to register vote' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend API listening on port ${port}`));
