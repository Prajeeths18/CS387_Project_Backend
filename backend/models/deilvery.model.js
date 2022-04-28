const db = require('../db');
// const pgp = require('pg-promise');
const bcrypt = require('bcrypt');

async function register(username, password, vaccination_status, mobile, email) {
    const query = `
    BEGIN;
    WITH usid AS (
        INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'DELIVERY') RETURNING user_id
    )
    INSERT INTO delivery (delivery_id,mobile_no,email,vaccination_status) SELECT (user_id,$3,$4,$5) FROM usid;
    COMMIT;
    `
    // console.log(pgp.as.format(query,[username,await bcrypt.hash(password,10),address,latitude,longitude,mobile,email]));
    const result = await db.query(query,[username,await bcrypt.hash(password,10),vaccination_status,mobile,email]).catch(e=>e);
    return { result };
}

async function update(delivery_id, mobile, email) {
    const fetch = 'SELECT * from delivery WHERE delivery_id = $1;'
    const userDefault = await db.query(fetch,[delivery_id]).catch(e=>e);
    if (userDefault.rows.length === 0) {
        return userDefault;
    } else {
        mobile = mobile?mobile:userDefault.rows[0].mobile_no;
        email = email?email:userDefault.rows[0].email;
    }
    const updateQuery = 'UPDATE delivery SET mobile_no=$2,email=$3 WHERE delivery_id=$1;'
    const result = await db.query(updateQuery,[delivery_id, mobile, email]).catch(e=>e);
    return { result };
}

async function availability(delivery_id,available){

    const query = ` UPDATE delivery SET available=$2 WHERE delivery_id=$1;
    `
    const result = await db.query(query,[delivery_id,available]).catch(e>=e);
    return {result};
}

exports.register = register
exports.update = update
exports.availability = availability