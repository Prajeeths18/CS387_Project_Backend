require('dotenv').config();
const jwt = require('jsonwebtoken');

function generateAccessToken(user_id, username, role, valid) {
  return jwt.sign({ user_id, username, role, valid }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]
  // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQ1VTVE9NRVIiLCJpYXQiOjE2NTExMzAyMDIsImV4cCI6MTY1MTEzMjAwMn0.SZhdpLqEHGaZg-mD3C8e7qUXB_ig8_RavO6xuLvTmNM"
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)

    req.user = user

    next()
  });
}

exports.authenticateToken = authenticateToken