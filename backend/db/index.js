require('dotenv').config()
const pg = require('pg');
const { equal } = require('assert');
pg.defaults.parseInt8 = true;

if(!global.pool){
  global.pool = new pg.Pool();
}

module.exports = {
  init: () => {
    if(!global.pool){
      global.pool = new pg.Pool();
    }
  },
  query: async (text, params) => {
    return await global.pool.query(text, params).catch(e=>e);
  },
  terminate: async () => {
    await global.pool.end();
    global.pool = undefined;
  },
  pool: global.pool,
  transaction: async (queries, queryParams) => {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    equal(queries.length,queryParams.length);
    const client = await global.pool.connect()
    try {
      await client.query('BEGIN')
      let result = Array(queries.length);
      for(let i=0; i<queries.length; i++){
        result[i] = await client.query(queries[i],queryParams[i]);
      }
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  }
}