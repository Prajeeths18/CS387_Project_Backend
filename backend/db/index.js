require('dotenv').config();
const pg = require('pg');
pg.defaults.parseInt8 = true;

const pool = new pg.Pool();
pool.connect();

module.exports = {
  query: async (text, params) => {
    return await pool.query(text, params).catch(e=>e);
  },
  terminate: () => {
    pool.end();
  },
  pool: pool
}