const db = require('../db');
const bcrypt = require('bcrypt');
const auth = require('./auth');

async function login(username, password) {
    const query = `
        SELECT user_id,username,password,role,valid FROM gen_user WHERE username=$1;
    `
    const user = await db.query(query,[username]).catch(e=>e).then(x=>x.rows[0]);
    const isCorrect = await bcrypt.compare(password,user.password);
    if (isCorrect) {
        return auth.getToken(user.user_id,user.username,user.role,user.valid);
    } else {
        return null;
    }
}

exports.login = login;