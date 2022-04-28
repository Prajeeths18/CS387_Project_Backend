const db = require('../db');

async function register(username, password, address, latitude, longitude, mobile, email) {
    const query = `
        WITH usid AS (
            INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'CUSTOMER') RETURNING user_id
        ), q1 AS (
            INSERT INTO coordinates (latitude, longitude, gen_address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
        ), q2 AS (
            INSERT INTO customer (customer_id,mobile_no,email) SELECT user_id,$6,$7 FROM usid
        )
        INSERT INTO customer_address (customer_id,latitude,longitude) SELECT user_id,$4,$5 FROM usid;
    `
    const result = await db.query(query,[username,password,address,latitude,longitude,mobile,email]).catch(e=>e);
    return { result };
}

exports.register = register;