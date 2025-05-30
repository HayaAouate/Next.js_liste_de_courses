const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'mariadb',
  user: 'root',
  password: 'root',
  database: 'courses'
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT 1 as test");
    console.log(rows);
    conn.release();
  } catch (err) {
    console.error("Erreur de connexion à MariaDB :", err);
  }
}

testConnection();

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('API en ligne !');
});

app.listen(3001, () => {
  console.log('Serveur backend écoute sur le port 3001');
});
