const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
const port = 5000;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_FCecHIZ27wBR@ep-delicate-moon-a1o5r42f-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

app.use(cors());

app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/products', async (req, res) => {
  const { category } = req.query;
  try {
    let result;
    if (category) {
      result = await pool.query('SELECT * FROM products WHERE category = $1', [category]);
    } else {
      result = await pool.query('SELECT * FROM products');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/banners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/deal-of-the-day', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, ((purchase_price - price) / purchase_price) AS discount_percent
      FROM products
      WHERE purchase_price IS NOT NULL AND price IS NOT NULL
      ORDER BY discount_percent DESC
      LIMIT 1
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports.handler = serverless(app);