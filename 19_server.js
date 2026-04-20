const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
user: 'postgres',
host: 'localhost',
database: 'mydatabase',
password: 'zxc',
port: 5432,
});   

const createQuery = `CREATE TABLE IF NOT EXISTS users (
      id        SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name  VARCHAR(100) NOT NULL,
      age        INTEGER NOT NULL,
      created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT)`;

pool.query(createQuery).then(()=>console.log("Таблица подключена")).catch((err) => console.error(err))




app.post('/api/users', async (req, res) => {
  const { first_name, last_name, age } = req.body;
  if (!first_name || !last_name || age === undefined) {
    return res.status(400).json({ error: 'Поля first_name, last_name, age обязательны' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, age)
       VALUES ($1, $2, $3) RETURNING *`,
      [first_name, last_name, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.patch('/api/users/:id', async (req, res) => {
  const { first_name, last_name, age } = req.body;
  const now = Math.floor(Date.now() / 1000);

  const fields = [];
  const values = [];
  let idx = 1;

  if (first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(first_name); }
  if (last_name !== undefined)  { fields.push(`last_name = $${idx++}`);  values.push(last_name); }
  if (age !== undefined)        { fields.push(`age = $${idx++}`);        values.push(age); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Нет полей для обновления' });
  }

  fields.push(`updated_at = $${idx++}`);
  values.push(now);
  values.push(req.params.id);

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ message: 'Пользователь удалён', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => {
  console.log("server started on http://localhost:3000")
})
