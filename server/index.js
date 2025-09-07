const express = require('express');
const { Pool } = require('pg');
//const cors = require('cors');

const app = express();
const port = 5000;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_FCecHIZ27wBR@ep-delicate-moon-a1o5r42f-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

app.use(express.json());

app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/product_variants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product_variants');
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
    const products = result.rows;

       const productIds = products.map(p => p.id);
    let variants = [];

    if (productIds.length > 0) {
      const variantResult = await pool.query(
        'SELECT * FROM product_variant WHERE product_id = ANY($1)',
        [productIds]
      );
      variants = variantResult.rows;
    }

    // 3. Attach variants to products
    const productsWithVariants = products.map(product => ({
      ...product,
      product_variants: variants.filter(v => v.product_id === product.id)
    }));

    res.json(productsWithVariants);

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

app.listen(process.env.PORT,() => console.log(`Server is running on port ${port}`));