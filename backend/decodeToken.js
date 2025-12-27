const jwt = require('jsonwebtoken');

// Paste your token here (the one you got from login or register)
const token = 'PASTE_YOUR_TOKEN_HERE';

console.log(jwt.decode(token));
