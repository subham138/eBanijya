const mysql = require('mysql');

// For Local
// const db = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'ebanijya'
// });

// For Server https://apiebanijya.opentech4u.co.in
// const db = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'ebanijya_user',
//     password: 'SynergicWeb@2020',
//     database: 'ebanijya'
// });

// For Server https://api.ebanijyo.com
const db = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'ebanijyo_user',
    password: 'Ebanijyo@2022',
    database: 'ebanijyo'
});

db.getConnection((err, connection) => {
    if (err) console.log(err);
    connection.release();
    return;
})

module.exports = db;