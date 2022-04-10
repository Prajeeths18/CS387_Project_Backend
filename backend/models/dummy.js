const db = require('../db');


async function dummy() {
    const dummyQuery = `
        SELECT * FROM gen_user;
    `;
    const dummyResult = await db.query(dummyQuery).catch(e=>e);
    return dummyResult
}

exports.dummy = dummy;